import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Loader, Bot, User, Minimize2 } from 'lucide-react'

const SUGGESTED = [
  "What workout should I do today?",
  "How can I lose fat faster?",
  "Give me a 7 day plan",
  "What should I eat for muscle gain?",
  "How to recover after workout?",
]

function TypewriterText({ text, speed = 15, onChar }) {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let index = 0
    let isMounted = true
    setDisplayedText('')

    const interval = setInterval(() => {
      if (index < text.length) {
        if (isMounted) {
          setDisplayedText(prev => prev + text.charAt(index))
          if (onChar) onChar()
        }
        index++
      } else {
        clearInterval(interval)
      }
    }, speed)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [text, speed])

  return <span>{displayedText}</span>
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey! I'm your AdaptFit AI trainer 💪 Ask me anything about workouts, nutrition, recovery, or your fitness goals!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuggested, setShowSuggested] = useState(true)
  const bottomRef = useRef(null)

  const user = (() => { try { return JSON.parse(localStorage.getItem('adaptfit_user')) } catch { return null } })()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text) => {
    const userMessage = text || input.trim()
    if (!userMessage || loading) return
    setInput('')
    setShowSuggested(false)
    const newMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const API = import.meta.env.VITE_API_URL || localStorage.getItem('adaptfit_url') || 'http://localhost:8080'
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          userName: user?.name || 'User',
          history: newMessages.slice(1, -1).map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          }))
        })
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || "Sorry, I couldn't get a response!"
      }])
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Could not connect to backend. Make sure it is running!'
      }])
    }
    setLoading(false)
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl pulse-glow"
        style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={22} className="text-black" /></motion.div>
            : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle size={22} className="text-black" /></motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {!open && <div className="fixed bottom-16 right-6 z-50 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0a0a0a]" />}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 w-96 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            style={{ background: '#111', maxHeight: '560px', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, #0a1a0f, #111)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                <Bot size={18} className="text-black" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">AdaptFit AI</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-xs text-white/40">Online · Fitness expert</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/20 hover:text-white/60 transition-colors">
                <Minimize2 size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '340px' }}>
              {messages.map((msg, i) => {
                const isLastAssistantMessage = i === messages.length - 1 && msg.role === 'assistant'
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-green-500/10' : 'bg-white/5'}`}>
                      {msg.role === 'assistant' ? <Bot size={14} className="text-green-400" /> : <User size={14} className="text-white/40" />}
                    </div>
                    <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'assistant' ? 'bg-white/5 text-white/80 rounded-tl-sm' : 'text-black rounded-tr-sm'}`}
                      style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #22c55e, #16a34a)' } : {}}>
                      {isLastAssistantMessage ? (
                        <TypewriterText 
                          text={msg.content} 
                          onChar={() => {
                            bottomRef.current?.scrollIntoView({ behavior: 'auto' })
                          }}
                        />
                      ) : (
                        msg.content
                      )}
                    </div>
                  </motion.div>
                )
              })}

              {loading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Bot size={14} className="text-green-400" />
                  </div>
                  <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 border border-green-500/10">
                    {[0,1,2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: '#22c55e',
                          boxShadow: '0 0 8px #22c55e',
                        }}
                        animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggested */}
            <AnimatePresence>
              {showSuggested && messages.length <= 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="px-4 pb-2 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {SUGGESTED.map(s => (
                    <button key={s} onClick={() => send(s)}
                      className="text-xs bg-white/5 border border-white/5 hover:border-green-500/30 hover:bg-green-500/5 text-white/50 hover:text-white/80 px-3 py-1.5 rounded-full whitespace-nowrap transition-all flex-shrink-0">
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="p-3 border-t border-white/5">
              <div className="flex gap-2 items-center">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-green-500/30 transition-all"
                />
                <motion.button onClick={() => send()} disabled={!input.trim() || loading}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-all"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                  {loading ? <Loader size={15} className="text-black animate-spin" /> : <Send size={15} className="text-black" />}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
