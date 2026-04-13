import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import crypto from 'node:crypto'

function cloudinaryDestroyPlugin(env) {
  const cloudName = env.CLOUDINARY_CLOUD_NAME
  const apiKey = env.CLOUDINARY_API_KEY
  const apiSecret = env.CLOUDINARY_API_SECRET

  const isConfigured = Boolean(cloudName && apiKey && apiSecret)

  const handler = async (req, res, next) => {
    if (!req.url?.startsWith('/api/cloudinary/destroy')) return next()

    if (!isConfigured) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: {
            message:
              'Cloudinary server env vars are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.',
          },
        })
      )
      return
    }

    if (req.method !== 'POST') {
      res.statusCode = 405
      res.setHeader('Allow', 'POST')
      res.end('Method Not Allowed')
      return
    }

    try {
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      const bodyRaw = Buffer.concat(chunks).toString('utf-8')
      const body = bodyRaw ? JSON.parse(bodyRaw) : {}

      const publicId = body?.publicId
      const resourceType = body?.resourceType || 'image'

      if (!publicId || typeof publicId !== 'string') {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: { message: 'publicId is required' } }))
        return
      }

      const timestamp = Math.floor(Date.now() / 1000)
      const signatureBase = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
      const signature = crypto.createHash('sha1').update(signatureBase).digest('hex')

      const params = new URLSearchParams({
        public_id: publicId,
        api_key: apiKey,
        timestamp: String(timestamp),
        signature,
      })

      const destroyUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`
      const destroyRes = await fetch(destroyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })

      const json = await destroyRes.json().catch(() => ({}))
      res.statusCode = destroyRes.status
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(json))
    } catch (e) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: { message: e instanceof Error ? e.message : 'Server error' } }))
    }
  }

  return {
    name: 'cloudinary-destroy',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), cloudinaryDestroyPlugin(env)],
  }
})
