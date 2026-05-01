'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, MessageSquare, ArrowLeft } from 'lucide-react'

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
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
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
      setMobileView('chat')
      loadConversations(userId)
    }
  }

  function selectConversation(convId: string) {
    setActiveConv(convId)
    setMobileView('chat')
  }

  function getPartnerName(conv: any) {
    const s = conv.student
    const t = conv.tutor
    if (s?.id === userId) return `${t?.first_name} ${t?.last_name} (Tutor)`
    return `${s?.first_name} ${s?.last_name} (${s?.role === 'tutor' ? 'Tutor' : 'Studente'})`
  }

  function getPartnerInitials(conv: any) {
    const s = conv.student
    const t = conv.tutor
    const partner = s?.id === userId ? t : s
    return `${partner?.first_name?.[0] || ''}${partner?.last_name?.[0] || ''}`
  }

  const filteredUsers = allUsers.filter(u => `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase()))
  const activeConvData = conversations.find(c => c.id === activeConv)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-black">Chat di Supporto</h1>
          <p className="text-gray-500 mt-0.5 sm:mt-1 text-sm">Comunica con studenti e tutor</p>
        </div>
        <button onClick={() => setShowNewConv(!showNewConv)}
          className="bg-black text-white text-sm font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl hover:bg-gray-800 transition-colors flex-shrink-0">
          + Nuova chat
        </button>
      </div>

      {showNewConv && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4 sm:p-5">
          <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Avvia conversazione con</h3>
          <input type="text" placeholder="Cerca utente..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 mb-3"
          />
          <div className="max-h-48 overflow-y-auto space-y-1">
            {filteredUsers.map(user => (
              <button key={user.id} onClick={() => startConversation(user)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left">
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user.first_name} {user.last_name}</p>
                  <p className="text-xs text-gray-400 capitalize truncate">{user.role} · {user.email}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden" style={{ height: 'calc(100vh - 260px)', minHeight: '480px' }}>
        <div className="flex h-full">

          {/* Sidebar conversazioni — hidden su mobile quando si è in chat view */}
          <div className={`flex flex-col border-r border-gray-100 flex-shrink-0
            ${mobileView === 'chat' ? 'hidden sm:flex' : 'flex w-full sm:w-72'}`}>
            <div className="p-3 sm:p-4 border-b border-gray-100">
              <p className="font-semibold text-sm">Conversazioni ({conversations.length})</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
                  <MessageSquare className="w-8 h-8 mb-2 text-gray-300" />
                  <p className="text-xs text-center">Nessuna conversazione</p>
                </div>
              ) : conversations.map(conv => (
                <button key={conv.id} onClick={() => selectConversation(conv.id)}
                  className={`w-full p-3 sm:p-4 text-left border-b border-gray-50 transition-colors hover:bg-gray-50 ${activeConv === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-400' : ''}`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                      {getPartnerInitials(conv)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{getPartnerName(conv)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{conv.is_support ? 'Supporto' : 'Chat'}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Area messaggi — full width su mobile, flex-1 su desktop */}
          <div className={`flex-1 flex flex-col min-w-0
            ${mobileView === 'list' ? 'hidden sm:flex' : 'flex'}`}>
            {!activeConv ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Seleziona una conversazione</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header chat */}
                <div className="p-3 sm:p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                  {/* Back button su mobile */}
                  <button onClick={() => setMobileView('list')}
                    className="sm:hidden p-1.5 rounded-xl hover:bg-gray-200 transition-colors flex-shrink-0">
                    <ArrowLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  {activeConvData && (
                    <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 flex-shrink-0">
                      {getPartnerInitials(activeConvData)}
                    </div>
                  )}
                  <p className="font-semibold text-sm truncate">
                    {activeConvData ? getPartnerName(activeConvData) : 'Chat'}
                  </p>
                </div>

                {/* Messaggi */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                  {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p className="text-sm">Nessun messaggio ancora</p>
                    </div>
                  )}
                  {messages.map((msg: any) => {
                    const isOwn = msg.sender_id === userId
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${isOwn ? 'bg-gray-900 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p className="text-xs mt-1 opacity-60">{new Date(msg.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 sm:p-4 border-t border-gray-100">
                  <div className="flex gap-2 sm:gap-3">
                    <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                      placeholder="Scrivi un messaggio..."
                      className="flex-1 border border-gray-200 rounded-2xl px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-gray-900 transition-all"
                    />
                    <button onClick={sendMessage} disabled={!newMessage.trim()}
                      className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-black transition-colors disabled:opacity-40 flex-shrink-0">
                      <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
