import { useState, useEffect } from 'react'
import { Search, Plus, Pencil, Trash2, X, Check } from 'lucide-react'

const API = localStorage.getItem('adaptfit_url') || 'http://localhost:8080'
const TYPES = ['ALL', 'LIGHT', 'STRENGTH', 'CARDIO', 'COMPACT', 'MOBILITY', 'MIXED']
const INTENSITIES = ['ALL', 'LOW', 'MODERATE', 'HIGH']

export default function Exercises() {
  const [exercises, setExercises] = useState([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [intensityFilter, setIntensityFilter] = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', workoutType: 'STRENGTH', intensity: 'MODERATE', equipment: 'NONE', muscleGroup: '', durationMinutes: 12, caloriesEstimate: 100 })

  const token = localStorage.getItem('adaptfit_token')
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  const fetchExercises = async () => {
    try {
      const res = await fetch(`${API}/api/exercises`, { headers })
      const data = await res.json()
      setExercises(data)
    } catch (e) {}
  }

  useEffect(() => { fetchExercises() }, [])

  const filtered = exercises.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'ALL' || ex.workoutType === typeFilter
    const matchIntensity = intensityFilter === 'ALL' || ex.intensity === intensityFilter
    return matchSearch && matchType && matchIntensity
  })

  const save = async () => {
    try {
      const url = editing ? `${API}/api/exercises/${editing.id}` : `${API}/api/exercises`
      const method = editing ? 'PUT' : 'POST'
      await fetch(url, { method, headers, body: JSON.stringify(form) })
      fetchExercises()
      setShowForm(false)
      setEditing(null)
      setForm({ name: '', description: '', workoutType: 'STRENGTH', intensity: 'MODERATE', equipment: 'NONE', muscleGroup: '', durationMinutes: 12, caloriesEstimate: 100 })
    } catch (e) {}
  }

  const del = async (id) => {
    if (!confirm('Delete this exercise?')) return
    await fetch(`${API}/api/exercises/${id}`, { method: 'DELETE', headers })
    fetchExercises()
  }

  const startEdit = (ex) => {
    setEditing(ex)
    setForm({ name: ex.name, description: ex.description, workoutType: ex.workoutType, intensity: ex.intensity, equipment: ex.equipment, muscleGroup: ex.muscleGroup, durationMinutes: ex.durationMinutes, caloriesEstimate: ex.caloriesEstimate })
    setShowForm(true)
  }

  const intensityColor = (i) => i === 'LOW' ? 'text-green-400 bg-green-500/10' : i === 'MODERATE' ? 'text-yellow-400 bg-yellow-500/10' : 'text-red-400 bg-red-500/10'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-white/40 text-sm mb-1">Exercise library</p>
          <h1 className="text-3xl font-semibold">Exercises</h1>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null) }} className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm">
          <Plus size={16} /> Add exercise
        </button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exercises..." className="w-full bg-[#111] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${typeFilter === t ? 'bg-green-500 text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}>{t}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {INTENSITIES.map(i => (
            <button key={i} onClick={() => setIntensityFilter(i)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${intensityFilter === i ? 'bg-purple-500 text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}>{i}</button>
          ))}
        </div>
      </div>

      {/* Exercise list */}
      <div className="space-y-2">
        <p className="text-xs text-white/30 mb-3">{filtered.length} exercises</p>
        {filtered.map(ex => (
          <div key={ex.id} className="bg-[#111] border border-white/5 hover:border-white/10 rounded-xl p-4 flex items-center gap-4 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm">{ex.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${intensityColor(ex.intensity)}`}>{ex.intensity}</span>
              </div>
              <p className="text-xs text-white/30">{ex.workoutType} · {ex.muscleGroup} · {ex.equipment} · {ex.durationMinutes}min · {ex.caloriesEstimate} cal</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(ex)} className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors"><Pencil size={14} className="text-white/40" /></button>
              <button onClick={() => del(ex.id)} className="w-8 h-8 bg-white/5 hover:bg-red-500/10 rounded-lg flex items-center justify-center transition-colors"><Trash2 size={14} className="text-white/40 hover:text-red-400" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold">{editing ? 'Edit exercise' : 'Add exercise'}</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-white/40" /></button>
            </div>
            <div className="space-y-3">
              {[['Name', 'name', 'text'], ['Muscle group', 'muscleGroup', 'text'], ['Equipment', 'equipment', 'text']].map(([label, key, type]) => (
                <div key={key}>
                  <p className="text-xs text-white/40 mb-1">{label}</p>
                  <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-white/20" />
                </div>
              ))}
              <div>
                <p className="text-xs text-white/40 mb-1">Description</p>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-white/20 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-white/40 mb-1">Type</p>
                  <select value={form.workoutType} onChange={e => setForm({ ...form, workoutType: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm outline-none">
                    {['LIGHT','STRENGTH','CARDIO','COMPACT','MOBILITY','MIXED'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Intensity</p>
                  <select value={form.intensity} onChange={e => setForm({ ...form, intensity: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm outline-none">
                    {['LOW','MODERATE','HIGH'].map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Minutes</p>
                  <input type="number" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })} className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm outline-none" />
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Calories</p>
                  <input type="number" value={form.caloriesEstimate} onChange={e => setForm({ ...form, caloriesEstimate: Number(e.target.value) })} className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-sm outline-none" />
                </div>
              </div>
            </div>
            <button onClick={save} className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold py-3 rounded-xl mt-5 transition-colors flex items-center justify-center gap-2">
              <Check size={16} /> {editing ? 'Save changes' : 'Add exercise'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}