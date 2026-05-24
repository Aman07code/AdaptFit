import { useEffect, useState } from 'react'
import { Zap, Flame, Clock, Dumbbell, TrendingUp, ChevronRight, Activity } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API = localStorage.getItem('adaptfit_url') || 'http://localhost:8080'

function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!target) return
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

function calculateStreak(history) {
  if (!history || history.length === 0) return 0
  const dates = [...new Set(history.map(h => {
    const d = new Date(h.performedAt)
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  }))].sort().reverse()

  let streak = 0
  let current = new Date()
  current.setHours(0, 0, 0, 0)

  for (let i = 0; i < dates.length; i++) {
    const parts = dates[i].split('-')
    const d = new Date(parts[0], parts[1], parts[2])
    const diff = Math.floor((current - d) / (1000 * 60 * 60 * 24))
    if (diff === i) streak++
    else break
  }
  return streak
}

function calculateWeeklyMinutes(history) {
  if (!history || history.length === 0) return 0
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  return history
    .filter(h => new Date(h.performedAt) >= oneWeekAgo)
    .reduce((sum, h) => sum + (h.actualDurationMinutes || 0), 0)
}

function calculateCalories(history) {
  if (!history || history.length === 0) return 0
  return history.reduce((sum, h) => {
    const exerciseCals = h.exercises?.reduce((s, e) => s + (e.caloriesEstimate || 0), 0) || 0
    return sum + exerciseCals
  }, 0)
}

const TIPS = [
  "💡 Consistency beats intensity. Even a 20-minute light workout on low energy days keeps your streak alive!",
  "💪 Progressive overload is key — increase weight or reps by 5% each week for muscle gain.",
  "🥤 Drink water before, during, and after workouts. Even 2% dehydration reduces performance.",
  "😴 Sleep is when muscles grow. Aim for 7-9 hours for optimal recovery.",
  "🍗 Eat protein within 30 minutes after your workout for best muscle recovery.",
  "🧘 Active recovery days with light stretching improve long-term performance.",
]

export default function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('adaptfit_user') || '{"name":"User","id":1}')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const tip = TIPS[new Date().getDay() % TIPS.length]

  useEffect(() => {
    const token = localStorage.getItem('adaptfit_token')
    fetch(`${API}/api/workout-history/users/${user.id}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    })
      .then(r => r.json())
      .then(data => { setHistory(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const streak = calculateStreak(history)
  const weeklyMins = calculateWeeklyMinutes(history)
  const totalWorkouts = history.length
  const totalCalories = calculateCalories(history)
  const weeklyGoal = 150
  const weeklyPct = Math.min(100, Math.round((weeklyMins / weeklyGoal) * 100))

  const streakCount = useCountUp(streak)
  const minsCount = useCountUp(weeklyMins)
  const workoutsCount = useCountUp(totalWorkouts)
  const calsCount = useCountUp(totalCalories)

  const stats = [
    { icon: Flame, label: 'Day streak', value: streakCount, suffix: ' 🔥', color: 'text-orange-400', bg: 'bg-orange-500/10', glow: 'rgba(249,115,22,0.15)' },
    { icon: Clock, label: 'Mins this week', value: minsCount, suffix: '', color: 'text-blue-400', bg: 'bg-blue-500/10', glow: 'rgba(59,130,246,0.15)' },
    { icon: Dumbbell, label: 'Workouts done', value: workoutsCount, suffix: '', color: 'text-purple-400', bg: 'bg-purple-500/10', glow: 'rgba(168,85,247,0.15)' },
    { icon: TrendingUp, label: 'Calories burned', value: calsCount, suffix: '', color: 'text-green-400', bg: 'bg-green-500/10', glow: 'rgba(34,197,94,0.15)' },
  ]

  const recentWorkout = history[0]

  return (
    <div className="p-8 relative">
      {/* Header */}
      <div className="mb-8">
        <p className="text-white/40 text-sm mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-3xl font-semibold">
          Welcome back, <span className="gradient-text">{user.name}</span>
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="glow-card shimmer rounded-2xl p-5 relative overflow-hidden"
            style={{ borderColor: s.glow, boxShadow: `0 0 25px ${s.glow}` }}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${s.bg}`}>
              <s.icon size={18} className={s.color} />
            </div>
            {loading ? (
              <div className="h-7 w-16 bg-white/5 rounded-lg animate-pulse mb-1" />
            ) : (
              <p className="text-2xl font-semibold">{s.value.toLocaleString()}{s.suffix}</p>
            )}
            <p className="text-sm text-white/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div onClick={() => navigate('/trainer')}
          className="gradient-border cursor-pointer group p-6 rounded-2xl">
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

        <div onClick={() => navigate('/bmi')}
          className="glow-card rounded-2xl p-6 cursor-pointer group"
          style={{ borderColor: 'rgba(168,85,247,0.2)', boxShadow: '0 0 25px rgba(168,85,247,0.05)' }}>
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

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly progress ring */}
        <div className="glow-card rounded-2xl p-6 flex flex-col items-center justify-center">
          <p className="text-sm text-white/40 mb-4">Weekly goal</p>
          <svg viewBox="0 0 120 120" width="120" height="120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="url(#ring-gradient)" strokeWidth="10"
              strokeDasharray="314"
              strokeDashoffset={314 - (314 * weeklyPct / 100)}
              strokeLinecap="round"
              transform="rotate(-90 60 60)" />
            <defs>
              <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <text x="60" y="56" textAnchor="middle" fill="white" fontSize="18" fontWeight="600">{weeklyPct}%</text>
            <text x="60" y="72" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">of {weeklyGoal} min</text>
          </svg>
          <p className="text-xs text-white/30 mt-2">{weeklyMins} / {weeklyGoal} minutes</p>
        </div>

        {/* Recent workout */}
        <div className="glow-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-green-400" />
            <p className="text-sm font-medium text-white/60">Last workout</p>
          </div>
          {recentWorkout ? (
            <div>
              <p className="font-semibold text-sm mb-1">{recentWorkout.workoutName}</p>
              <p className="text-xs text-white/40 mb-3">
                {new Date(recentWorkout.performedAt).toLocaleDateString()} · {recentWorkout.actualDurationMinutes} min
              </p>
              <div className="flex flex-wrap gap-1">
                {recentWorkout.exercises?.slice(0, 3).map(ex => (
                  <span key={ex.id} className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-white/40">{ex.name}</span>
                ))}
              </div>
              {recentWorkout.feedback && (
                <p className="text-xs text-white/30 mt-2 italic">"{recentWorkout.feedback}"</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-20 text-center">
              <p className="text-white/20 text-sm">No workouts yet!</p>
              <button onClick={() => navigate('/trainer')}
                className="text-xs text-green-400 mt-2 hover:text-green-300 transition-colors">
                Generate your first workout →
              </button>
            </div>
          )}
        </div>

        {/* Today's tip */}
        <div className="glow-card shimmer rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-yellow-400" />
            <p className="text-sm font-medium text-white/60">Today's tip</p>
          </div>
          <p className="text-white/50 text-sm leading-relaxed">{tip}</p>
          <div className="mt-4 flex gap-2 flex-wrap">
            {['Strength', 'Recovery', 'Nutrition'].map(tag => (
              <span key={tag} className="text-xs bg-white/5 border border-white/5 px-3 py-1 rounded-full text-white/30">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
