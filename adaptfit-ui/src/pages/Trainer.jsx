import { useState } from 'react'
import { Zap, Clock, Flame, Loader, AlertTriangle, Target, X } from 'lucide-react'

const API = localStorage.getItem('adaptfit_url') || 'http://localhost:8080'
const GOALS = ['FAT_LOSS', 'MUSCLE_GAIN', 'ENDURANCE', 'FLEXIBILITY', 'GENERAL_FITNESS']
const EQUIPMENT = ['NONE', 'DUMBBELLS', 'JUMP_ROPE', 'RESISTANCE_BAND', 'KETTLEBELL']
const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body', 'Cardio']

const LevelBtn = ({ label, active, onClick, color = 'green' }) => (
  <button onClick={onClick}
    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${active ? 'text-black' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
    style={active ? { background: color === 'green' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : color === 'blue' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'linear-gradient(135deg, #a855f7, #7c3aed)' } : {}}>
    {label}
  </button>
)

export default function Trainer() {
  const [energy, setEnergy] = useState('HIGH')
  const [recovery, setRecovery] = useState('HIGH')
  const [goal, setGoal] = useState('MUSCLE_GAIN')
  const [equipment, setEquipment] = useState(['NONE', 'DUMBBELLS'])
  const [time, setTime] = useState(35)
  const [injuries, setInjuries] = useState([])
  const [targetMuscles, setTargetMuscles] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const toggleEquipment = (e) => setEquipment(prev =>
    prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])

  const toggleInjury = (muscle) => {
    setInjuries(prev => prev.includes(muscle) ? prev.filter(x => x !== muscle) : [...prev, muscle])
    setTargetMuscles(prev => prev.filter(x => x !== muscle))
  }

  const toggleTarget = (muscle) => {
    setTargetMuscles(prev => prev.includes(muscle) ? prev.filter(x => x !== muscle) : [...prev, muscle])
    setInjuries(prev => prev.filter(x => x !== muscle))
  }

  const generate = async () => {
    setLoading(true); setError(''); setResult(null)
    try {
      const token = localStorage.getItem('adaptfit_token')
      const res = await fetch(`${API}/api/recommendations/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          energyLevel: energy,
          recoveryLevel: recovery,
          goal,
          availableEquipment: equipment,
          availableTimeMinutes: time,
          injuredMuscleGroups: injuries,
          targetMuscleGroups: targetMuscles
        })
      })
      const data = await res.json()
      if (data.message) setError(data.message)
      else setResult(data)
    } catch (e) {
      setError('Could not connect to backend. Make sure it is running.')
    }
    setLoading(false)
  }

  const getMuscleStatus = (muscle) => {
    if (injuries.includes(muscle)) return 'injured'
    if (targetMuscles.includes(muscle)) return 'target'
    return 'none'
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-white/40 text-sm mb-1">Adaptive trainer</p>
        <h1 className="text-3xl font-semibold">Generate <span className="gradient-text">workout</span></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">

          {/* Energy */}
          <div className="glow-card rounded-2xl p-5">
            <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Energy level</p>
            <div className="flex gap-2">
              {['LOW', 'MEDIUM', 'HIGH'].map(l => <LevelBtn key={l} label={l} active={energy === l} onClick={() => setEnergy(l)} />)}
            </div>
          </div>

          {/* Recovery */}
          <div className="glow-card rounded-2xl p-5">
            <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Recovery level</p>
            <div className="flex gap-2">
              {['LOW', 'MEDIUM', 'HIGH'].map(l => <LevelBtn key={l} label={l} active={recovery === l} onClick={() => setRecovery(l)} />)}
            </div>
          </div>

          {/* Goal */}
          <div className="glow-card rounded-2xl p-5">
            <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Goal</p>
            <div className="flex flex-wrap gap-2">
              {GOALS.map(g => <LevelBtn key={g} label={g.replace(/_/g, ' ')} active={goal === g} onClick={() => setGoal(g)} />)}
            </div>
          </div>

          {/* Equipment */}
          <div className="glow-card rounded-2xl p-5">
            <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Equipment</p>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT.map(e => <LevelBtn key={e} label={e.replace(/_/g, ' ')} active={equipment.includes(e)} onClick={() => toggleEquipment(e)} />)}
            </div>
          </div>

          {/* Muscle Group Selector */}
          <div className="rounded-2xl p-5" style={{ background: '#111', border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 0 20px rgba(59,130,246,0.05)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Target size={14} className="text-blue-400" />
              <p className="text-xs text-white/40 uppercase tracking-wider">Muscle focus & injuries</p>
            </div>
            <p className="text-xs text-white/20 mb-3">Tap once to target 🎯, tap again to mark as injured 🚫, tap again to clear</p>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map(muscle => {
                const status = getMuscleStatus(muscle)
                return (
                  <button key={muscle}
                    onClick={() => {
                      if (status === 'none') toggleTarget(muscle)
                      else if (status === 'target') { setTargetMuscles(p => p.filter(x => x !== muscle)); setInjuries(p => [...p, muscle]) }
                      else { setInjuries(p => p.filter(x => x !== muscle)) }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                      status === 'target' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      status === 'injured' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-white/5 text-white/40 border-white/5 hover:text-white hover:bg-white/10'}`}>
                    {status === 'target' ? '🎯 ' : status === 'injured' ? '🚫 ' : ''}{muscle}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-4 mt-3">
              {targetMuscles.length > 0 && (
                <p className="text-xs text-blue-400/70">🎯 Targeting: {targetMuscles.join(', ')}</p>
              )}
              {injuries.length > 0 && (
                <p className="text-xs text-red-400/70">🚫 Avoiding: {injuries.join(', ')}</p>
              )}
            </div>
            {(targetMuscles.length > 0 || injuries.length > 0) && (
              <button onClick={() => { setTargetMuscles([]); setInjuries([]) }}
                className="text-xs text-white/20 hover:text-white/50 mt-2 flex items-center gap-1">
                <X size={10} /> Clear all
              </button>
            )}
          </div>

          {/* Time */}
          <div className="glow-card rounded-2xl p-5">
            <div className="flex justify-between mb-3">
              <p className="text-xs text-white/40 uppercase tracking-wider">Available time</p>
              <p className="text-sm font-medium text-green-400">{time} min</p>
            </div>
            <input type="range" min="10" max="90" step="5" value={time}
              onChange={e => setTime(Number(e.target.value))} className="w-full accent-green-500" />
            <div className="flex justify-between text-xs text-white/20 mt-1">
              <span>10 min</span><span>90 min</span>
            </div>
          </div>

          <button onClick={generate} disabled={loading}
            className="w-full text-black font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 pulse-glow shimmer disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
            {loading ? <Loader size={18} className="animate-spin" /> : <Zap size={18} />}
            {loading ? 'Generating...' : 'Generate workout'}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}
        </div>

        {/* Result */}
        <div>
          {!result && !loading && (
            <div className="glow-card rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center">
              <div className="float"><Zap size={48} className="text-green-500/20 mb-4" /></div>
              <p className="text-white/20 text-sm">Your personalized workout will appear here</p>
              {targetMuscles.length > 0 && <p className="text-blue-400/50 text-xs mt-2">🎯 Focus: {targetMuscles.join(', ')}</p>}
              {injuries.length > 0 && <p className="text-red-400/50 text-xs mt-1">🚫 Avoiding: {injuries.join(', ')}</p>}
            </div>
          )}

          {result && (
            <div className="gradient-border rounded-2xl p-6 space-y-5">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20">{result.workoutType}</span>
                  <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">{result.goal?.replace(/_/g, ' ')}</span>
                  {targetMuscles.length > 0 && (
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">🎯 {targetMuscles.join(', ')}</span>
                  )}
                  {injuries.length > 0 && (
                    <span className="text-xs bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20">🚫 {injuries.length} avoided</span>
                  )}
                </div>
                <h2 className="text-xl font-semibold">{result.recommendationName}</h2>
                <p className="text-white/40 text-sm mt-2">{result.recommendationReason}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[[Clock, `${result.estimatedDurationMinutes}m`, 'Duration'], [Zap, result.intensity, 'Intensity'], [Flame, result.exercises?.length, 'Exercises']].map(([Icon, val, label]) => (
                  <div key={label} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                    <Icon size={16} className="text-white/40 mx-auto mb-1" />
                    <p className="font-semibold">{val}</p>
                    <p className="text-xs text-white/40">{label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs text-white/40 uppercase tracking-wider">Exercises</p>
                {result.exercises?.map((ex, i) => (
                  <div key={ex.id} className="glow-card shimmer rounded-xl p-4 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold text-black flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>{i + 1}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{ex.name}</p>
                      <p className="text-xs text-white/40">{ex.muscleGroup} · {ex.equipment} · {ex.durationMinutes}min · {ex.caloriesEstimate} cal</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      ex.intensity === 'LOW' ? 'bg-green-500/10 text-green-400' :
                      ex.intensity === 'MODERATE' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-red-500/10 text-red-400'}`}>
                      {ex.intensity}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Equipment used</p>
                <div className="flex flex-wrap gap-2">
                  {result.equipmentUsed?.map(eq => (
                    <span key={eq} className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/50">{eq}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
