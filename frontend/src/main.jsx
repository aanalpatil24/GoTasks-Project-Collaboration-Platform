import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      
      {/* Globally styled to match the GoTasks dark theme */}
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: '#1c1c1f', // surface color
            color: '#f1f1f1',      // text-light
            border: '1px solid #2e2e33', // border color
          },
          success: {
            iconTheme: {
              primary: '#37b75a', // primary-green
              secondary: '#1c1c1f',
            },
          },
        }} 
      />
    </BrowserRouter>
  </React.StrictMode>
)