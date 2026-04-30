'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ChatInterface from '@/components/chat/ChatInterface'

export default function TutorChatPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => { if (user) setUserId(user.id) })
  }, [])

  if (!userId) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Chat</h1>
        <p className="text-gray-500 mt-1">Messaggi con i tuoi studenti</p>
      </div>
      <ChatInterface userId={userId} userRole="tutor" />
    </div>
  )
}
