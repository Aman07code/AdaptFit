import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Clock, Flame, TrendingUp, Dumbbell, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API = localStorage.getItem('adaptfit_url') || 'http://localhost:8080'
const COLORS = ['var(--theme-primary)', 'var(--theme-secondary)', 'var(--theme-accent)', '#f59e0b', '#ef4444']

export default function WorkoutHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('adaptfit_user') || '{"id":1,"name":"User"}')

  useEffect(() => {
    const token = localStorage.getItem('adaptfit_token')
    fetch(`${API}/api/workout-history/users/${user.id}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    })
      .then(r => r.json())
      .then(data => { setHistory(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Real weekly minutes from actual history
  const getWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + 1)
    startOfWeek.setHours(0, 0, 0, 0)

    return days.map((day, i) => {
      const dayDate = new Date(startOfWeek)
      dayDate.setDate(startOfWeek.getDate() + i)
      const nextDay = new Date(dayDate)
      nextDay.setDate(dayDate.getDate() + 1)

      const minutes = history
        .filter(h => {
          const d = new Date(h.performedAt)
          return d >= dayDate && d < nextDay
        })
        .reduce((sum, h) => sum + (h.actualDurationMinutes || 0), 0)

      return { day, minutes }
    })
  }

  // Real goal distribution
  const getGoalData = () => {
    const counts = history.reduce((acc, h) => {
      const goal = h.goal?.replace(/_/g, ' ') || 'Unknown'
      acc[goal] = (acc[goal] || 0) + 1
      return acc
    }, {})
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }

  // Real stats
  const totalMinutes = history.reduce((sum, h) => sum + (h.actualDurationMinutes || 0), 0)
  const totalCalories = history.reduce((sum, h) => {
    return sum + (h.exercises?.reduce((s, e) => s + (e.caloriesEstimate || 0), 0) || 0)
  }, 0)

  const weeklyData = getWeeklyData()
  const goalData = getGoalData()
  const hasData = history.length > 0
  const hasWeeklyData = weeklyData.some(d => d.minutes > 0)

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
      </div>
    )
  }

  // Empty state
  if (!hasData) {
    return (
      <div className="p-8 page-enter">
        <div className="mb-8">
          <p className="text-white/40 text-sm mb-1">Your progress</p>
          <h1 className="text-3xl font-semibold">Workout history</h1>
        </div>
        <div className="glow-card rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 float" style={{ color: 'var(--theme-primary)' }}>
            <Dumbbell size={28} />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-white">No workouts logged yet!</h2>
          <p className="text-white/40 text-sm mb-6 max-w-sm">
            Complete your first workout session and log it here to start tracking your progress and see charts.
          </p>
          <button onClick={() => navigate('/trainer')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-black transition-all duration-200 theme-gradient-primary-bg hover:opacity-90 shadow-lg shadow-[var(--theme-primary)]/10 pulse-glow"
          >
            Generate first workout <ChevronRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 page-enter">
      <div className="mb-8">
        <p className="text-white/40 text-sm mb-1">Your progress</p>
        <h1 className="text-3xl font-semibold">Workout history</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          [Dumbbell, 'Total sessions', history.length, 'var(--theme-primary)', 'rgba(var(--theme-primary-rgb), 0.1)', 'rgba(var(--theme-primary-rgb), 0.15)'],
          [Clock, 'Total minutes', totalMinutes, 'var(--theme-secondary)', 'rgba(var(--theme-secondary-rgb), 0.1)', 'rgba(var(--theme-secondary-rgb), 0.15)'],
          [Flame, 'Calories burned', totalCalories, '#fb923c', 'rgba(249,115,22,0.1)', 'rgba(249,115,22,0.15)'],
        ].map(([Icon, label, value, color, bg, border]) => (
          <div key={label} className="glow-card shimmer rounded-2xl p-5" style={{ borderColor: border }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: bg, color: color }}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-semibold text-white">{value.toLocaleString()}</p>
            <p className="text-xs text-white/40 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="glow-card shimmer rounded-2xl p-6">
          <p className="text-sm text-white/40 mb-4">This week's minutes</p>
          {hasWeeklyData ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" stroke="#ffffff20" tick={{ fill: '#ffffff40', fontSize: 12 }} />
                <YAxis stroke="#ffffff20" tick={{ fill: '#ffffff40', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="minutes" fill="var(--theme-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex flex-col items-center justify-center text-center">
              <p className="text-white/20 text-sm">No workouts this week yet</p>
              <button onClick={() => navigate('/trainer')} className="text-xs mt-2 hover:opacity-85" style={{ color: 'var(--theme-primary)' }}>
                Start one now →
              </button>
            </div>
          )}
        </div>

        <div className="glow-card shimmer rounded-2xl p-6">
          <p className="text-sm text-white/40 mb-4">Goal distribution</p>
          {goalData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={goalData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {goalData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: 8, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-white/20 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="gradient-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-white/40">{history.length} sessions logged</p>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} style={{ color: 'var(--theme-primary)' }} />
            <p className="text-xs" style={{ color: 'var(--theme-primary)' }}>{totalMinutes} total mins</p>
          </div>
        </div>
        <div className="space-y-3">
          {history.map(h => (
            <div key={h.id} className="glow-card shimmer rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-sm text-white">{h.workoutName}</p>
                  <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                    <span className="flex items-center gap-1"><Clock size={11} />{h.actualDurationMinutes} min</span>
                    <span className="flex items-center gap-1"><Flame size={11} />{h.goal?.replace(/_/g, ' ')}</span>
                    <span className="bg-white/5 px-2 py-0.5 rounded-full text-white/50">{h.workoutType}</span>
                  </div>
                </div>
                <p className="text-xs text-white/30 flex-shrink-0 ml-4">
                  {new Date(h.performedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              {h.exercises?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {h.exercises.map(ex => (
                    <span key={ex.id} className="text-xs bg-white/5 border border-white/5 px-2 py-0.5 rounded-full text-white/40">{ex.name}</span>
                  ))}
                </div>
              )}
              {h.feedback && <p className="text-xs text-white/30 mt-2 italic">"{h.feedback}"</p>}
              {h.notes && <p className="text-xs text-white/20 mt-1">📝 {h.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
