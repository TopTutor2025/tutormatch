'use client'
import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, BadgeCheck, ShieldCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'

type Review = {
  id: string
  author_name: string
  author_role: string
  rating: number
  comment: string
  created_at: string
}

const GAP = 24

export default function LandingReviews() {
  const supabase = createClient()
  const [reviews, setReviews] = useState<Review[]>([])
  const [active, setActive] = useState(0)
  const [containerW, setContainerW] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase
      .from('landing_reviews')
      .select('id, author_name, author_role, rating, comment, created_at')
      .eq('visible', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => setReviews(data || []))
  }, [])

  useLayoutEffect(() => {
    function measure() {
      if (containerRef.current) setContainerW(containerRef.current.offsetWidth)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [reviews.length])

  if (reviews.length === 0) return null

  const n = reviews.length
  const perView = containerW >= 768 ? 3 : 1
  const cardW = perView === 1 ? containerW : (containerW - GAP * 2) / 3
  const trackWidth = n * cardW + (n - 1) * GAP

  const rawTranslate = containerW / 2 - (active * (cardW + GAP) + cardW / 2)
  const minT = Math.min(0, containerW - trackWidth)
  const translate = containerW > 0 ? Math.max(minT, Math.min(0, rawTranslate)) : 0
  const highlightIndex = containerW > 0
    ? Math.min(n - 1, Math.max(0, Math.round((containerW / 2 - translate - cardW / 2) / (cardW + GAP))))
    : 0

  const avg = (reviews.reduce((a, r) => a + r.rating, 0) / n)
  const avgLabel = avg.toFixed(1)

  function timeAgo(date: string) {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: it })
    } catch {
      return ''
    }
  }

  return (
    <section className="py-24 px-6 bg-black overflow-hidden relative">
      <div className="max-w-7xl mx-auto">
        {/* Titolo */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Cosa Dicono i{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Nostri Studenti</span>
          </h2>
          <div className="inline-flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-6 h-6 text-emerald-400 fill-emerald-400" />
              ))}
            </div>
            <span className="text-white font-bold text-lg">{avgLabel}/5</span>
          </div>
        </div>

        {/* Carosello */}
        <div ref={containerRef} className="relative">
          <div
            className="flex items-start"
            style={{
              gap: `${GAP}px`,
              transform: `translateX(${translate}px)`,
              transition: 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1)',
              width: containerW > 0 ? `${trackWidth}px` : '100%',
            }}
          >
            {reviews.map((review, i) => {
              const isActive = i === highlightIndex
              return (
                <div
                  key={review.id}
                  style={{ width: containerW > 0 ? `${cardW}px` : undefined }}
                  className={`flex-shrink-0 rounded-3xl p-7 flex flex-col gap-4 border transition-all duration-500 ${
                    isActive
                      ? 'bg-white/[0.07] border-white/15 shadow-2xl shadow-emerald-500/5'
                      : 'bg-white/[0.025] border-white/5 opacity-60'
                  }`}
                >
                  {/* Header autore */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {review.author_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-white text-sm truncate">{review.author_name}</p>
                        <BadgeCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      </div>
                      <p className="text-xs text-gray-400">{timeAgo(review.created_at) || review.author_role}</p>
                    </div>
                  </div>

                  {/* Stelle */}
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className={`w-4 h-4 ${s < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 fill-gray-600'}`} />
                    ))}
                  </div>

                  {/* Testo */}
                  <p className="text-gray-300 text-sm leading-relaxed">
                    "{review.comment}"
                  </p>

                  {/* Verificato */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-xs font-medium">Recensione verificata</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pallini */}
        {n > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Vai alla recensione ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === highlightIndex ? 'w-7 bg-emerald-400' : 'w-2 bg-gray-600 hover:bg-gray-500'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
