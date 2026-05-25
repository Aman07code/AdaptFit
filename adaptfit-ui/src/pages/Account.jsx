import { useState, useEffect } from 'react'
import { User, Link, LogOut, Check, Palette, Award, Bell, Trash2, Sliders, Info } from 'lucide-react'

const API = localStorage.getItem('adaptfit_url') || 'http://localhost:8080'

const THEMES = [
  { id: 'emerald', name: 'Emerald Aurora', colors: ['#22c55e', '#06b6d4', '#3b82f6'] },
  { id: 'crimson', name: 'Cyber Crimson', colors: ['#f43f5e', '#ec4899', '#f59e0b'] },
  { id: 'cosmic', name: 'Cosmic Twilight', colors: ['#a855f7', '#6366f1', '#ec4899'] },
  { id: 'stealth', name: 'Classic Stealth', colors: ['#ffffff', '#71717a', '#27272a'] },
]

export default function Account({ theme, setTheme }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('adaptfit_user') || 'null'))
  const [url, setUrl] = useState(localStorage.getItem('adaptfit_url') || 'http://localhost:8080')
  const [urlSaved, setUrlSaved] = useState(false)

  // Persisted Fitness States
  const [fitnessLevel, setFitnessLevel] = useState(() => localStorage.getItem('adaptfit_fit_level') || 'INTERMEDIATE')
  const [reminderTime, setReminderTime] = useState(() => localStorage.getItem('adaptfit_reminder') || 'MORNING')
  const [currentWeight, setCurrentWeight] = useState(() => Number(localStorage.getItem('adaptfit_weight_curr') || '75'))
  const [targetWeight, setTargetWeight] = useState(() => Number(localStorage.getItem('adaptfit_weight_targ') || '70'))

  // Persisted System States
  const [units, setUnits] = useState(() => localStorage.getItem('adaptfit_units') || 'METRIC')
  const [soundsEnabled, setSoundsEnabled] = useState(() => localStorage.getItem('adaptfit_sounds') !== 'false')

  useEffect(() => {
    localStorage.setItem('adaptfit_fit_level', fitnessLevel)
  }, [fitnessLevel])

  useEffect(() => {
    localStorage.setItem('adaptfit_reminder', reminderTime)
  }, [reminderTime])

  useEffect(() => {
    localStorage.setItem('adaptfit_weight_curr', currentWeight.toString())
  }, [currentWeight])

  useEffect(() => {
    localStorage.setItem('adaptfit_weight_targ', targetWeight.toString())
  }, [targetWeight])

  useEffect(() => {
    localStorage.setItem('adaptfit_units', units)
  }, [units])

  useEffect(() => {
    localStorage.setItem('adaptfit_sounds', soundsEnabled.toString())
  }, [soundsEnabled])

  const saveUrl = () => {
    localStorage.setItem('adaptfit_url', url)
    setUrlSaved(true)
    setTimeout(() => setUrlSaved(false), 2000)
  }

  const logout = () => {
    localStorage.removeItem('adaptfit_token')
    localStorage.removeItem('adaptfit_user')
    setUser(null)
    window.location.reload()
  }

  const resetWorkoutData = () => {
    if (confirm('⚠️ WARNING: This will clear your target weights, local preferences, and log you out. Are you sure you want to reset your local cache?')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  // Weight progress calculations
  const weightDiff = Math.abs(currentWeight - targetWeight)
  const weightProgressPct = Math.min(100, Math.max(0, 100 - (weightDiff * 4))) // visual representation

  return (
    <div className="p-8 page-enter">
      <div className="mb-8">
        <p className="text-white/40 text-sm mb-1">Your settings & profile</p>
        <h1 className="text-3xl font-semibold">Account Portal</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column — User Profile & Theme Customizer */}
        <div className="space-y-4 lg:col-span-1">
          {/* Profile Card */}
          <div className="bg-theme-surface border border-white/5 rounded-2xl p-6 glow-card">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
                style={{ 
                  backgroundColor: 'rgba(var(--theme-primary-rgb), 0.1)', 
                  color: 'var(--theme-primary)' 
                }}>
                <User size={28} />
              </div>
              {user ? (
                <>
                  <p className="font-semibold text-lg text-white">{user.name}</p>
                  <p className="text-sm text-white/40">{user.email}</p>
                  <span className="mt-2 text-xs px-3 py-1 rounded-full font-medium"
                    style={{ 
                      backgroundColor: 'rgba(var(--theme-primary-rgb), 0.1)', 
                      color: 'var(--theme-primary)' 
                    }}>
                    Signed in
                  </span>
                </>
              ) : (
                <>
                  <p className="font-semibold text-lg text-white">Guest User</p>
                  <p className="text-sm text-white/40">Offline Profile</p>
                  <span className="mt-2 text-xs bg-white/5 text-white/40 px-3 py-1 rounded-full">Offline</span>
                </>
              )}
            </div>
            {user && (
              <button onClick={logout} className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-white/40 py-2.5 rounded-xl text-sm transition-all duration-200 border border-white/5">
                <LogOut size={15} /> Sign out
              </button>
            )}
          </div>

          {/* Theme Selector Customizer */}
          <div className="bg-theme-surface border border-white/5 rounded-2xl p-6 glow-card">
            <div className="flex items-center gap-2 mb-4">
              <Palette size={16} style={{ color: 'var(--theme-primary)' }} />
              <p className="text-sm font-medium text-white">Appearance Theme</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className="p-3 rounded-xl border text-left transition-all duration-200"
                  style={{
                    borderColor: theme === t.id ? 'var(--theme-primary)' : 'rgba(255,255,255,0.05)',
                    backgroundColor: theme === t.id ? 'rgba(var(--theme-primary-rgb), 0.05)' : 'rgba(255,255,255,0.02)'
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold" style={{ color: theme === t.id ? 'var(--theme-primary)' : 'rgba(255,255,255,0.7)' }}>{t.name}</span>
                    {theme === t.id && <Check size={12} style={{ color: 'var(--theme-primary)' }} />}
                  </div>
                  <div className="flex gap-1.5">
                    {t.colors.map((c, idx) => (
                      <div 
                        key={idx} 
                        className="w-3.5 h-3.5 rounded-full border border-black/10" 
                        style={{ backgroundColor: c }} 
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column — Fitness Goals & Weight Progress */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-theme-surface border border-white/5 rounded-2xl p-6 glow-card space-y-5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Award size={16} style={{ color: 'var(--theme-primary)' }} />
              <h2 className="font-semibold text-white">Fitness Goals & Level</h2>
            </div>

            {/* Fitness Level */}
            <div>
              <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Target Level</p>
              <div className="flex gap-2">
                {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setFitnessLevel(lvl)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                    style={{
                      backgroundColor: fitnessLevel === lvl ? 'var(--theme-primary)' : 'rgba(255,255,255,0.02)',
                      color: fitnessLevel === lvl ? 'black' : 'rgba(255,255,255,0.4)',
                      border: fitnessLevel === lvl ? '1px solid var(--theme-primary)' : '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Reminder Preference */}
            <div>
              <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Workout Reminders</p>
              <div className="flex gap-2">
                {['MORNING', 'AFTERNOON', 'EVENING', 'OFF'].map(rem => (
                  <button
                    key={rem}
                    onClick={() => setReminderTime(rem)}
                    className="flex-1 py-2 rounded-xl text-[10px] font-semibold transition-all duration-200"
                    style={{
                      backgroundColor: reminderTime === rem ? 'var(--theme-secondary)' : 'rgba(255,255,255,0.02)',
                      color: reminderTime === rem ? 'black' : 'rgba(255,255,255,0.4)',
                      border: reminderTime === rem ? '1px solid var(--theme-secondary)' : '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    {rem.charAt(0) + rem.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight Progression */}
            <div className="border-t border-white/5 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40 uppercase tracking-wider">Weight Tracking</span>
                <span className="text-xs text-theme-primary font-semibold">Goal Diff: {weightDiff} kg</span>
              </div>

              {/* Current Weight Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-white/40">Current weight</span>
                  <span className="font-semibold text-white">{currentWeight} kg</span>
                </div>
                <input 
                  type="range" min="45" max="130" step="1" 
                  value={currentWeight} 
                  onChange={e => setCurrentWeight(Number(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{ accentColor: 'var(--theme-primary)' }}
                />
              </div>

              {/* Target Weight Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-white/40">Target goal weight</span>
                  <span className="font-semibold text-white">{targetWeight} kg</span>
                </div>
                <input 
                  type="range" min="45" max="130" step="1" 
                  value={targetWeight} 
                  onChange={e => setTargetWeight(Number(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{ accentColor: 'var(--theme-secondary)' }}
                />
              </div>

              {/* Progress visualizer */}
              <div className="bg-white/2 border border-white/5 rounded-xl p-3.5">
                <div className="flex justify-between text-xs text-white/40 mb-2">
                  <span>Current: {currentWeight} kg</span>
                  <span>Target: {targetWeight} kg</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full theme-gradient-primary-bg rounded-full transition-all duration-300" style={{ width: `${weightProgressPct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — App Preferences & Database Reset */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-theme-surface border border-white/5 rounded-2xl p-6 glow-card space-y-5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Sliders size={16} style={{ color: 'var(--theme-primary)' }} />
              <h2 className="font-semibold text-white">App Preferences</h2>
            </div>

            {/* Measurement Units */}
            <div>
              <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Metrics Unit system</p>
              <div className="flex gap-2">
                {['METRIC', 'IMPERIAL'].map(unit => (
                  <button
                    key={unit}
                    onClick={() => setUnits(unit)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                    style={{
                      backgroundColor: units === unit ? 'var(--theme-secondary)' : 'rgba(255,255,255,0.02)',
                      color: units === unit ? 'black' : 'rgba(255,255,255,0.4)',
                      border: units === unit ? '1px solid var(--theme-secondary)' : '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    {unit === 'METRIC' ? 'Metric (kg/cm)' : 'Imperial (lb/in)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound alerts toggle */}
            <div className="flex items-center justify-between bg-white/2 border border-white/5 rounded-xl p-4">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Session Sound Alerts</span>
                <span className="text-[10px] text-white/30">Play sound when checking off tasks</span>
              </div>
              <input 
                type="checkbox"
                checked={soundsEnabled}
                onChange={() => setSoundsEnabled(!soundsEnabled)}
                className="w-5 h-5 cursor-pointer accent-theme-primary"
                style={{ accentColor: 'var(--theme-primary)' }}
              />
            </div>

            {/* Technical Information */}
            <div className="bg-white/2 border border-white/5 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-white/40 mb-1">
                <Info size={13} />
                <span className="font-semibold">System Details</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/30">Client Build:</span>
                <span className="text-white/60 font-mono">v8.0.11</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/30">Server Status:</span>
                <span className="text-green-400 font-semibold">Online</span>
              </div>
            </div>

            {/* Technical Reset Cache */}
            <div className="border-t border-white/5 pt-4 space-y-2">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Technical Administration</p>
              <button 
                onClick={resetWorkoutData}
                className="w-full flex items-center justify-center gap-2 bg-red-500/5 hover:bg-red-500/10 text-red-400 border border-red-500/10 hover:border-red-500/20 py-3 rounded-xl text-sm font-medium transition-all duration-200"
              >
                <Trash2 size={15} /> Reset Local Cache
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Developer settings collapsed details */}
      <div className="mt-8 border-t border-white/5 pt-6 select-none">
        <details className="group">
          <summary className="text-xs text-white/20 hover:text-white/40 cursor-pointer list-none flex items-center gap-1.5 w-fit transition-colors duration-200">
            <Sliders size={12} className="group-open:rotate-90 transition-transform duration-200" />
            <span>Developer Diagnostics Settings</span>
          </summary>
          <div className="mt-4 p-5 rounded-2xl bg-white/1 border border-white/5 max-w-md glow-card text-left page-enter">
            <div className="flex items-center gap-2 mb-3">
              <Link size={14} className="text-white/40" />
              <p className="text-xs font-semibold text-white/60">Local API Connection Server URL</p>
            </div>
            <p className="text-[10px] text-white/30 mb-3">Modify the default API connection port here if your local Spring Boot configuration differs.</p>
            <div className="flex gap-2">
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="flex-1 bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs outline-none focus:border-white/20 text-white"
              />
              <button onClick={saveUrl} className="theme-gradient-primary-bg hover:opacity-90 text-black font-semibold px-4 py-2 rounded-xl text-xs transition-all duration-200 shadow-lg shadow-[var(--theme-primary)]/10">
                {urlSaved ? 'Saved!' : 'Save'}
              </button>
            </div>
          </div>
        </details>
      </div>

    </div>
  )
}