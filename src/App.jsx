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

    const set1_data = new FormData()
    set1_data.append('file', file)
    set1_data.append('upload_preset', 'set1_preset')
    set1_data.append('cloud_name', 'ddbnfzbgl')
    set1_data.append('folder', 'set1')

    const res = await fetch('https://api.cloudinary.com/v1_1/ddbnfzbgl/image/upload', {
      method: 'POST',
      body: set1_data
    })

    const uploadedImageURL = await res.json()
    console.log('Uploaded image URL:', uploadedImageURL.secure_url ?? uploadedImageURL.url)

    console.log('Uploaded file:', file)
    setLoading(false)
  }

  const handleFileUpload2 = async(event) => {
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
      <div className='file-upload'>
        <h2>Set 1</h2>
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
      <div className='file-upload'>
        <h2>Set 2</h2>
        <div className='upload-container'>
          <div className='upload-icon'>
            {
              loading ? 'Uploading...' : <img src='src/assets/upload.svg' alt='Upload icon' />
            }
          </div>
        </div>

        <input
          type='file'
          className='file-input2'
          accept='image/png,image/jpeg'
          onChange={handleFileUpload2}
        ></input>
      </div>
    </>
  )
}

export default App
