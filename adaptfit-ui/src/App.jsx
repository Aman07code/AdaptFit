import { useState } from 'react'
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

function AnimatedRoutes() {
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
          <Route path="/" element={<Dashboard />} />
          <Route path="/trainer" element={<Trainer />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/history" element={<WorkoutHistory />} />
          <Route path="/bmi" element={<BMICalculator />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('adaptfit_user')) } catch { return null }
  })

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
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0a0a' }}>
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="w-64 flex flex-col border-r border-white/5 relative z-10 glass"
      >
        <div className="orb w-40 h-40 bg-green-500" style={{ top: '-30px', left: '-30px', opacity: 0.1 }} />
        <div className="orb w-32 h-32 bg-blue-500" style={{ bottom: '80px', right: '-20px', opacity: 0.08 }} />

        {/* Logo */}
        <div className="p-6 border-b border-white/5 relative">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center pulse-glow"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
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
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-black"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
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
                    ? 'bg-green-500/10 text-green-400 font-medium border border-green-500/20'
                    : 'text-white/40 hover:text-white hover:bg-white/5'}`
                }>
                {({ isActive }) => (
                  <>
                    <Icon size={17} className={isActive ? 'text-green-400' : ''} />
                    {label}
                    {isActive && <motion.div layoutId="nav-dot" className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400" />}
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/5 relative space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/5 border border-green-500/10">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400/70">Backend connected</span>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/5 text-xs transition-all">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="orb w-96 h-96 bg-green-500 fixed" style={{ top: '-100px', right: '-100px', opacity: 0.06 }} />
        <div className="orb w-64 h-64 bg-purple-500 fixed" style={{ bottom: '0', left: '200px', opacity: 0.05 }} />
        <div className="orb w-48 h-48 bg-blue-500 fixed" style={{ top: '40%', right: '20%', opacity: 0.05 }} />
        <AnimatedRoutes />
      </main>
      <ChatBot />
    </div>
  )
}
