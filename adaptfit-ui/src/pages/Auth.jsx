import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Eye, EyeOff, User, Mail, Lock, ArrowRight } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || localStorage.getItem('adaptfit_url') || 'http://localhost:8080'

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  // OTP Verification States
  const [otpState, setOtpState] = useState({ show: false, email: '' })
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [otpResendCooldown, setOtpResendCooldown] = useState(0)

  // Google GSI States
  const [googleInitialized, setGoogleInitialized] = useState(false)

  // Live ticking stats states
  const [exerciseCount, setExerciseCount] = useState(0)
  const [typeCount, setTypeCount] = useState(0)
  const [accuracyVal, setAccuracyVal] = useState(0)

  // Fetch real-time DB stats and run rolling ticker animation
  useEffect(() => {
    let targetExercises = 11 // default fallbacks
    let targetTypes = 5
    let targetAccuracy = 98

    const fetchStatsAndAnimate = async () => {
      try {
        const res = await fetch(`${API}/api/exercises`)
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) {
            targetExercises = data.length
            targetTypes = Math.max(5, new Set(data.map(e => e.workoutType)).size)
          }
        }
      } catch (e) {
        // Fallback is used
      }

      // Tick up animation parameters
      const duration = 1200 // 1.2s rolling animation
      const steps = 30
      const stepTime = duration / steps
      
      let step = 0
      const timer = setInterval(() => {
        step++
        setExerciseCount(Math.min(targetExercises, Math.round((targetExercises / steps) * step)))
        setTypeCount(Math.min(targetTypes, Math.round((targetTypes / steps) * step)))
        setAccuracyVal(Math.min(targetAccuracy, Math.round((targetAccuracy / steps) * step)))
        
        if (step >= steps) {
          clearInterval(timer)
        }
      }, stepTime)

      return () => clearInterval(timer)
    }

    const cleanup = fetchStatsAndAnimate()
    return () => {
      // Cleanup hook if unmounted mid-run
    }
  }, [])

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Google Identity Services Credential Handler
  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      })
      const data = await res.json()
      if (res.ok && data.token) {
        localStorage.setItem('adaptfit_token', data.token)
        localStorage.setItem('adaptfit_user', JSON.stringify(data.user))
        onAuth(data.user)
      } else {
        setError(data.message || 'Google authentication failed')
      }
    } catch (err) {
      setError('Cannot connect to backend to verify Google authentication.')
    }
    setLoading(false)
  }

  // Developer Bypass Backdoor for Mock Google OAuth Testing
  const triggerMockGoogleLogin = () => {
    console.log("[DEVELOPER DIAGNOSTICS] Triggering Mock Google OAuth Login...")
    const mockCredential = "mockheader.eyJlbWFpbCI6ImFhcmF2Lmdvb2dsZUBleGFtcGxlLmNvbSIsIm5hbWUiOiJBYXJhdiBHb29nbGVEZXYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0.mocksignature"
    handleGoogleCredentialResponse({ credential: mockCredential })
  }

  // Load Google Script once on mount
  useEffect(() => {
    const id = 'google-gsi-client'
    const scriptEl = document.getElementById(id)

    const initGoogle = () => {
      try {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '921102931089-devmockclientid.apps.googleusercontent.com',
            callback: handleGoogleCredentialResponse,
          })

          const btnContainer = document.getElementById('google-signin-btn')
          if (btnContainer) {
            window.google.accounts.id.renderButton(btnContainer, {
              theme: 'outline',
              size: 'large',
              width: 320,
              shape: 'pill',
            })
            setGoogleInitialized(true)
            return true
          }
        }
      } catch (e) {
        console.warn('Google Client Script initialization error:', e)
      }
      return false
    }

    if (!scriptEl) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.id = id
      script.async = true
      script.defer = true
      script.onload = () => {
        setTimeout(initGoogle, 100)
      }
      document.body.appendChild(script)
    } else if (!googleInitialized) {
      initGoogle()
    }

    const interval = setInterval(() => {
      if (window.google?.accounts?.id && !googleInitialized) {
        const success = initGoogle()
        if (success) {
          clearInterval(interval)
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [googleInitialized])

  // OTP Countdown timer
  useEffect(() => {
    if (otpResendCooldown > 0) {
      const timer = setTimeout(() => setOtpResendCooldown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpResendCooldown])

  // Custom credentials register/login submit
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
      
      if (res.ok) {
        if (data.requiresVerification) {
          setOtpState({ show: true, email: form.email })
          setOtpCode(['', '', '', '', '', ''])
          setError('')
        } else if (data.token) {
          localStorage.setItem('adaptfit_token', data.token)
          localStorage.setItem('adaptfit_user', JSON.stringify(data.user))
          onAuth(data.user)
        } else {
          setError(data.message || 'Something went wrong')
        }
      } else {
        // Handle unverified user redirection during login
        if (mode === 'login' && data.message && data.message.includes('not verified')) {
          setOtpState({ show: true, email: form.email })
          setOtpCode(['', '', '', '', '', ''])
          setError('Account is not verified yet. Please enter your verification code.')
        } else {
          setError(data.message || 'Something went wrong')
        }
      }
    } catch (e) {
      setError('Cannot connect to backend. Make sure it is running.')
    }
    setLoading(false)
  }

  // OTP Change handlers
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return
    const newCode = [...otpCode]
    newCode[index] = value.substring(value.length - 1)
    setOtpCode(newCode)

    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text').trim()
    if (pasteData.length === 6 && !isNaN(pasteData)) {
      const newCode = pasteData.split('')
      setOtpCode(newCode)
      document.getElementById('otp-input-5')?.focus()
    }
  }

  const submitOtp = async () => {
    const codeString = otpCode.join('')
    if (codeString.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpState.email, code: codeString }),
      })
      const data = await res.json()
      if (res.ok && data.token) {
        localStorage.setItem('adaptfit_token', data.token)
        localStorage.setItem('adaptfit_user', JSON.stringify(data.user))
        onAuth(data.user)
      } else {
        setError(data.message || 'Invalid verification code')
      }
    } catch (err) {
      setError('Cannot connect to backend to verify code.')
    }
    setLoading(false)
  }

  const resendOtp = async () => {
    if (otpResendCooldown > 0) return
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpState.email }),
      })
      if (res.ok) {
        setError('A new verification code was sent to your email (or printed to the server console)!')
        setOtpResendCooldown(30)
      } else {
        const data = await res.json()
        setError(data.message || 'Failed to resend code')
      }
    } catch (err) {
      setError('Cannot connect to backend to resend code.')
    }
    setLoading(false)
  }

  // OTP Verification View
  if (otpState.show) {
    return (
      <div className="min-h-screen flex overflow-hidden bg-theme-bg transition-colors duration-400">
        {/* Left — Branding panel */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden border-r border-white/5"
          style={{ background: 'linear-gradient(135deg, rgba(var(--theme-primary-rgb), 0.04) 0%, var(--theme-bg) 100%)' }}
        >
          {/* Background orbs */}
          <div className="orb orb-primary w-96 h-96 animate-pulse" style={{ top: '-80px', left: '-80px' }} />
          <div className="orb orb-secondary w-64 h-64" style={{ bottom: '100px', right: '-40px' }} />

          {/* Grid pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

          {/* Logo */}
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center pulse-glow theme-gradient-primary-bg">
              <Zap size={18} className="text-black" />
            </div>
            <span className="font-semibold text-lg gradient-text">AdaptFit</span>
          </div>

          {/* Center content */}
          <div className="relative">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Verify your<br />
              <span className="gradient-text">account identity.</span>
            </h1>
            <p className="text-white/40 text-lg leading-relaxed">
              AdaptFit requires email confirmation to securely manage your adaptive workouts, body mass calculators, and target progressions.
            </p>
          </div>

          <div className="relative text-xs text-white/20">
            © 2026 AdaptFit. All rights reserved.
          </div>
        </motion.div>

        {/* Right — OTP PIN Screen */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex-1 flex items-center justify-center p-8 relative"
        >
          <div className="orb orb-primary w-64 h-64" style={{ top: '-50px', right: '-50px' }} />
          <div className="orb orb-secondary w-48 h-48" style={{ bottom: '-30px', left: '-30px' }} />

          <div className="w-full max-w-md relative">
            <button
              onClick={() => { setOtpState({ show: false, email: '' }); setError(''); setGoogleInitialized(false) }}
              className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm mb-8 font-medium"
            >
              ← Back to Sign In
            </button>

            <h2 className="text-3xl font-bold text-white mb-2">Verify Email</h2>
            <p className="text-white/40 text-sm mb-8 leading-relaxed">
              We sent a secure verification PIN. Please check your email inbox (or check the server console if SMTP is disabled) and verify <strong className="text-white">{otpState.email}</strong>.
            </p>

            <div className="space-y-6">
              <div className="flex gap-2.5 justify-between" onPaste={handleOtpPaste}>
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-white/10 bg-white/2 text-white focus:border-theme-primary focus:bg-theme-primary/5 outline-none transition-all glow-card"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-sm border px-4 py-3 rounded-xl ${
                    error.includes('printed')
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-red-400 bg-red-500/10 border-red-500/20'
                  }`}
                >
                  {error}
                </motion.p>
              )}

              <button
                onClick={submitOtp}
                disabled={loading || otpCode.some(d => !d)}
                className="w-full py-3.5 rounded-xl font-semibold text-black flex items-center justify-center gap-2 transition-all pulse-glow shimmer disabled:opacity-50 theme-gradient-primary-bg hover:opacity-90 shadow-lg shadow-[var(--theme-primary)]/10"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>Verify Account <ArrowRight size={16} /></>
                )}
              </button>

              <div className="text-center text-sm text-white/30 mt-4">
                Didn't receive a code?{' '}
                <button
                  onClick={resendOtp}
                  disabled={otpResendCooldown > 0 || loading}
                  className={`font-semibold transition-opacity duration-200 ${
                    otpResendCooldown > 0 ? 'text-white/20 cursor-not-allowed' : 'hover:opacity-85'
                  }`}
                  style={{ color: otpResendCooldown > 0 ? 'rgba(255,255,255,0.2)' : 'var(--theme-primary)' }}
                >
                  {otpResendCooldown > 0 ? `Resend in ${otpResendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Standard Login/Register View
  return (
    <div className="min-h-screen flex overflow-hidden bg-theme-bg transition-colors duration-400">
      {/* Left — Branding panel */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden border-r border-white/5"
        style={{ background: 'linear-gradient(135deg, rgba(var(--theme-primary-rgb), 0.04) 0%, var(--theme-bg) 100%)' }}
      >
        {/* Background orbs */}
        <div className="orb orb-primary w-96 h-96 animate-pulse" style={{ top: '-80px', left: '-80px' }} />
        <div className="orb orb-secondary w-64 h-64" style={{ bottom: '100px', right: '-40px' }} />
        <div className="orb orb-accent w-48 h-48" style={{ top: '40%', left: '30%' }} />

        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center pulse-glow theme-gradient-primary-bg">
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
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(var(--theme-primary-rgb), 0.15)' }}>
                    <div className="w-2 h-2 rounded-full bg-theme-primary" />
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
          {[[`${exerciseCount}+`, 'Exercises'], [`${typeCount}`, 'Workout Types'], [`${accuracyVal}%`, 'Recommendations']].map(([val, label]) => (
            <div key={label} className="glow-card rounded-xl p-4 text-center border border-white/5 bg-theme-surface">
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
        <div className="orb orb-primary w-64 h-64" style={{ top: '-50px', right: '-50px' }} />
        <div className="orb orb-secondary w-48 h-48" style={{ bottom: '-30px', left: '-30px' }} />

        <div className="w-full max-w-md relative">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center theme-gradient-primary-bg pulse-glow">
              <Zap size={16} className="text-black" />
            </div>
            <span className="font-semibold gradient-text">AdaptFit</span>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl mb-8 w-fit border border-white/5 bg-white/2">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setGoogleInitialized(false) }}
                className="relative px-6 py-2 rounded-lg text-sm font-medium transition-all capitalize"
              >
                {mode === m && (
                  <motion.div layoutId="auth-tab"
                    className="absolute inset-0 rounded-lg"
                    style={{ 
                      backgroundColor: 'rgba(var(--theme-primary-rgb), 0.08)', 
                      border: '1px solid rgba(var(--theme-primary-rgb), 0.15)' 
                    }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative transition-colors duration-200" style={{ color: mode === m ? 'var(--theme-primary)' : 'rgba(255,255,255,0.4)' }}>{m}</span>
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
              <h2 className="text-2xl font-semibold mb-2 text-white">
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
                        className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all glow-card text-white placeholder-white/20 focus:border-white/20"
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
                      className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all glow-card text-white placeholder-white/20 focus:border-white/20"
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
                      className="w-full pl-11 pr-12 py-3 rounded-xl text-sm outline-none transition-all glow-card text-white placeholder-white/20 focus:border-white/20"
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
                  className="w-full py-3.5 rounded-xl font-semibold text-black flex items-center justify-center gap-2 transition-all pulse-glow shimmer disabled:opacity-50 mt-2 theme-gradient-primary-bg hover:opacity-90 shadow-lg shadow-[var(--theme-primary)]/10"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>{mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></>
                  )}
                </button>

                <p className="text-center text-sm text-white/30 mt-6">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button 
                    onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setGoogleInitialized(false) }}
                    className="hover:opacity-80 transition-opacity font-semibold"
                    style={{ color: 'var(--theme-primary)' }}
                  >
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
