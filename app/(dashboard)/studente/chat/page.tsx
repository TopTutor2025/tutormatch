'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// La chat è stata spostata nella dashboard: reindirizziamo eventuali
// link/bookmark verso /studente (mantenendo il parametro conv).
export default function StudentChatRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const conv = searchParams.get('conv')
    router.replace(conv ? `/studente?conv=${conv}` : '/studente')
  }, [])

  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
