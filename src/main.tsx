import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import './index.css'

const container = document.getElementById('root')
if (!container) {
  throw new Error('Elemen #root tidak dijumpai dalam index.html')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
