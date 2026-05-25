import { useState } from 'react'
import { motion } from 'framer-motion'

const getBMIInfo = (bmi) => {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', tip: 'Focus on muscle gain and calorie surplus.' }
  if (bmi < 25) return { label: 'Normal weight', color: 'text-theme-primary', bg: 'rgba(var(--theme-primary-rgb), 0.1)', border: 'rgba(var(--theme-primary-rgb), 0.2)', tip: 'Great! Maintain with balanced workouts.' }
  if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-400', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.2)', tip: 'Focus on cardio and calorie deficit.' }
  return { label: 'Obese', color: 'text-red-400', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', tip: 'Consult a doctor and start with light workouts.' }
}

export default function BMICalculator() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('MALE')
  const [activity, setActivity] = useState(1.55)
  const [goal, setGoal] = useState('MAINTAIN')
  const [result, setResult] = useState(null)

  const calculate = () => {
    const h = parseFloat(height) / 100
    const w = parseFloat(weight)
    const a = parseInt(age)
    if (!h || !w || !a) return

    const bmi = w / (h * h)
    const bmr = gender === 'MALE'
      ? 10 * w + 6.25 * (h * 100) - 5 * a + 5
      : 10 * w + 6.25 * (h * 100) - 5 * a - 161
    const tdee = bmr * activity
    const calories = goal === 'LOSE' ? tdee - 500 : goal === 'GAIN' ? tdee + 300 : tdee

    setResult({ bmi: bmi.toFixed(1), bmr: Math.round(bmr), tdee: Math.round(tdee), calories: Math.round(calories) })
  }

  const info = result ? getBMIInfo(parseFloat(result.bmi)) : null
  const pct = result ? Math.min(100, Math.max(0, ((parseFloat(result.bmi) - 15) / 25) * 100)) : 0

  const ACTIVITIES = [
    { label: 'Sedentary', value: 1.2 },
    { label: 'Light', value: 1.375 },
    { label: 'Moderate', value: 1.55 },
    { label: 'Active', value: 1.725 },
    { label: 'Very active', value: 1.9 },
  ]

  return (
    <div className="p-8 page-enter">
      <div className="mb-8">
        <p className="text-white/40 text-sm mb-1">Body metrics</p>
        <h1 className="text-3xl font-semibold">BMI Calculator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="bg-theme-surface border border-white/5 rounded-2xl p-6 space-y-4 glow-card">
            <div className="grid grid-cols-2 gap-3">
              {[['Height (cm)', height, setHeight], ['Weight (kg)', weight, setWeight], ['Age', age, setAge]].map(([label, val, set]) => (
                <div key={label} className={label === 'Age' ? 'col-span-2' : ''}>
                  <p className="text-xs text-white/40 mb-1">{label}</p>
                  <input type="number" value={val} onChange={e => set(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-white/20 text-white" />
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs text-white/40 mb-2">Gender</p>
              <div className="flex gap-2">
                {['MALE', 'FEMALE'].map(g => (
                  <button key={g} onClick={() => setGender(g)} 
                    className="flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                    style={gender === g ? { backgroundColor: 'var(--theme-primary)', color: 'black', fontWeight: 600 } : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-white/40 mb-2">Activity level</p>
              <div className="flex flex-wrap gap-2">
                {ACTIVITIES.map(a => (
                  <button key={a.value} onClick={() => setActivity(a.value)} 
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                    style={activity === a.value ? { backgroundColor: 'var(--theme-secondary)', color: 'black', fontWeight: 600 } : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-white/40 mb-2">Goal</p>
              <div className="flex gap-2">
                {[['LOSE', 'Lose fat'], ['MAINTAIN', 'Maintain'], ['GAIN', 'Gain muscle']].map(([val, label]) => (
                  <button key={val} onClick={() => setGoal(val)} 
                    className="flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                    style={goal === val ? { backgroundColor: 'var(--theme-primary)', color: 'black', fontWeight: 600 } : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={calculate} className="w-full theme-gradient-primary-bg hover:opacity-90 text-black font-semibold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-[var(--theme-primary)]/10 pulse-glow shimmer">
            Calculate
          </button>
        </div>

        {/* Result */}
        <div>
          {!result ? (
            <div className="bg-theme-surface border border-white/5 rounded-2xl p-8 h-full flex items-center justify-center text-white/20 text-sm glow-card min-h-[300px]">
              Fill in your details and calculate
            </div>
          ) : (
            <div className="bg-theme-surface border border-white/5 rounded-2xl p-6 space-y-5 glow-card">
              <div className="rounded-xl p-4 border" style={{ backgroundColor: info.bg, borderColor: info.border }}>
                <p className="text-xs text-white/40 mb-1">Your BMI</p>
                <p className={`text-4xl font-semibold ${info.color}`}>{result.bmi}</p>
                <p className={`text-sm font-medium mt-1 ${info.color}`}>{info.label}</p>
              </div>

              {/* BMI meter */}
              <div>
                <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">BMI Classification Spectrum</p>
                <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500 relative shadow-inner overflow-visible">
                  {/* Sliding needle pointer with live score tooltip */}
                  <motion.div 
                    initial={{ left: 0 }}
                    animate={{ left: `${pct}%` }}
                    transition={{ type: 'spring', stiffness: 85, damping: 14 }}
                    className="absolute -top-1 w-5 h-5 rounded-full bg-white border-4 border-[#0f1411] flex items-center justify-center pulse-glow z-10 shadow-lg cursor-pointer"
                    style={{ transform: 'translateX(-50%)' }}
                  >
                    {/* Floating Tooltip */}
                    <div className="absolute -top-11 bg-[#0f1411] border border-white/15 px-3 py-1 rounded-lg text-xs font-bold text-white shadow-2xl pointer-events-none flex items-center gap-1.5 glow-card">
                      <span className="w-1.5 h-1.5 rounded-full bg-theme-primary" />
                      {result.bmi}
                    </div>
                    {/* Tooltip caret arrow */}
                    <div className="absolute -top-3 w-1.5 h-1.5 bg-[#0f1411] border-r border-b border-white/10 rotate-45 pointer-events-none" />
                  </motion.div>
                </div>
                <div className="flex justify-between text-xs text-white/20 mt-3 font-semibold px-1">
                  <span>15 (Under)</span>
                  <span>18.5 (Normal)</span>
                  <span>25 (Over)</span>
                  <span>30 (Obese)</span>
                  <span>40</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[['BMR', result.bmr + ' cal', 'Base metabolic rate'], ['TDEE', result.tdee + ' cal', 'Daily energy use'], ['Target', result.calories + ' cal', goal === 'LOSE' ? 'Deficit' : goal === 'GAIN' ? 'Surplus' : 'Maintain']].map(([label, val, sub]) => (
                  <div key={label} className="bg-white/2 border border-white/5 rounded-xl p-3 text-center">
                    <p className="text-xs text-white/40 mb-1">{label}</p>
                    <p className="font-semibold text-sm text-white">{val}</p>
                    <p className="text-xs text-white/30 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white/2 border border-white/5 rounded-xl p-4">
                <p className="text-xs text-white/40 mb-1">Recommendation</p>
                <p className="text-sm text-white/70">{info.tip}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}