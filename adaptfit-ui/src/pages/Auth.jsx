import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Eye, EyeOff, User, Mail, Lock, ArrowRight, Activity } from 'lucide-react'

const API = localStorage.getItem('adaptfit_url') || 'http://localhost:8080'

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    setLoading(true); setError('')
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password }
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('adaptfit_token', data.token)
        localStorage.setItem('adaptfit_user', JSON.stringify(data.user))
        onAuth(data.user)
      } else {
        setError(data.message || 'Something went wrong')
      }
    } catch (e) {
      setError('Cannot connect to backend. Make sure it is running.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: '#0a0a0a' }}>
      {/* Left — Branding panel */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1a0f 0%, #0a0a0a 100%)' }}
      >
        {/* Background orbs */}
        <div className="orb w-96 h-96 bg-green-500" style={{ top: '-80px', left: '-80px', opacity: 0.15 }} />
        <div className="orb w-64 h-64 bg-blue-500" style={{ bottom: '100px', right: '-40px', opacity: 0.1 }} />
        <div className="orb w-48 h-48 bg-purple-500" style={{ top: '40%', left: '30%', opacity: 0.08 }} />

        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center pulse-glow"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
            <Zap size={18} className="text-black" />
          </div>
          <span className="font-semibold text-lg gradient-text">AdaptFit</span>
        </div>

        {/* Center content */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Train smarter,<br />
              <span className="gradient-text">not harder.</span>
            </h1>
            <p className="text-white/40 text-lg leading-relaxed mb-8">
              AdaptFit creates personalized workouts based on your energy, recovery, and goals — every single day.
            </p>
            <div className="space-y-3">
              {['Adaptive workout recommendations', 'Progress tracking & analytics', 'BMI & calorie calculator', 'Exercise library management'].map((f, i) => (
                <motion.div
                  key={f}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                  <p className="text-white/50 text-sm">{f}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative grid grid-cols-3 gap-4"
        >
          {[['10+', 'Exercises'], ['5', 'Workout types'], ['Smart', 'Recommendations']].map(([val, label]) => (
            <div key={label} className="glow-card rounded-xl p-4 text-center">
              <p className="text-xl font-semibold gradient-text">{val}</p>
              <p className="text-xs text-white/30 mt-1">{label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Right — Auth form */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="flex-1 flex items-center justify-center p-8 relative"
      >
        <div className="orb w-64 h-64 bg-green-500" style={{ top: '-50px', right: '-50px', opacity: 0.08 }} />
        <div className="orb w-48 h-48 bg-purple-500" style={{ bottom: '-30px', left: '-30px', opacity: 0.08 }} />

        <div className="w-full max-w-md relative">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
              <Zap size={16} className="text-black" />
            </div>
            <span className="font-semibold gradient-text">AdaptFit</span>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl mb-8 w-fit" style={{ background: 'rgba(255,255,255,0.05)' }}>
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className="relative px-6 py-2 rounded-lg text-sm font-medium transition-all capitalize"
              >
                {mode === m && (
                  <motion.div layoutId="auth-tab"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #22c55e20, #16a34a20)', border: '1px solid #22c55e30' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className={`relative ${mode === m ? 'text-green-400' : 'text-white/40'}`}>{m}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-2xl font-semibold mb-2">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-white/40 text-sm mb-8">
                {mode === 'login' ? 'Sign in to your AdaptFit account' : 'Start your adaptive fitness journey'}
              </p>

              <div className="space-y-4">
                {mode === 'register' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Full name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                      <input
                        value={form.name}
                        onChange={e => update('name', e.target.value)}
                        placeholder="Aman Choudhary"
                        className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all glow-card text-white placeholder-white/20 focus:border-green-500/40"
                      />
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => update('email', e.target.value)}
                      placeholder="aman@example.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all glow-card text-white placeholder-white/20 focus:border-green-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => update('password', e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3 rounded-xl text-sm outline-none transition-all glow-card text-white placeholder-white/20"
                      onKeyDown={e => e.key === 'Enter' && submit()}
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                      {showPassword ? <EyeOff size={15} className="text-white/30" /> : <Eye size={15} className="text-white/30" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
                    {error}
                  </motion.p>
                )}

                <button
                  onClick={submit}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-black flex items-center justify-center gap-2 transition-all pulse-glow shimmer disabled:opacity-50 mt-2"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>{mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></>
                  )}
                </button>

                <p className="text-center text-sm text-white/30 mt-4">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
                    className="text-green-400 hover:text-green-300 transition-colors">
                    {mode === 'login' ? 'Register' : 'Sign in'}
                  </button>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
