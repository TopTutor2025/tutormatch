'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, MessageSquare, Headphones, ArrowLeft } from 'lucide-react'
import type { Conversation, Message, Profile } from '@/types/database'

interface Props {
  userId: string
  userRole: 'studente' | 'tutor' | 'admin'
}

export default function ChatInterface({ userId, userRole }: Props) {
  const supabase = createClient()
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConv, setActiveConv] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadConversations() }, [])

  useEffect(() => {
    if (!activeConv) return
    loadMessages(activeConv)
    const channel = supabase
      .channel(`messages:${activeConv}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConv}` },
        payload => { setMessages(prev => [...prev, payload.new]) }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [activeConv])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function loadConversations() {
    let query = supabase.from('conversations').select(`*, student:profiles!conversations_student_id_fkey(*), tutor:profiles!conversations_tutor_id_fkey(*)`)
    if (userRole === 'studente') query = query.eq('student_id', userId)
    else if (userRole === 'tutor') query = query.eq('tutor_id', userId)
    const { data } = await query.order('created_at', { ascending: false })
    setConversations(data || [])
    if (data && data.length > 0 && !activeConv) setActiveConv(data[0].id)
  }

  async function loadMessages(convId: string) {
    const { data } = await supabase.from('messages').select(`*, sender:profiles(*)`)
      .eq('conversation_id', convId).order('created_at', { ascending: true })
    setMessages(data || [])
    await supabase.from('messages').update({ read: true }).eq('conversation_id', convId).neq('sender_id', userId)
  }

  async function sendMessage() {
    if (!newMessage.trim() || !activeConv) return
    setSending(true)
    await supabase.from('messages').insert({ conversation_id: activeConv, sender_id: userId, content: newMessage.trim() })
    setNewMessage('')
    setSending(false)
  }

  async function openSupportChat() {
    const { data: admin } = await supabase.from('profiles').select('id').eq('role', 'admin').single()
    if (!admin) return

    if (userRole === 'studente') {
      const { data: existing } = await supabase.from('conversations')
        .select('id').eq('student_id', userId).eq('tutor_id', admin.id).maybeSingle()
      if (existing) { setActiveConv(existing.id); setMobileView('chat'); return }
      const { data: newConv } = await supabase.from('conversations')
        .insert({ student_id: userId, tutor_id: admin.id, is_support: true }).select('id').single()
      if (newConv) { await loadConversations(); setActiveConv(newConv.id); setMobileView('chat') }
    } else if (userRole === 'tutor') {
      const { data: existing } = await supabase.from('conversations')
        .select('id').eq('student_id', admin.id).eq('tutor_id', userId).maybeSingle()
      if (existing) { setActiveConv(existing.id); setMobileView('chat'); return }
      const { data: newConv } = await supabase.from('conversations')
        .insert({ student_id: admin.id, tutor_id: userId, is_support: true }).select('id').single()
      if (newConv) { await loadConversations(); setActiveConv(newConv.id); setMobileView('chat') }
    }
  }

  function getConvPartner(conv: any) {
    if (userRole === 'studente') return conv.tutor
    if (userRole === 'tutor') return conv.student
    return conv.student
  }

  function getConvLabel(conv: any) {
    if (conv.is_support) return '🛟 Assistenza Proflive'
    const partner = getConvPartner(conv)
    if (!partner) return 'Utente'
    return `${partner.first_name} ${partner.last_name?.[0] || ''}.`
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
      <div className="flex h-full">

        {/* Sidebar conversazioni — piena larghezza su mobile quando mobileView=list */}
        <div className={`border-r border-gray-100 flex-col flex-shrink-0 w-full md:w-72
          ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Messaggi</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                Nessuna conversazione
              </div>
            ) : conversations.map(conv => {
              const partner = getConvPartner(conv)
              const isActive = activeConv === conv.id
              const isSupport = conv.is_support
              return (
                <button key={conv.id}
                  onClick={() => { setActiveConv(conv.id); setMobileView('chat') }}
                  className={`w-full p-4 text-left border-b border-gray-50 transition-colors hover:bg-gray-50 ${isActive ? (isSupport ? 'bg-blue-50 border-l-4 border-l-blue-400' : 'bg-pink-50 border-l-4 border-l-pink-400') : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${isSupport ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                      {isSupport ? <Headphones className="w-4 h-4" /> : <>{partner?.first_name?.[0]}{partner?.last_name?.[0]}</>}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{getConvLabel(conv)}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {isSupport ? 'Supporto ufficiale' : userRole === 'studente' ? 'Tutor' : 'Studente'}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          {userRole !== 'admin' && (
            <div className="p-3 border-t border-gray-100">
              <button onClick={openSupportChat}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors">
                <Headphones className="w-4 h-4" />
                Contatta Assistenza
              </button>
            </div>
          )}
        </div>

        {/* Area messaggi — piena larghezza su mobile quando mobileView=chat */}
        <div className={`flex-1 flex-col min-w-0
          ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Seleziona una conversazione</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              {(() => {
                const conv = conversations.find(c => c.id === activeConv)
                const partner = conv ? getConvPartner(conv) : null
                const isSupport = conv?.is_support
                return (
                  <div className="p-3 md:p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2 md:gap-3">
                    {/* Bottone indietro — solo mobile */}
                    <button
                      onClick={() => setMobileView('list')}
                      className="md:hidden p-1.5 rounded-xl hover:bg-gray-200 transition-colors flex-shrink-0">
                      <ArrowLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    {isSupport && <Headphones className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {isSupport ? 'Assistenza Proflive' : partner ? `${partner.first_name} ${partner.last_name?.[0] || ''}.` : 'Chat'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {isSupport ? 'Il team risponderà il prima possibile' : userRole === 'studente' ? 'Tutor' : 'Studente'}
                      </p>
                    </div>
                  </div>
                )
              })()}

              {/* Messaggi */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg: any) => {
                  const isOwn = msg.sender_id === userId
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${isOwn ? 'bg-black text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p className="text-xs mt-1 text-gray-400">
                          {new Date(msg.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 md:p-4 border-t border-gray-100">
                <div className="flex gap-2 md:gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                    placeholder="Scrivi un messaggio..."
                    className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 transition-all"
                  />
                  <button onClick={sendMessage} disabled={!newMessage.trim() || sending}
                    className="w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-40 flex-shrink-0">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
