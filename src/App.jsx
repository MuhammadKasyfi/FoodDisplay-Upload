import { use, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import React from 'react'
import './App.css'

function App() {
  const[loading, setLoading] = useState(false)
  const handleFileUpload = async(event) => {
    const file = event.target.files[0]
    if(!file) return
    setLoading(true)

    // only png or jpg
    const allowedTypes = ['image/png', 'image/jpeg']
    if (!allowedTypes.includes(file.type)) {
      event.target.value = ''
      setLoading(false)
      return
    }

    const data = new FormData()
    data.append('file', file)
    data.append('upload_preset', 'First_preset')
    data.append('cloud_name', 'ddbnfzbgl')
    data.append('folder', 'set1')

    const res = await fetch('https://api.cloudinary.com/v1_1/ddbnfzbgl/image/upload', {
      method: 'POST',
      body: data
    })

    const uploadedImageURL = await res.json()
    console.log('Uploaded image URL:', uploadedImageURL.secure_url ?? uploadedImageURL.url)

    console.log('Uploaded file:', file)
    setLoading(false)
  }

  return (
    <>
      <div className='file-upload'>
        <div className='upload-container'>
          <div className='upload-icon'>
            {
              loading ? 'Uploading...' : <img src='src/assets/upload.svg' alt='Upload icon' />
            }
          </div>
        </div>

        <input
          type='file'
          className='file-input'
          accept='image/png,image/jpeg'
          onChange={handleFileUpload}
        ></input>
      </div>
    </>
  )
}

export default App
