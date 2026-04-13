import { useState } from 'react'
import '../App.css'
import uploadIcon from '../assets/upload.svg'

const CLOUD_NAME = 'ddbnfzbgl'
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

const withCacheBust = (url, version) => {
  if (!url) return ''
  if (!version) return url
  const joiner = url.includes('?') ? '&' : '?'
  return `${url}${joiner}v=${encodeURIComponent(String(version))}`
}


const UPLOAD_SETS = [
  {
    key: 'set1',
    title: 'Set 1',
    uploadPreset: 'set1_preset',
    folder: 'set1',
    publicIdName: 'Food1',
  },
  {
    key: 'set2',
    title: 'Set 2',
    uploadPreset: 'set2_preset',
    folder: 'set2',
    publicIdName: 'Food2',
  },
  {
    key: 'set3',
    title: 'Set 3',
    uploadPreset: 'set3_preset',
    folder: 'set3',
    publicIdName: 'Food3',
  },
  {
    key: 'set4',
    title: 'Set 4',
    uploadPreset: 'set4_preset',
    folder: 'set4',
    publicIdName: 'Food4',
  },
]

function App() {
  const [statusBySet, setStatusBySet] = useState(() => {
    const base = Object.fromEntries(
      UPLOAD_SETS.map((s) => [
        s.key,
        {
          loading: false,
          error: '',
          message: '',
          url: '',
          publicId: '',
          version: '',
        },
      ])
    )

    for (const setKey of Object.keys(base)) {
      try {
        const raw = localStorage.getItem(`cloudinary:${setKey}`)
        if (!raw) continue
        const saved = JSON.parse(raw)
        if (saved?.publicId && typeof saved.publicId === 'string') {
          base[setKey].publicId = saved.publicId
        }
        if (saved?.url && typeof saved.url === 'string') {
          base[setKey].url = saved.url
        }
        if (
          (typeof saved?.version === 'string' && saved.version) ||
          (typeof saved?.version === 'number' && Number.isFinite(saved.version))
        ) {
          base[setKey].version = saved.version
        }
      } catch {
        // ignore malformed localStorage values
      }
    }

    return base
  })

  const uploadImage = async ({ file, uploadPreset, folder, publicIdName }) => {
    const data = new FormData()
    data.append('file', file)
    data.append('upload_preset', uploadPreset)
    data.append('cloud_name', CLOUD_NAME)
    data.append('folder', folder)
    // Use a stable Public ID per set so uploads replace the same logical asset.
    // (Actual overwrite behavior depends on Cloudinary settings, so we also delete first server-side.)
    data.append('public_id', publicIdName)

    const res = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: data,
    })

    const json = await res.json()
    if (!res.ok) {
      const message = json?.error?.message || 'Upload failed'
      throw new Error(message)
    }
    return json
  }

  const destroyImage = async ({ publicId, allowNotFound = false }) => {
    const res = await fetch('/api/cloudinary/destroy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId, resourceType: 'image' }),
    })

    const json = await res
      .json()
      .catch(() => ({}))

    if (!res.ok) {
      const message = json?.error?.message || `Delete failed (HTTP ${res.status})`
      throw new Error(message)
    }

    if (typeof json?.result === 'string') {
      const result = json.result.toLowerCase()
      if (result !== 'ok' && !(allowNotFound && result === 'not found')) {
        throw new Error(`Delete failed: ${json.result}`)
      }
    }

    return json
  }

  const handleFileUpload = (setKey, uploadPreset, folder, publicIdName) => async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/png', 'image/jpeg']
    if (!allowedTypes.includes(file.type)) {
      event.target.value = ''
      setStatusBySet((prev) => ({
        ...prev,
        [setKey]: { ...prev[setKey], loading: false, error: 'Only PNG/JPG allowed' },
      }))
      return
    }

    setStatusBySet((prev) => ({
      ...prev,
      [setKey]: { ...prev[setKey], loading: true, error: '', message: '', url: '', publicId: '' },
    }))

    try {
      // Always delete the existing asset for this set first (if any), so the new upload
      // effectively overwrites it even for unsigned upload presets.
      const stablePublicId = `${folder}/${publicIdName}`
      await destroyImage({ publicId: stablePublicId, allowNotFound: true })

      const uploaded = await uploadImage({ file, uploadPreset, folder, publicIdName })
      const url = uploaded.secure_url ?? uploaded.url ?? ''
      const publicId = uploaded.public_id ?? ''
      const version = uploaded.version ?? Date.now()

      console.log(`[${setKey}] Uploaded image URL:`, url)
      console.log(`[${setKey}] public_id:`, publicId)

      setStatusBySet((prev) => ({
        ...prev,
        [setKey]: { ...prev[setKey], loading: false, error: '', url, publicId, version },
      }))

      try {
        localStorage.setItem(`cloudinary:${setKey}`, JSON.stringify({ url, publicId, version }))
      } catch {
        // ignore quota/permissions
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setStatusBySet((prev) => ({
        ...prev,
        [setKey]: { ...prev[setKey], loading: false, error: message, message: '' },
      }))
    } finally {
      event.target.value = ''
    }
  }

  const handleDelete = async (setKey, folder, publicIdName) => {
    const publicId = `${folder}/${publicIdName}`

    setStatusBySet((prev) => ({
      ...prev,
      [setKey]: { ...prev[setKey], loading: true, error: '', message: '' },
    }))

    try {
      // If it doesn't exist, treat as a no-op.
      await destroyImage({ publicId, allowNotFound: true })
      setStatusBySet((prev) => ({
        ...prev,
        [setKey]: {
          ...prev[setKey],
          loading: false,
          error: '',
          message: 'Delete successful.',
          url: '',
          publicId: '',
        },
      }))

      try {
        localStorage.removeItem(`cloudinary:${setKey}`)
      } catch {
        // ignore
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      setStatusBySet((prev) => ({
        ...prev,
        [setKey]: { ...prev[setKey], loading: false, error: message, message: '' },
      }))
    }
  }

  return (
    <>
      <div className='uploads'>
        {UPLOAD_SETS.map((s) => {
          const status = statusBySet[s.key]
          return (
            <div key={s.key} className='file-upload'>
              <h2>{s.title}</h2>
              <div className='upload-container'>
                <div className='upload-icon'>
                  {status.loading ? 'Uploading...' : <img src={uploadIcon} alt='Upload icon' />}
                </div>

                <div className='upload-label'>
                  Folder: <strong>{s.folder}</strong>
                </div>

                {!!status.error && (
                  <div className='upload-label' style={{ color: 'crimson' }}>
                    {status.error}
                  </div>
                )}

                {!!status.message && (
                  <div className='upload-label' style={{ color: 'green' }}>
                    {status.message}
                  </div>
                )}

                {!!status.url && (
                  <a href={withCacheBust(status.url, status.version)} target='_blank' rel='noreferrer'>
                    View uploaded image
                  </a>
                )}
              </div>

              <input
                type='file'
                accept='image/png,image/jpeg'
                onChange={handleFileUpload(s.key, s.uploadPreset, s.folder, s.publicIdName)}
                disabled={status.loading}
              />

              {/* For deletion of Set 1 or set (s) */}
              <input
                type='button'
                value='Delete'
                onClick={() => handleDelete(s.key, s.folder, s.publicIdName)}
                disabled={status.loading}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}

export default App
