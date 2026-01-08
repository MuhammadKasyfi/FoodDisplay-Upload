import { useState } from 'react'
import './App.css'
import uploadIcon from './assets/upload.svg'

const CLOUDINARY_CLOUD_NAME = 'ddbnfzbgl'
const CLOUDINARY_UPLOAD_PRESET = 'First_preset'

function Uploader({ folder, label }) {
  const [loading, setLoading] = useState(false)

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)

    try {
      // only png or jpg
      const allowedTypes = ['image/png', 'image/jpeg']
      if (!allowedTypes.includes(file.type)) {
        event.target.value = ''
        return
      }

      const data = new FormData()
      data.append('file', file)
      data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
      data.append('cloud_name', CLOUDINARY_CLOUD_NAME)
      data.append('folder', folder)

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: data
        }
      )

      const uploadedImage = await res.json()
      console.log(`[${folder}] Uploaded image URL:`, uploadedImage.secure_url ?? uploadedImage.url)
    } catch (err) {
      console.error(`[${folder}] Upload failed:`, err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='file-upload'>
      <div className='upload-container'>
        <div className='upload-label'>{label}</div>
        <div className='upload-icon'>
          {loading ? 'Uploading...' : <img src={uploadIcon} alt='Upload icon' />}
        </div>
      </div>

      <input
        type='file'
        className='file-input'
        accept='image/png,image/jpeg'
        onChange={handleFileUpload}
      ></input>
    </div>
  )
}

function App() {
  return (
    <>
      <div className='uploads'>
        <Uploader folder='set1' label='Upload for Set 1' />
        <Uploader folder='set2' label='Upload for Set 2' />
        <Uploader folder='set3' label='Upload for Set 3' />
        <Uploader folder='set4' label='Upload for Set 4' />
      </div>
    </>
  )
}

export default App
