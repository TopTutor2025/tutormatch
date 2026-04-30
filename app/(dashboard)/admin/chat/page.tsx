'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Send, MessageSquare } from 'lucide-react'

export default function AdminChatPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState('')
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConv, setActiveConv] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [search, setSearch] = useState('')
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [showNewConv, setShowNewConv] = useState(false)
  const [newConvUser, setNewConvUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        loadConversations(user.id)
        loadUsers()
      }
    })
  }, [])

  useEffect(() => {
    if (!activeConv || !userId) return
    loadMessages(activeConv)
    const channel = supabase.channel(`admin-msg:${activeConv}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConv}` },
        payload => setMessages(prev => [...prev, payload.new])
      ).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [activeConv, userId])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function loadConversations(uid: string) {
    const { data } = await supabase.from('conversations')
      .select(`*, student:profiles!conversations_student_id_fkey(*), tutor:profiles!conversations_tutor_id_fkey(*)`)
      .or(`student_id.eq.${uid},tutor_id.eq.${uid}`)
      .order('created_at', { ascending: false })
    setConversations(data || [])
    if (data && data.length > 0 && !activeConv) setActiveConv(data[0].id)
  }

  async function loadUsers() {
    const { data } = await supabase.from('profiles').select('*').in('role', ['studente', 'tutor'])
    setAllUsers(data || [])
  }

  async function loadMessages(convId: string) {
    const { data } = await supabase.from('messages').select(`*, sender:profiles(*)`).eq('conversation_id', convId).order('created_at', { ascending: true })
    setMessages(data || [])
  }

  async function sendMessage() {
    if (!newMessage.trim() || !activeConv) return
    await supabase.from('messages').insert({ conversation_id: activeConv, sender_id: userId, content: newMessage.trim() })
    setNewMessage('')
  }

  async function startConversation(user: any) {
    if (!userId) return
    let convData: any = null
    if (user.role === 'studente') {
      const { data: existing } = await supabase.from('conversations').select('*').eq('student_id', user.id).eq('tutor_id', userId).single()
      if (existing) { convData = existing }
      else {
        const { data: newConv } = await supabase.from('conversations').insert({ student_id: user.id, tutor_id: userId, is_support: true }).select().single()
        convData = newConv
      }
    } else {
      const { data: existing } = await supabase.from('conversations').select('*').eq('student_id', userId).eq('tutor_id', user.id).single()
      if (existing) { convData = existing }
      else {
        const { data: newConv } = await supabase.from('conversations').insert({ student_id: userId, tutor_id: user.id, is_support: true }).select().single()
        convData = newConv
      }
    }
    if (convData) {
      setActiveConv(convData.id)
      setShowNewConv(false)
      loadConversations(userId)
    }
  }

  function getPartnerName(conv: any) {
    const s = conv.student
    const t = conv.tutor
    if (s?.id === userId) return `${t?.first_name} ${t?.last_name} (Tutor)`
    return `${s?.first_name} ${s?.last_name} (${s?.role === 'tutor' ? 'Tutor' : 'Studente'})`
  }

  const filteredUsers = allUsers.filter(u => `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Chat di Supporto</h1>
          <p className="text-gray-500 mt-1">Comunica con studenti e tutor</p>
        </div>
        <button onClick={() => setShowNewConv(!showNewConv)} className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-2xl hover:bg-gray-800 transition-colors">
          + Nuova chat
        </button>
      </div>

      {showNewConv && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
          <h3 className="font-semibold mb-4">Avvia conversazione con</h3>
          <input type="text" placeholder="Cerca utente..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 mb-3"
          />
          <div className="max-h-48 overflow-y-auto space-y-1">
            {filteredUsers.map(user => (
              <button key={user.id} onClick={() => startConversation(user)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left">
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                  <p className="text-xs text-gray-400 capitalize">{user.role} · {user.email}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
        <div className="flex h-full">
          {/* Conversazioni */}
          <div className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-100">
              <p className="font-semibold text-sm">Conversazioni ({conversations.length})</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map(conv => (
                <button key={conv.id} onClick={() => setActiveConv(conv.id)}
                  className={`w-full p-4 text-left border-b border-gray-50 transition-colors hover:bg-gray-50 ${activeConv === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-400' : ''}`}>
                  <p className="font-medium text-sm text-gray-900 truncate">{getPartnerName(conv)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{conv.is_support ? 'Supporto' : 'Chat'}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Messaggi */}
          <div className="flex-1 flex flex-col">
            {!activeConv ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Seleziona una conversazione</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  {(() => { const conv = conversations.find(c => c.id === activeConv); return <p className="font-semibold text-sm">{conv ? getPartnerName(conv) : 'Chat'}</p> })()}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg: any) => {
                    const isOwn = msg.sender_id === userId
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${isOwn ? 'bg-gray-900 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs mt-1 opacity-60">{new Date(msg.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-gray-100">
                  <div className="flex gap-3">
                    <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                      placeholder="Scrivi un messaggio..."
                      className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 transition-all"
                    />
                    <button onClick={sendMessage} disabled={!newMessage.trim()}
                      className="w-10 h-10 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-black transition-colors disabled:opacity-40">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
