import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'

// Call the Render backend directly. Proxying /api through Vercel rewrites makes Render's Cloudflare edge answer
// Vercel's server with a 429 "Just a moment..." challenge, so the data never arrived.
axios.defaults.baseURL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? '' : 'https://agam-portfolio.onrender.com')

import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
