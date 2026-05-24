import { useEffect, useState } from 'react'
import { Zap, Flame, Clock, Dumbbell, TrendingUp, ChevronRight, Activity } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target])
  return count
}

const StatCard = ({ icon: Icon, label, value, color, numericValue, suffix = '' }) => {
  const count = useCountUp(numericValue || 0)
  return (
    <div className="glow-card shimmer rounded-2xl p-5 relative overflow-hidden">
      <div className="orb w-20 h-20" style={{ background: color.replace('text-', '').replace('-400', ''), top: '-10px', right: '-10px', opacity: 0.15 }} />
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color.replace('text-', 'bg-').replace('-400', '-500/10')}`}>
        <Icon size={18} className={color} />
      </div>
      <p className="text-2xl font-semibold">
        {numericValue ? count.toLocaleString() + suffix : value}
      </p>
      <p className="text-sm text-white/40 mt-1">{label}</p>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('adaptfit_user') || '{"name":"User"}')

  const stats = [
    { icon: Flame, label: 'Day streak', value: '7 🔥', numericValue: 7, suffix: ' 🔥', color: 'text-orange-400' },
    { icon: Clock, label: 'Mins this week', value: '142', numericValue: 142, color: 'text-blue-400' },
    { icon: Dumbbell, label: 'Workouts done', value: '12', numericValue: 12, color: 'text-purple-400' },
    { icon: TrendingUp, label: 'Calories burned', value: '3240', numericValue: 3240, color: 'text-green-400' },
  ]

  return (
    <div className="p-8 relative">
      {/* Header */}
      <div className="mb-8">
        <p className="text-white/40 text-sm mb-1">Good morning 👋</p>
        <h1 className="text-3xl font-semibold">
          Welcome back, <span className="gradient-text">{user.name}</span>
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Generate workout — gradient border */}
        <div
          onClick={() => navigate('/trainer')}
          className="gradient-border cursor-pointer group p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
                <Zap size={20} className="text-green-400" />
              </div>
              <p className="font-semibold text-lg">Generate workout</p>
              <p className="text-white/40 text-sm mt-1">Get your adaptive plan now</p>
            </div>
            <ChevronRight size={22} className="text-white/20 group-hover:translate-x-1 group-hover:text-green-400 transition-all" />
          </div>
        </div>

        {/* BMI calc */}
        <div
          onClick={() => navigate('/bmi')}
          className="glow-card rounded-2xl p-6 cursor-pointer group"
          style={{ borderColor: 'rgba(168,85,247,0.2)', boxShadow: '0 0 25px rgba(168,85,247,0.05)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                <TrendingUp size={20} className="text-purple-400" />
              </div>
              <p className="font-semibold text-lg">BMI Calculator</p>
              <p className="text-white/40 text-sm mt-1">Check your body metrics</p>
            </div>
            <ChevronRight size={22} className="text-white/20 group-hover:translate-x-1 group-hover:text-purple-400 transition-all" />
          </div>
        </div>
      </div>

      {/* Activity ring + tip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ring */}
        <div className="glow-card rounded-2xl p-6 flex flex-col items-center justify-center">
          <p className="text-sm text-white/40 mb-4">Weekly goal</p>
          <svg viewBox="0 0 120 120" width="120" height="120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="url(#ring-gradient)" strokeWidth="10"
              strokeDasharray="314" strokeDashoffset="100" strokeLinecap="round"
              transform="rotate(-90 60 60)" />
            <defs>
              <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <text x="60" y="56" textAnchor="middle" fill="white" fontSize="18" fontWeight="600">68%</text>
            <text x="60" y="72" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">complete</text>
          </svg>
        </div>

        {/* Today's tip */}
        <div className="glow-card shimmer rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-green-400" />
            <p className="text-sm font-medium text-white/60">Today's tip</p>
          </div>
          <p className="text-white/50 text-sm leading-relaxed">
            💡 Consistency beats intensity. Even a 20-minute light workout on low energy days keeps your streak alive and your body moving forward.
          </p>
          <div className="mt-4 flex gap-2">
            {['Strength', 'Recovery', 'Nutrition'].map(tag => (
              <span key={tag} className="text-xs bg-white/5 border border-white/5 px-3 py-1 rounded-full text-white/30">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}