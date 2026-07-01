import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '')

  const logout = () => {
    localStorage.removeItem('admin_token')
    setToken('')
  }

  const onLogin = (t) => {
    localStorage.setItem('admin_token', t)
    setToken(t)
  }

  return (
    <BrowserRouter>
      {!token
        ? <Login onLogin={onLogin} />
        : <Dashboard token={token} logout={logout} />}
    </BrowserRouter>
  )
}