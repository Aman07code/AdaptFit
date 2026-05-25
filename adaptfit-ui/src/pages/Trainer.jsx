import { useState, useEffect, useRef } from 'react'
import { Zap, Clock, Flame, Loader, AlertTriangle, Target, X, Play, Pause, Award, Smile, ClipboardList, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API = localStorage.getItem('adaptfit_url') || 'http://localhost:8080'
const GOALS = ['FAT_LOSS', 'MUSCLE_GAIN', 'ENDURANCE', 'FLEXIBILITY', 'GENERAL_FITNESS']
const EQUIPMENT = ['NONE', 'DUMBBELLS', 'JUMP_ROPE', 'RESISTANCE_BAND', 'KETTLEBELL']
const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body', 'Cardio']

const LevelBtn = ({ label, active, onClick }) => (
  <button onClick={onClick}
    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      active 
        ? 'theme-gradient-primary-bg text-black font-semibold shadow-lg shadow-[var(--theme-primary)]/10' 
        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
    }`}
  >
    {label}
  </button>
)

const playVictorySound = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()

    const notes = [
      { note: 'C4', freq: 261.63, delay: 0.0 },
      { note: 'E4', freq: 329.63, delay: 0.15 },
      { note: 'G4', freq: 392.00, delay: 0.30 },
      { note: 'C5', freq: 523.25, delay: 0.45 },
    ]

    const destination = ctx.destination

    notes.forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      // Set oscillator type: a triangle oscillator gives a smooth marimba/bell chime like sound
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)

      // Apply ADSR (Attack, Decay, Sustain, Release) envelope
      const now = ctx.currentTime + delay
      gain.gain.setValueAtTime(0, now)
      // Attack: quick ramp up to full volume
      gain.gain.linearRampToValueAtTime(0.25, now + 0.04)
      // Decay / Release: slow decay to 0
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)

      osc.connect(gain)
      gain.connect(destination)

      osc.start(now)
      osc.stop(now + 1.5)
    })
  } catch (e) {
    console.warn("Web Audio API not supported or user gesture needed", e)
  }
}

function ConfettiParticles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId

    // Set canvas sizing
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const colors = [
      '#f59e0b', // gold/yellow
      '#10b981', // green
      '#3b82f6', // blue
      '#ec4899', // pink
      '#8b5cf6', // purple
      '#f43f5e', // rose
      '#06b6d4', // cyan
    ]

    // Create particles
    const particleCount = 150
    const particles = []

    for (let i = 0; i < particleCount; i++) {
      const isLeft = i % 2 === 0
      particles.push({
        x: isLeft ? 0 : canvas.width,
        y: canvas.height,
        radius: Math.random() * 5 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        // Shoot towards the center and up
        vx: isLeft ? (Math.random() * 12 + 6) : -(Math.random() * 12 + 6),
        vy: -(Math.random() * 15 + 10),
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        opacity: 1,
        gravity: 0.3,
        decay: 0.985,
        width: Math.random() * 8 + 4,
        height: Math.random() * 12 + 6,
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let active = false

      particles.forEach((p) => {
        if (p.opacity <= 0) return
        active = true

        // Update physics
        p.vx *= p.decay
        p.vy += p.gravity
        p.vy *= p.decay
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed
        p.opacity -= 0.006 // gradual fade

        // Draw particle (rotating rectangle)
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height)
        ctx.restore()
      })

      if (active) {
        animationFrameId = requestAnimationFrame(render)
      }
    }

    render()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 animate-fade-in"
      style={{ width: '100%', height: '100%' }}
    />
  )
}

export default function Trainer() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('adaptfit_user') || '{"id":1,"name":"User"}')

  // Recommendation Settings
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

  // Active Workout Mode States
  const [activeWorkout, setActiveWorkout] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [timerPaused, setTimerPaused] = useState(false)
  const [completedExercises, setCompletedExercises] = useState([])
  const [workoutFeedback, setWorkoutFeedback] = useState('')
  const [workoutNotes, setWorkoutNotes] = useState('')
  const [actualDuration, setActualDuration] = useState(35)
  const [loggingProgress, setLoggingProgress] = useState(false)
  const [celebration, setCelebration] = useState(false)

  // Timer interval loop
  useEffect(() => {
    let interval = null
    if (activeWorkout && !timerPaused) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeWorkout, timerPaused])

  // Sync actual duration from live timer in minutes
  useEffect(() => {
    if (activeWorkout) {
      const minutes = Math.max(1, Math.round(elapsedSeconds / 60))
      setActualDuration(minutes)
    }
  }, [elapsedSeconds, activeWorkout])

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

  const startWorkout = () => {
    setActiveWorkout(true)
    setElapsedSeconds(0)
    setTimerPaused(false)
    setCompletedExercises([])
    setWorkoutFeedback('')
    setWorkoutNotes('')
  }

  const toggleExerciseComplete = (id) => {
    setCompletedExercises(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const logWorkout = async () => {
    setLoggingProgress(true)
    try {
      const token = localStorage.getItem('adaptfit_token')
      const res = await fetch(`${API}/api/workout-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: user.id,
          workoutName: result.recommendationName,
          goal: result.goal,
          workoutType: result.workoutType,
          exerciseIds: result.exercises.map(ex => ex.id),
          actualDurationMinutes: actualDuration,
          energyLevel: energy,
          recoveryLevel: recovery,
          performedAt: new Date().toISOString().slice(0, 19),
          feedback: workoutFeedback,
          notes: workoutNotes
        })
      })

      if (res.status === 201 || res.status === 200) {
        setCelebration(true)
        playVictorySound()
      } else {
        const err = await res.json()
        setError(err.message || 'Could not save workout log.')
      }
    } catch (e) {
      setError('Connection to backend failed. Log was not saved.')
    }
    setLoggingProgress(false)
  }

  const cancelWorkout = () => {
    if (confirm('Cancel this active workout? Timer and progress will be lost.')) {
      setActiveWorkout(false)
      setElapsedSeconds(0)
      setCompletedExercises([])
    }
  }

  // Active workout checklist details
  const totalExercises = result?.exercises?.length || 0
  const totalCompletedCount = completedExercises.length
  const progressPercent = totalExercises > 0 ? Math.round((totalCompletedCount / totalExercises) * 100) : 0
  const estimatedCaloriesBurned = result?.exercises
    ?.filter(ex => completedExercises.includes(ex.id))
    ?.reduce((sum, ex) => sum + (ex.caloriesEstimate || 0), 0) || 0

  // Identify next active exercise
  const currentActiveExerciseId = result?.exercises?.find(ex => !completedExercises.includes(ex.id))?.id

  // Active Workout Mode UI Cockpit
  if (activeWorkout) {
    return (
      <div className="p-8 page-enter relative min-h-screen">
        {/* Victory Celebration Modal */}
        {celebration && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 page-enter">
            <ConfettiParticles />
            <div className="bg-theme-surface border border-white/10 rounded-3xl p-8 max-w-md w-full text-center glow-card flex flex-col items-center relative z-10 animate-scale-up">
              <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6 border border-yellow-500/20 float">
                <Award size={42} className="text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Workout Crushed! 🎉</h2>
              <p className="text-white/40 text-sm mb-6">Fantastic job, {user.name}! Your activity details have been securely logged to your history profile.</p>

              <div className="grid grid-cols-3 gap-3 w-full mb-8">
                <div className="bg-white/2 border border-white/5 rounded-2xl p-4">
                  <Clock size={18} style={{ color: 'var(--theme-primary)' }} className="mx-auto mb-2" />
                  <p className="font-semibold text-lg text-white">{actualDuration}m</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">Minutes</p>
                </div>
                <div className="bg-white/2 border border-white/5 rounded-2xl p-4">
                  <CheckCircle2 size={18} style={{ color: 'var(--theme-secondary)' }} className="mx-auto mb-2" />
                  <p className="font-semibold text-lg text-white">{totalCompletedCount}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">Exercises</p>
                </div>
                <div className="bg-white/2 border border-white/5 rounded-2xl p-4">
                  <Flame size={18} className="text-orange-400 mx-auto mb-2" />
                  <p className="font-semibold text-lg text-white">{estimatedCaloriesBurned}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">Calories</p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-6">
                <span className="text-orange-400 text-sm font-semibold">Streak maintained! 🔥</span>
              </div>

              <button 
                onClick={() => {
                  setCelebration(false)
                  setActiveWorkout(false)
                  setResult(null)
                  navigate('/')
                }}
                className="w-full theme-gradient-primary-bg text-black font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-[var(--theme-primary)]/10 hover:opacity-90 text-sm"
              >
                Awesome, back to Dashboard!
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
          <div>
            <p className="text-theme-primary text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-1 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-theme-primary animate-ping" />
              Active workout session
            </p>
            <h1 className="text-2xl font-bold text-white truncate max-w-md">{result.recommendationName}</h1>
          </div>
          <button 
            onClick={cancelWorkout}
            className="flex items-center gap-1.5 bg-red-500/5 hover:bg-red-500/10 text-red-400 border border-red-500/10 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          >
            <X size={15} /> Cancel session
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="space-y-4 lg:col-span-1">
            {/* Session Timer Card */}
            <div className="bg-theme-surface border border-white/5 rounded-2xl p-6 glow-card flex flex-col items-center">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Elapsed time</p>
              <p className="text-5xl font-mono font-bold text-white tracking-widest mb-6 transition-all duration-200" style={{ color: timerPaused ? 'rgba(255,255,255,0.3)' : 'var(--theme-primary)' }}>
                {formatTimer(elapsedSeconds)}
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setTimerPaused(!timerPaused)}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition-all duration-200 border border-white/5"
                >
                  {timerPaused ? <Play size={16} className="text-theme-primary" /> : <Pause size={16} />}
                  {timerPaused ? 'Resume' : 'Pause'}
                </button>
              </div>
            </div>

            {/* Session Progress Card */}
            <div className="bg-theme-surface border border-white/5 rounded-2xl p-6 glow-card">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-3">Session Progress</p>
              <div className="flex items-end justify-between mb-1.5">
                <span className="text-sm font-semibold text-white">{progressPercent}% done</span>
                <span className="text-xs text-white/40">{totalCompletedCount} of {totalExercises} exercises</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-theme-primary rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
              </div>

              <div className="flex items-center gap-3 bg-white/2 border border-white/5 rounded-xl p-3">
                <Flame size={16} className="text-orange-400" />
                <div>
                  <p className="text-xs text-white/30">Est. Calories Burned</p>
                  <p className="text-sm font-bold text-white">{estimatedCaloriesBurned} kcal</p>
                </div>
              </div>
            </div>

            {/* Logger / Form Card */}
            <div className="bg-theme-surface border border-white/5 rounded-2xl p-6 glow-card space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <ClipboardList size={16} style={{ color: 'var(--theme-primary)' }} />
                <h3 className="font-semibold text-sm text-white">Log Actual Metrics</h3>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Actual Duration (minutes)</p>
                <input 
                  type="number" 
                  value={actualDuration}
                  onChange={e => setActualDuration(Number(e.target.value))}
                  min="1" max="240"
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm outline-none text-white focus:border-white/20"
                />
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Feedback / Performance Review</p>
                <textarea 
                  value={workoutFeedback}
                  onChange={e => setWorkoutFeedback(e.target.value)}
                  placeholder="How did you feel? Was it too heavy or light?"
                  rows={2}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-sm outline-none text-white focus:border-white/20 resize-none placeholder-white/10"
                />
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Training Notes</p>
                <textarea 
                  value={workoutNotes}
                  onChange={e => setWorkoutNotes(e.target.value)}
                  placeholder="e.g. Increase dumbbells to 15kg next week."
                  rows={2}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-sm outline-none text-white focus:border-white/20 resize-none placeholder-white/10"
                />
              </div>

              <button 
                onClick={logWorkout} 
                disabled={loggingProgress}
                className="w-full theme-gradient-primary-bg text-black font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 pulse-glow shimmer disabled:opacity-50 hover:opacity-90 mt-2 text-sm"
              >
                {loggingProgress ? <Loader size={16} className="animate-spin" /> : '🏁 Finish & Log Workout'}
              </button>
              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            </div>
          </div>

          {/* Interactive Exercise List Column */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1 px-1">Exercise Checklist</p>
            {result.exercises?.map((ex, i) => {
              const isCompleted = completedExercises.includes(ex.id)
              const isActive = ex.id === currentActiveExerciseId

              return (
                <div 
                  key={ex.id}
                  onClick={() => toggleExerciseComplete(ex.id)}
                  className="glow-card shimmer rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all duration-300"
                  style={{
                    opacity: isCompleted ? 0.35 : 1,
                    borderColor: isCompleted 
                      ? 'rgba(255,255,255,0.05)' 
                      : isActive 
                        ? 'var(--theme-primary)' 
                        : 'var(--theme-border)',
                    boxShadow: isActive ? 'var(--theme-glow-hover)' : 'var(--theme-glow)'
                  }}
                >
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-300 flex-shrink-0"
                    style={{
                      backgroundColor: isCompleted ? 'rgba(255,255,255,0.05)' : 'rgba(var(--theme-primary-rgb), 0.1)',
                      color: isCompleted ? 'rgba(255,255,255,0.2)' : 'var(--theme-primary)',
                      border: isCompleted ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(var(--theme-primary-rgb), 0.2)'
                    }}
                  >
                    {isCompleted ? '✓' : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm text-white truncate">{ex.name}</p>
                      {isActive && (
                        <span className="text-[9px] font-bold text-black uppercase tracking-wider theme-gradient-primary-bg px-2 py-0.5 rounded-full animate-pulse">
                          Current Focus
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 truncate">{ex.muscleGroup} · {ex.equipment} · {ex.durationMinutes}min · {ex.caloriesEstimate} cal</p>
                    <p className="text-xs text-white/30 mt-2 leading-relaxed italic">{ex.description}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full flex-shrink-0 border font-medium ${
                    ex.intensity === 'LOW' ? 'bg-green-500/5 text-green-400 border-green-500/10' :
                    ex.intensity === 'MODERATE' ? 'bg-yellow-500/5 text-yellow-400 border-yellow-500/10' :
                    'bg-red-500/5 text-red-400 border-red-500/10'
                  }`}>
                    {ex.intensity}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 page-enter">
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
          <div className="rounded-2xl p-5 glow-card" 
            style={{ 
              borderColor: 'rgba(var(--theme-secondary-rgb), 0.2)', 
              boxShadow: '0 0 20px rgba(var(--theme-secondary-rgb), 0.05)' 
            }}>
            <div className="flex items-center gap-2 mb-1">
              <Target size={14} style={{ color: 'var(--theme-secondary)' }} />
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
                    className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border"
                    style={{
                      backgroundColor: status === 'target' ? 'rgba(var(--theme-secondary-rgb), 0.15)' : status === 'injured' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.02)',
                      color: status === 'target' ? 'var(--theme-secondary)' : status === 'injured' ? '#f87171' : 'rgba(255,255,255,0.4)',
                      borderColor: status === 'target' ? 'rgba(var(--theme-secondary-rgb), 0.3)' : status === 'injured' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)'
                    }}>
                    {status === 'target' ? '🎯 ' : status === 'injured' ? '🚫 ' : ''}{muscle}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-4 mt-3">
              {targetMuscles.length > 0 && (
                <p className="text-xs" style={{ color: 'var(--theme-secondary)' }}>🎯 Targeting: {targetMuscles.join(', ')}</p>
              )}
              {injuries.length > 0 && (
                <p className="text-xs text-red-400/70">🚫 Avoiding: {injuries.join(', ')}</p>
              )}
            </div>
            {(targetMuscles.length > 0 || injuries.length > 0) && (
              <button onClick={() => { setTargetMuscles([]); setInjuries([]) }}
                className="text-xs text-white/20 hover:text-white/50 mt-2 flex items-center gap-1 transition-colors duration-200">
                <X size={10} /> Clear all
              </button>
            )}
          </div>

          {/* Time */}
          <div className="glow-card rounded-2xl p-5">
            <div className="flex justify-between mb-3">
              <p className="text-xs text-white/40 uppercase tracking-wider">Available time</p>
              <p className="text-sm font-medium" style={{ color: 'var(--theme-primary)' }}>{time} min</p>
            </div>
            <input type="range" min="10" max="90" step="5" value={time}
              onChange={e => setTime(Number(e.target.value))} 
              className="w-full cursor-pointer" 
              style={{ accentColor: 'var(--theme-primary)' }}
            />
            <div className="flex justify-between text-xs text-white/20 mt-1">
              <span>10 min</span><span>90 min</span>
            </div>
          </div>

          <button onClick={generate} disabled={loading}
            className="w-full theme-gradient-primary-bg text-black font-semibold py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 pulse-glow shimmer disabled:opacity-50 hover:opacity-90">
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
            <div className="glow-card rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center min-h-[300px]">
              <div className="float">
                <Zap size={48} style={{ color: 'var(--theme-primary)', opacity: 0.2 }} className="mb-4" />
              </div>
              <p className="text-white/20 text-sm">Your personalized workout will appear here</p>
              {targetMuscles.length > 0 && <p className="text-xs mt-2" style={{ color: 'rgba(var(--theme-secondary-rgb), 0.6)' }}>🎯 Focus: {targetMuscles.join(', ')}</p>}
              {injuries.length > 0 && <p className="text-red-400/50 text-xs mt-1">🚫 Avoiding: {injuries.join(', ')}</p>}
            </div>
          )}

          {result && (
            <div className="gradient-border rounded-2xl p-6 space-y-5">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs px-3 py-1 rounded-full border font-medium"
                    style={{ 
                      backgroundColor: 'rgba(var(--theme-primary-rgb), 0.08)', 
                      color: 'var(--theme-primary)',
                      borderColor: 'rgba(var(--theme-primary-rgb), 0.2)'
                    }}>
                    {result.workoutType}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full border font-medium"
                    style={{ 
                      backgroundColor: 'rgba(var(--theme-secondary-rgb), 0.08)', 
                      color: 'var(--theme-secondary)',
                      borderColor: 'rgba(var(--theme-secondary-rgb), 0.2)'
                    }}>
                    {result.goal?.replace(/_/g, ' ')}
                  </span>
                  {targetMuscles.length > 0 && (
                    <span className="text-xs px-3 py-1 rounded-full border font-medium"
                      style={{ 
                        backgroundColor: 'rgba(var(--theme-secondary-rgb), 0.08)', 
                        color: 'var(--theme-secondary)',
                        borderColor: 'rgba(var(--theme-secondary-rgb), 0.2)'
                      }}>
                      🎯 {targetMuscles.join(', ')}
                    </span>
                  )}
                  {injuries.length > 0 && (
                    <span className="text-xs bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20 font-medium">🚫 {injuries.length} avoided</span>
                  )}
                </div>
                <h2 className="text-xl font-semibold">{result.recommendationName}</h2>
                <p className="text-white/40 text-sm mt-2">{result.recommendationReason}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[[Clock, `${result.estimatedDurationMinutes}m`, 'Duration'], [Zap, result.intensity, 'Intensity'], [Flame, result.exercises?.length, 'Exercises']].map(([Icon, val, label]) => (
                  <div key={label} className="bg-white/2 rounded-xl p-3 text-center border border-white/5">
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
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold text-black flex-shrink-0 theme-gradient-primary-bg">{i + 1}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-white">{ex.name}</p>
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

              {/* Start Workout Button */}
              <button 
                onClick={startWorkout}
                className="w-full theme-gradient-primary-bg text-black font-bold py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 pulse-glow shadow-lg shadow-[var(--theme-primary)]/10 hover:opacity-90 text-sm mt-4"
              >
                🚀 Start Workout Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
