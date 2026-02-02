import { use, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import React from 'react'
import './App.css'
import ImageUploader from './components/ImageUploader'

function App() {
  return (
    <>
      <div>
        <h1>Image Uploader</h1>
        <ImageUploader />
      </div>
    </>
  )
}

export default App