'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, MessageSquare, Headphones, ArrowLeft, ImagePlus, Download, X, Loader2 } from 'lucide-react'
import type { Conversation, Message, Profile } from '@/types/database'

interface Props {
  userId: string
  userRole: 'studente' | 'tutor' | 'admin'
  initialConvId?: string
  compact?: boolean
}

export default function ChatInterface({ userId, userRole, initialConvId, compact = false }: Props) {
  const supabase = createClient()
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConv, setActiveConv] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Scorre solo il contenitore dei messaggi (non l'intera pagina)
  useEffect(() => {
    const c = messagesContainerRef.current
    if (c) c.scrollTop = c.scrollHeight
  }, [messages])

  async function loadConversations() {
    let query = supabase.from('conversations').select(`*, student:profiles!conversations_student_id_fkey(*), tutor:profiles!conversations_tutor_id_fkey(*)`)
    if (userRole === 'studente') query = query.eq('student_id', userId)
    else if (userRole === 'tutor') query = query.eq('tutor_id', userId)
    const { data } = await query.order('created_at', { ascending: false })
    setConversations(data || [])
    if (data && data.length > 0 && !activeConv) {
      setActiveConv(initialConvId && data.some(c => c.id === initialConvId) ? initialConvId : data[0].id)
    }
  }

  async function loadMessages(convId: string) {
    const { data } = await supabase.from('messages').select(`*, sender:profiles(*)`)
      .eq('conversation_id', convId).order('created_at', { ascending: true })
    setMessages(data || [])
    await supabase.from('messages').update({ read: true }).eq('conversation_id', convId).neq('sender_id', userId)
    // Notifica il DashboardLayout di aggiornare il badge non letti
    window.dispatchEvent(new CustomEvent('unread-refresh'))
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Puoi caricare solo immagini.'); return }
    if (file.size > 8 * 1024 * 1024) { alert('Immagine troppo grande. Massimo 8MB.'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function sendMessage() {
    if (!activeConv) return
    const hasText = newMessage.trim().length > 0
    const hasImage = !!imageFile
    if (!hasText && !hasImage) return

    setSending(true)
    let image_url: string | null = null

    if (hasImage && imageFile) {
      setUploadingImage(true)
      const ext = imageFile.name.split('.').pop()
      const path = `${activeConv}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-images').upload(path, imageFile, { upsert: false })
      setUploadingImage(false)
      if (uploadError) {
        alert(`Errore caricamento immagine: ${uploadError.message}`)
        setSending(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('chat-images').getPublicUrl(uploadData.path)
      image_url = publicUrl
    }

    const { data: inserted } = await supabase.from('messages').insert({
      conversation_id: activeConv,
      sender_id: userId,
      content: hasText ? newMessage.trim() : null,
      image_url,
    }).select('id').single()

    // Notifica email "smart" al destinatario (non blocca l'invio)
    if (inserted?.id) {
      fetch('/api/chat/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: inserted.id }),
      }).catch(() => {})
    }

    setNewMessage('')
    removeImage()
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
    <div className={`bg-[#11151b] rounded-3xl border border-white/10 shadow-soft overflow-hidden ${compact ? 'h-[440px] md:h-[480px]' : ''}`}
      style={compact ? undefined : { height: 'calc(100vh - 200px)', minHeight: '500px' }}>
      <div className="flex h-full">

        {/* Sidebar conversazioni */}
        <div className={`border-r border-white/10 flex-col flex-shrink-0 w-full md:w-72
          ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-white/10 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-pink-400" />
            <h3 className="font-semibold text-gray-100 text-sm">Messaggi</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                Nessuna conversazione
              </div>
            ) : conversations.map(conv => {
              const partner = getConvPartner(conv)
              const isActive = activeConv === conv.id
              const isSupport = conv.is_support
              return (
                <button key={conv.id}
                  onClick={() => { setActiveConv(conv.id); setMobileView('chat') }}
                  className={`w-full p-4 text-left border-b border-white/5 transition-colors hover:bg-white/5 ${isActive ? (isSupport ? 'bg-blue-500/15 border-l-4 border-l-blue-400' : 'bg-pink-500/15 border-l-4 border-l-pink-400') : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${isSupport ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'}`}>
                      {isSupport ? <Headphones className="w-4 h-4" /> : <>{partner?.first_name?.[0]}{partner?.last_name?.[0]}</>}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-100 truncate">{getConvLabel(conv)}</p>
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
            <div className="p-3 border-t border-white/10">
              <button onClick={openSupportChat}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-500/15 text-blue-300 text-sm font-semibold hover:bg-blue-500/25 transition-colors">
                <Headphones className="w-4 h-4" />
                Contatta Assistenza
              </button>
            </div>
          )}
        </div>

        {/* Area messaggi */}
        <div className={`flex-1 flex-col min-w-0 ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-600" />
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
                  <div className="p-3 md:p-4 border-b border-white/10 bg-white/5 flex items-center gap-2 md:gap-3">
                    <button onClick={() => setMobileView('list')}
                      className="md:hidden p-1.5 rounded-xl hover:bg-white/10 transition-colors flex-shrink-0">
                      <ArrowLeft className="w-4 h-4 text-gray-300" />
                    </button>
                    {isSupport && <Headphones className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-100 truncate">
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
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg: any) => {
                  const isOwn = msg.sender_id === userId
                  const isExpired = msg.image_url === null && !msg.content

                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl ${isOwn ? 'bg-emerald-500 text-white rounded-br-sm' : 'bg-white/10 text-gray-100 rounded-bl-sm'}`}>

                        {/* Immagine */}
                        {msg.image_url && (
                          <div className="relative group">
                            <img
                              src={msg.image_url}
                              alt="Immagine condivisa"
                              className="rounded-2xl max-w-full max-h-64 object-cover cursor-pointer"
                              onClick={() => window.open(msg.image_url, '_blank')}
                            />
                            <a
                              href={msg.image_url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="absolute top-2 right-2 bg-black/60 text-white rounded-xl p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Scarica immagine"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}

                        {/* Immagine scaduta */}
                        {isExpired && (
                          <div className={`px-4 py-3 text-xs italic ${isOwn ? 'text-gray-400' : 'text-gray-400'}`}>
                            🖼️ Immagine non più disponibile (scaduta dopo 7 giorni)
                          </div>
                        )}

                        {/* Testo */}
                        {msg.content && (
                          <div className="px-4 py-3">
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className={`px-4 pb-2 ${msg.image_url && !msg.content ? 'pt-1' : 'pt-0'}`}>
                          <p className={`text-xs ${isOwn ? 'text-white/60' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Preview immagine selezionata */}
              {imagePreview && (
                <div className="px-3 md:px-4 pt-2">
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Anteprima" className="h-20 rounded-xl object-cover border border-white/15" />
                    <button onClick={removeImage}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 md:p-4 border-t border-white/10">
                <div className="flex gap-2 md:gap-3 items-end">
                  {/* Bottone immagine */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sending}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-white/15 text-gray-400 hover:text-white hover:border-white/30 transition-colors flex-shrink-0 disabled:opacity-40"
                    title="Allega immagine"
                  >
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                    placeholder="Scrivi un messaggio..."
                    className="flex-1 bg-white/5 border border-white/15 rounded-full px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-400 transition-all"
                  />
                  <button onClick={sendMessage} disabled={(!newMessage.trim() && !imageFile) || sending}
                    className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-400 transition-colors disabled:opacity-40 flex-shrink-0">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1.5 ml-1">Le immagini vengono eliminate automaticamente dopo 7 giorni</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
