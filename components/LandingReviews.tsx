'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star } from 'lucide-react'

type Review = {
  id: string
  author_name: string
  author_role: string
  rating: number
  comment: string
}

export default function LandingReviews() {
  const supabase = createClient()
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    supabase
      .from('landing_reviews')
      .select('id, author_name, author_role, rating, comment')
      .eq('visible', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => setReviews(data || []))
  }, [])

  if (reviews.length === 0) return null

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            Recensioni verificate
          </div>
          <h2 className="text-4xl font-extrabold text-black mb-4">Cosa dicono di noi</h2>
          <p className="text-lg text-gray-500">Studenti e famiglie che hanno trovato il tutor giusto con TutorMatch</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map(review => (
            <div key={review.id}
              className="bg-gray-50 rounded-3xl p-7 flex flex-col gap-4 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              {/* Stelle */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i}
                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                ))}
              </div>
              {/* Testo */}
              <p className="text-gray-700 text-sm leading-relaxed flex-1">
                "{review.comment}"
              </p>
              {/* Autore */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {review.author_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{review.author_name}</p>
                  <p className="text-xs text-gray-400">{review.author_role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
