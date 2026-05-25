import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Zap, Dumbbell, History, Calculator, User, LogOut } from 'lucide-react'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Trainer from './pages/Trainer'
import Exercises from './pages/Exercises'
import WorkoutHistory from './pages/WorkoutHistory'
import BMICalculator from './pages/BMICalculator'
import Account from './pages/Account'
import ChatBot from './components/ChatBot'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/trainer', icon: Zap, label: 'Trainer' },
  { to: '/exercises', icon: Dumbbell, label: 'Exercises' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/bmi', icon: Calculator, label: 'BMI Calc' },
  { to: '/account', icon: User, label: 'Account' },
]

function AnimatedRoutes({ theme, setTheme }) {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{ height: '100%' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Dashboard theme={theme} />} />
          <Route path="/trainer" element={<Trainer theme={theme} />} />
          <Route path="/exercises" element={<Exercises theme={theme} />} />
          <Route path="/history" element={<WorkoutHistory theme={theme} />} />
          <Route path="/bmi" element={<BMICalculator theme={theme} />} />
          <Route path="/account" element={<Account theme={theme} setTheme={setTheme} />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('adaptfit_user')) } catch { return null }
  })

  const [theme, setTheme] = useState(() => localStorage.getItem('adaptfit_theme') || 'emerald')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('adaptfit_theme', theme)
  }, [theme])

  const handleAuth = (userData) => setUser(userData)

  const handleLogout = () => {
    localStorage.removeItem('adaptfit_token')
    localStorage.removeItem('adaptfit_user')
    setUser(null)
  }

  if (!user) {
    return (
      <AnimatePresence>
        <Auth onAuth={handleAuth} />
      </AnimatePresence>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-theme-bg">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="w-64 flex flex-col border-r border-white/5 relative z-10 glass"
      >
        <div className="orb orb-primary w-40 h-40" style={{ top: '-30px', left: '-30px' }} />
        <div className="orb orb-secondary w-32 h-32" style={{ bottom: '80px', right: '-20px' }} />

        {/* Logo */}
        <div className="p-6 border-b border-white/5 relative">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center pulse-glow theme-gradient-primary-bg">
              <Zap size={16} className="text-black" />
            </div>
            <div>
              <p className="font-semibold text-sm gradient-text">AdaptFit</p>
              <p className="text-xs text-white/30">Adaptive Trainer</p>
            </div>
          </motion.div>
        </div>

        {/* User info */}
        <div className="px-4 pt-4 pb-2 relative">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3 border border-white/5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-black theme-gradient-primary-bg">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-white/30 truncate">{user.email}</p>
            </div>
          </motion.div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 relative">
          {navItems.map(({ to, icon: Icon, label }, i) => (
            <motion.div key={to} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}>
              <NavLink to={to} end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${isActive
                    ? 'nav-link-active'
                    : 'text-white/40 hover:text-white hover:bg-white/5'}`
                }>
                {({ isActive }) => (
                  <>
                    <Icon size={17} style={{ color: isActive ? 'var(--theme-primary)' : '' }} />
                    {label}
                    {isActive && <motion.div layoutId="nav-dot" className="ml-auto w-1.5 h-1.5 rounded-full bg-theme-primary" />}
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/5 relative">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/5 text-xs transition-all border border-transparent hover:border-red-500/10">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="orb orb-primary w-96 h-96 fixed" style={{ top: '-100px', right: '-100px' }} />
        <div className="orb orb-secondary w-64 h-64 fixed" style={{ bottom: '0', left: '200px' }} />
        <div className="orb orb-accent w-48 h-48 fixed" style={{ top: '40%', right: '20%' }} />
        <AnimatedRoutes theme={theme} setTheme={setTheme} />
      </main>
      <ChatBot theme={theme} />
    </div>
  )
}
