'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, Star, MessageSquare, Calendar, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PrefertiPage() {
  const supabase = createClient()
  const router = useRouter()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data: favs } = await supabase
        .from('favorites')
        .select('*')
        .eq('student_id', user.id)
      if (!favs?.length) { setFavorites([]); setLoading(false); return }
      const tutorIds = favs.map(f => f.tutor_id)
      const [{ data: tps }, { data: profiles }] = await Promise.all([
        supabase.from('tutor_profiles').select('*').in('id', tutorIds),
        supabase.from('profiles').select('*').in('id', tutorIds),
      ])
      const tpMap = Object.fromEntries((tps || []).map(tp => [tp.id, tp]))
      const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))
      setFavorites(favs.map(f => ({
        ...f,
        tutor: tpMap[f.tutor_id] ? { ...tpMap[f.tutor_id], profile: profileMap[f.tutor_id] || null } : null,
      })))
      setLoading(false)
    }
    load()
  }, [])

  async function removeFavorite(tutorId: string) {
    await supabase.from('favorites').delete().eq('student_id', userId).eq('tutor_id', tutorId)
    setFavorites(prev => prev.filter(f => f.tutor_id !== tutorId))
  }

  async function startChat(tutorId: string) {
    const { data: existing } = await supabase.from('conversations').select('id').eq('student_id', userId).eq('tutor_id', tutorId).single()
    if (!existing) {
      await supabase.from('conversations').insert({ student_id: userId, tutor_id: tutorId })
    }
    router.push('/studente/chat')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Preferiti</h1>
        <p className="text-gray-500 mt-1">I tutor che hai salvato come preferiti</p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-600">Nessun tutor nei preferiti</p>
          <p className="text-sm text-gray-400 mt-1">Cerca un tutor e clicca ❤️ per aggiungerlo ai preferiti</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {favorites.map((fav: any) => {
            const tutor = fav.tutor
            const profile = tutor?.profile
            return (
              <div key={fav.tutor_id} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.first_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-200 to-pink-300 flex items-center justify-center text-white font-bold">
                        {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className="font-bold text-gray-900">{profile?.first_name}</p>
                      <button onClick={() => removeFavorite(fav.tutor_id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{tutor?.bio || 'Nessuna bio'}</p>
                    <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${tutor?.lesson_mode === 'online' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                      {tutor?.lesson_mode === 'online' ? '📺 Online' : tutor?.lesson_mode === 'presenza' ? '📍 Presenza' : '🔀 Online + Presenza'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button onClick={() => startChat(fav.tutor_id)}
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-medium border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <MessageSquare className="w-4 h-4" /> Chat
                  </button>
                  <button onClick={() => router.push('/studente/cerca')}
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold bg-black text-white py-2.5 rounded-xl hover:bg-gray-800 transition-colors">
                    <Calendar className="w-4 h-4" /> Prenota
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
