import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/auth'
import App from '@/App'
import '@/index.css'

createRoot(document.getElementById('app')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter basename="/admin">
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
