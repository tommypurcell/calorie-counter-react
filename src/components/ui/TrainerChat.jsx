// src/components/ui/TrainerChat.jsx
import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { supabase } from '../../lib/supabase'
import ReactMarkdown from 'react-markdown'

export default function TrainerChat() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  // auto-scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  // Add intro message when chat opens for first time
  function handleOpen() {
    if (!open && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: "Hey there 👋 I'm your AI Trainer. I can review your recent food and exercise logs and give feedback or advice. How are you feeling today?"
        }
      ])
    }
    setOpen(true)
  }

  async function sendMessage() {
    if (!input.trim()) return
    const newMsg = { role: 'user', content: input }
    setMessages((m) => [...m, newMsg])
    setInput('')
    setLoading(true)

    try {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      const { data } = await axios.post('http://localhost:5050/api/trainer', { message: newMsg.content }, { headers: { Authorization: `Bearer ${session.access_token}` } })

      setMessages((m) => [...m, { role: 'assistant', content: data.message }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: '⚠️ Trainer not available right now.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 left-8 z-50">
      {open && (
        <div className="w-80 h-96 bg-white border shadow-xl rounded-lg flex flex-col">
          <div className="p-2 border-b flex justify-between items-center bg-gray-100">
            <span className="font-semibold">AI Trainer</span>
            <button onClick={() => setOpen(false)} className="text-sm text-gray-600">
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-2 text-sm bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`${m.role === 'user' ? 'text-right text-blue-700' : 'text-left text-gray-800'}`}>
                <div className={`inline-block px-2 py-1 rounded-lg ${m.role === 'user' ? 'bg-blue-100' : 'bg-gray-200'}`}>
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2 border-t flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask your trainer..." className="flex-1 border rounded px-2 py-1 text-sm" onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
            <button onClick={sendMessage} disabled={loading} className="bg-black text-white px-3 rounded text-sm h-8 flex items-center justify-center">
              {loading ? (
                <span className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                </span>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!open && (
        <button onClick={handleOpen} className="bg-black text-white rounded-full p-4 shadow-lg hover:opacity-90">
          💬
        </button>
      )}
    </div>
  )
}
