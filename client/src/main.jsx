import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <>
    <Toaster
  position="top-center"
  toastOptions={{
    style: {
      padding: '12px 8px 12px 16px',
    },
  }}
/>
    <App />
  </>
)