export type UserRole = 'studente' | 'tutor' | 'admin'
export type SchoolGrade = 'medie' | 'superiori' | 'universita'
export type LessonMode = 'online' | 'presenza' | 'entrambe'
export type SlotStatus = 'disponibile' | 'prenotato' | 'completato' | 'bloccato'
export type BookingStatus = 'confermato' | 'completato' | 'cancellato'
export type SubscriptionType = 'mensile' | 'annuale'
export type SubscriptionStatus = 'attivo' | 'scaduto' | 'cancellato'
export type PaymentStatus = 'in_elaborazione' | 'pagato'

export interface Profile {
  id: string
  role: UserRole
  first_name: string
  last_name: string
  email: string
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface TutorProfile {
  id: string
  bio?: string
  fiscal_code: string
  iban: string
  iban_confirmed: boolean
  lesson_mode: LessonMode
  address?: string
  city?: string
  latitude?: number
  longitude?: number
  is_active: boolean
  terms_accepted: boolean
  created_at: string
  updated_at: string
  profile?: Profile
  subjects?: Subject[]
  grades?: SchoolGrade[]
  avg_rating?: number
  review_count?: number
}

export interface StudentProfile {
  id: string
  hour_credits_medie: number
  hour_credits_superiori: number
  hour_credits_universita: number
  terms_accepted: boolean
  created_at: string
  updated_at: string
}

export interface Subject {
  id: string
  name: string
  active: boolean
  created_at: string
}

export interface Subscription {
  id: string
  student_id: string
  type: SubscriptionType
  status: SubscriptionStatus
  price: number
  starts_at: string
  expires_at: string
  created_at: string
}

export interface HourPurchase {
  id: string
  student_id: string
  grade: SchoolGrade
  hours: number
  price_per_hour: number
  total_price: number
  created_at: string
}

export interface CalendarSlot {
  id: string
  tutor_id: string
  date: string
  start_time: string
  end_time: string
  status: SlotStatus
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  student_id: string
  tutor_id: string
  slot_id: string
  subject_id: string
  grade: SchoolGrade
  mode: LessonMode
  topic: string
  address?: string
  status: BookingStatus
  meet_link?: string
  hours_used: number
  created_at: string
  updated_at: string
  slot?: CalendarSlot
  subject?: Subject
  tutor_profile?: TutorProfile & { profile?: Profile }
  student_profile?: Profile
}

export interface Review {
  id: string
  booking_id: string
  student_id: string
  tutor_id: string
  rating: number
  comment?: string
  created_at: string
  student?: Profile
}

export interface Favorite {
  student_id: string
  tutor_id: string
  created_at: string
  tutor?: TutorProfile & { profile?: Profile }
}

export interface TutorPayment {
  id: string
  tutor_id: string
  month: number
  year: number
  completed_lessons: number
  total_hours: number
  amount: number
  status: PaymentStatus
  created_at: string
  updated_at: string
  tutor?: { profile?: Profile }
}

export interface Conversation {
  id: string
  student_id: string
  tutor_id: string
  is_support: boolean
  created_at: string
  student?: Profile
  tutor?: Profile
  last_message?: Message
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
  sender?: Profile
}

export interface PricingConfig {
  id: string
  subscription_monthly: number
  subscription_annual: number
  hour_rate_medie: number
  hour_rate_superiori: number
  hour_rate_universita: number
  updated_at: string
}
