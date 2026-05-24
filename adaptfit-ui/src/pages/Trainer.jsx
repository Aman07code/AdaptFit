import { useState } from 'react'
import { Zap, Clock, Flame, ChevronRight, Loader } from 'lucide-react'

const API = localStorage.getItem('adaptfit_url') || 'http://localhost:8080'

const GOALS = ['FAT_LOSS', 'MUSCLE_GAIN', 'ENDURANCE', 'FLEXIBILITY', 'GENERAL_FITNESS']
const EQUIPMENT = ['NONE', 'DUMBBELLS', 'JUMP_ROPE', 'RESISTANCE_BAND', 'KETTLEBELL']

const LevelBtn = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
      active
        ? 'bg-green-500 text-black'
        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
    }`}
  >
    {label}
  </button>
)

export default function Trainer() {
  const [energy, setEnergy] = useState('HIGH')
  const [recovery, setRecovery] = useState('HIGH')
  const [goal, setGoal] = useState('MUSCLE_GAIN')
  const [equipment, setEquipment] = useState(['NONE', 'DUMBBELLS'])
  const [time, setTime] = useState(35)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const toggleEquipment = (e) => {
    setEquipment(prev =>
      prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]
    )
  }

  const generate = async () => {
    setLoading(true)
    setError('')
    setResult(null)
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
          availableTimeMinutes: time
        })
      })
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError('Could not connect to backend. Make sure it is running.')
    }
    setLoading(false)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-white/40 text-sm mb-1">Adaptive trainer</p>
        <h1 className="text-3xl font-semibold">Generate workout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          {/* Energy */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <p className="text-sm text-white/40 mb-3">Energy level</p>
            <div className="flex gap-2">
              {['LOW', 'MEDIUM', 'HIGH'].map(l => (
                <LevelBtn key={l} label={l} active={energy === l} onClick={() => setEnergy(l)} />
              ))}
            </div>
          </div>

          {/* Recovery */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <p className="text-sm text-white/40 mb-3">Recovery level</p>
            <div className="flex gap-2">
              {['LOW', 'MEDIUM', 'HIGH'].map(l => (
                <LevelBtn key={l} label={l} active={recovery === l} onClick={() => setRecovery(l)} />
              ))}
            </div>
          </div>

          {/* Goal */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <p className="text-sm text-white/40 mb-3">Goal</p>
            <div className="flex flex-wrap gap-2">
              {GOALS.map(g => (
                <LevelBtn key={g} label={g.replace('_', ' ')} active={goal === g} onClick={() => setGoal(g)} />
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <p className="text-sm text-white/40 mb-3">Equipment</p>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT.map(e => (
                <LevelBtn key={e} label={e.replace('_', ' ')} active={equipment.includes(e)} onClick={() => toggleEquipment(e)} />
              ))}
            </div>
          </div>

          {/* Time */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between mb-3">
              <p className="text-sm text-white/40">Available time</p>
              <p className="text-sm font-medium text-green-400">{time} min</p>
            </div>
            <input
              type="range" min="10" max="90" step="5"
              value={time}
              onChange={e => setTime(Number(e.target.value))}
              className="w-full accent-green-500"
            />
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader size={18} className="animate-spin" /> : <Zap size={18} />}
            {loading ? 'Generating...' : 'Generate workout'}
          </button>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </div>

        {/* Result */}
        <div>
          {!result && !loading && (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center">
              <Zap size={40} className="text-white/10 mb-4" />
              <p className="text-white/30 text-sm">Your workout will appear here</p>
            </div>
          )}

          {result && (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 space-y-5">
              <div>
                <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full">
                  {result.workoutType}
                </span>
                <h2 className="text-xl font-semibold mt-3">{result.recommendationName}</h2>
                <p className="text-white/40 text-sm mt-2">{result.recommendationReason}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <Clock size={16} className="text-white/40 mx-auto mb-1" />
                  <p className="font-semibold">{result.estimatedDurationMinutes}m</p>
                  <p className="text-xs text-white/40">Duration</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <Zap size={16} className="text-white/40 mx-auto mb-1" />
                  <p className="font-semibold">{result.intensity}</p>
                  <p className="text-xs text-white/40">Intensity</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <Flame size={16} className="text-white/40 mx-auto mb-1" />
                  <p className="font-semibold">{result.exercises?.length}</p>
                  <p className="text-xs text-white/40">Exercises</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-white/40 font-medium">Exercises</p>
                {result.exercises?.map((ex, i) => (
                  <div key={ex.id} className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-8 h-8 bg-green-500/10 text-green-400 rounded-lg flex items-center justify-center text-sm font-semibold">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{ex.name}</p>
                      <p className="text-xs text-white/40">{ex.muscleGroup} · {ex.durationMinutes}min · {ex.caloriesEstimate} cal</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}