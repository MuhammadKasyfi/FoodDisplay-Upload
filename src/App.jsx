import { use, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import React from 'react'
import './App.css'
import uploadIcon from './assets/upload.svg'

const CLOUD_NAME = 'ddbnfzbgl'
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

const UPLOAD_SETS = [
  {
    key: 'set1',
    title: 'Set 1',
    uploadPreset: 'set1_preset',
    folder: 'set1',
    inputClassName: 'file-input',
  },
  {
    key: 'set2',
    title: 'Set 2',
    uploadPreset: 'set2_preset',
    folder: 'set2',
    inputClassName: 'file-input2',
  },
]

function App() {
  const [statusBySet, setStatusBySet] = useState(() =>
    Object.fromEntries(
      UPLOAD_SETS.map((s) => [s.key, { loading: false, error: '', url: '', publicId: '' }])
    )
  )

  const uploadImage = async ({ file, uploadPreset, folder }) => {
    const data = new FormData()
    data.append('file', file)
    data.append('upload_preset', uploadPreset)
    data.append('cloud_name', CLOUD_NAME)
    data.append('folder', folder)

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

  const handleFileUpload = (setKey, uploadPreset, folder) => async (event) => {
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
      [setKey]: { ...prev[setKey], loading: true, error: '', url: '', publicId: '' },
    }))

    try {
      const uploaded = await uploadImage({ file, uploadPreset, folder })
      const url = uploaded.secure_url ?? uploaded.url ?? ''
      const publicId = uploaded.public_id ?? ''

      console.log(`[${setKey}] Uploaded image URL:`, url)
      console.log(`[${setKey}] public_id:`, publicId)

      setStatusBySet((prev) => ({
        ...prev,
        [setKey]: { ...prev[setKey], loading: false, error: '', url, publicId },
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setStatusBySet((prev) => ({
        ...prev,
        [setKey]: { ...prev[setKey], loading: false, error: message },
      }))
    } finally {
      event.target.value = ''
    }

    const set2_data = new FormData()
    set2_data.append('file', file)
    set2_data.append('upload_preset', 'set2_preset')
    set2_data.append('cloud_name', 'ddbnfzbgl')
    set2_data.append('folder', 'set2')

    const res = await fetch('https://api.cloudinary.com/v1_1/ddbnfzbgl/image/upload', {
      method: 'POST',
      body: set2_data
    })

    const uploadedImageURL = await res.json()
    console.log('Uploaded image URL:', uploadedImageURL.secure_url ?? uploadedImageURL.url)

    console.log('Uploaded file:', file)
    setLoading(false)
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

                {!!status.url && (
                  <a href={status.url} target='_blank' rel='noreferrer'>
                    View uploaded image
                  </a>
                )}
              </div>

              <input
                type='file'
                className={s.inputClassName}
                accept='image/png,image/jpeg'
                onChange={handleFileUpload(s.key, s.uploadPreset, s.folder)}
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
