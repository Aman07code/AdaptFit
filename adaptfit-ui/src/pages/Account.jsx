import { useState } from 'react'
import { User, Link, LogOut, UserPlus, LogIn, Check, Eye, EyeOff } from 'lucide-react'

const API = localStorage.getItem('adaptfit_url') || 'http://localhost:8080'

export default function Account() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('adaptfit_user') || 'null'))
  const [url, setUrl] = useState(localStorage.getItem('adaptfit_url') || 'http://localhost:8080')
  const [urlSaved, setUrlSaved] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState(false)

  const saveUrl = () => {
    localStorage.setItem('adaptfit_url', url)
    setUrlSaved(true)
    setTimeout(() => setUrlSaved(false), 2000)
  }

  const login = async () => {
    setLoginError('')
    try {
      const res = await fetch(`${url}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      })
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('adaptfit_token', data.token)
        localStorage.setItem('adaptfit_user', JSON.stringify(data.user))
        setUser(data.user)
      } else {
        setLoginError(data.message || 'Invalid credentials')
      }
    } catch (e) {
      setLoginError('Could not connect to backend')
    }
  }

  const register = async () => {
    setRegisterError('')
    try {
      const res = await fetch(`${url}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      })
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('adaptfit_token', data.token)
        localStorage.setItem('adaptfit_user', JSON.stringify(data.user))
        setUser(data.user)
        setRegisterSuccess(true)
      } else {
        setRegisterError(data.message || 'Registration failed')
      }
    } catch (e) {
      setRegisterError('Could not connect to backend')
    }
  }

  const logout = () => {
    localStorage.removeItem('adaptfit_token')
    localStorage.removeItem('adaptfit_user')
    setUser(null)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-white/40 text-sm mb-1">Your profile</p>
        <h1 className="text-3xl font-semibold">Account</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Profile + URL */}
        <div className="space-y-4">
          {/* Profile card */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-3">
                <User size={28} className="text-green-400" />
              </div>
              {user ? (
                <>
                  <p className="font-semibold text-lg">{user.name}</p>
                  <p className="text-sm text-white/40">{user.email}</p>
                  <span className="mt-2 text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full">Signed in</span>
                </>
              ) : (
                <>
                  <p className="font-semibold text-lg">Guest</p>
                  <p className="text-sm text-white/40">Not signed in</p>
                  <span className="mt-2 text-xs bg-white/5 text-white/40 px-3 py-1 rounded-full">Offline</span>
                </>
              )}
            </div>
            {user && (
              <button onClick={logout} className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-white/40 py-2.5 rounded-xl text-sm transition-colors">
                <LogOut size={15} /> Sign out
              </button>
            )}
          </div>

          {/* Backend URL */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Link size={16} className="text-white/40" />
              <p className="text-sm font-medium">Backend URL</p>
            </div>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-white/20 mb-3"
            />
            <button onClick={saveUrl} className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold py-2.5 rounded-xl text-sm transition-colors">
              {urlSaved ? <><Check size={15} /> Saved!</> : 'Save URL'}
            </button>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <p className="text-xs text-white/30">Connected to backend</p>
            </div>
          </div>
        </div>

        {/* Login */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <LogIn size={18} className="text-white/40" />
            <h2 className="font-semibold">Login</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-white/40 mb-1">Email</p>
              <input
                type="email"
                value={loginForm.email}
                onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-white/20"
              />
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Password</p>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-white/20 pr-10"
                />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff size={14} className="text-white/30" /> : <Eye size={14} className="text-white/30" />}
                </button>
              </div>
            </div>
            {loginError && <p className="text-red-400 text-xs">{loginError}</p>}
            {user && <p className="text-green-400 text-xs">✓ Logged in as {user.name}</p>}
            <button onClick={login} className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 mt-2">
              <LogIn size={15} /> Login
            </button>
          </div>
        </div>

        {/* Register */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus size={18} className="text-white/40" />
            <h2 className="font-semibold">Register</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-white/40 mb-1">Name</p>
              <input
                value={registerForm.name}
                onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-white/20"
              />
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Email</p>
              <input
                type="email"
                value={registerForm.email}
                onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-white/20"
              />
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Password</p>
              <input
                type="password"
                value={registerForm.password}
                onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-white/20"
              />
            </div>
            {registerError && <p className="text-red-400 text-xs">{registerError}</p>}
            {registerSuccess && <p className="text-green-400 text-xs">✓ Account created successfully!</p>}
            <button onClick={register} className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 mt-2">
              <UserPlus size={15} /> Create account
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}