import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Calendar, Clock, Flame } from 'lucide-react'

const API = localStorage.getItem('adaptfit_url') || 'http://localhost:8080'
const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444']

export default function WorkoutHistory() {
  const [history, setHistory] = useState([])
  const user = JSON.parse(localStorage.getItem('adaptfit_user') || '{"id":1,"name":"User"}')

  useEffect(() => {
    const token = localStorage.getItem('adaptfit_token')
    fetch(`${API}/api/workout-history/users/${user.id}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    }).then(r => r.json()).then(setHistory).catch(() => {})
  }, [])

  const goalData = Object.entries(
    history.reduce((acc, h) => { acc[h.goal] = (acc[h.goal] || 0) + 1; return acc }, {})
  ).map(([name, value]) => ({ name: name.replace('_', ' '), value }))

  const weekData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
    day,
    minutes: Math.floor(Math.random() * 45)
  }))

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-white/40 text-sm mb-1">Your progress</p>
        <h1 className="text-3xl font-semibold">Workout history</h1>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <p className="text-sm text-white/40 mb-4">Weekly minutes</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekData}>
              <XAxis dataKey="day" stroke="#ffffff20" tick={{ fill: '#ffffff40', fontSize: 12 }} />
              <YAxis stroke="#ffffff20" tick={{ fill: '#ffffff40', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="minutes" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <p className="text-sm text-white/40 mb-4">Goal distribution</p>
          {goalData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={goalData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name }) => name}>
                  {goalData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: 8, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-white/20 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
        <p className="text-sm text-white/40 mb-4">{history.length} sessions logged</p>
        {history.length === 0 && (
          <p className="text-white/20 text-sm text-center py-8">No workouts logged yet. Complete a session to see it here!</p>
        )}
        <div className="space-y-3">
          {history.map(h => (
            <div key={h.id} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-sm">{h.workoutName}</p>
                <p className="text-xs text-white/30">{new Date(h.performedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-white/40 mb-3">
                <span className="flex items-center gap-1"><Clock size={12} />{h.actualDurationMinutes} min</span>
                <span className="flex items-center gap-1"><Flame size={12} />{h.goal?.replace('_', ' ')}</span>
                <span>{h.workoutType}</span>
              </div>
              {h.exercises?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {h.exercises.map(ex => (
                    <span key={ex.id} className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-white/40">{ex.name}</span>
                  ))}
                </div>
              )}
              {h.feedback && <p className="text-xs text-white/30 mt-2 italic">"{h.feedback}"</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}