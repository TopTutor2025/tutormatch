import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import {
  resend, FROM_EMAIL,
  bookingConfirmStudentHtml, bookingConfirmTutorHtml,
  bookingCancelStudentHtml, bookingCancelTutorHtml,
} from '@/lib/email'
import { formatDate, formatTime, GRADE_LABELS } from '@/lib/utils'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function fetchBookingData(bookingId: string) {
  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single()

  if (!booking) return null

  const [
    { data: student },
    { data: tutor },
    { data: slot },
    { data: secondSlot },
    { data: subject },
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('*').eq('id', booking.student_id).single(),
    supabaseAdmin.from('profiles').select('*').eq('id', booking.tutor_id).single(),
    supabaseAdmin.from('calendar_slots').select('*').eq('id', booking.slot_id).single(),
    booking.second_slot_id
      ? supabaseAdmin.from('calendar_slots').select('*').eq('id', booking.second_slot_id).single()
      : Promise.resolve({ data: null }),
    supabaseAdmin.from('subjects').select('*').eq('id', booking.subject_id).single(),
  ])

  return { booking, student, tutor, slot, secondSlot, subject }
}

export async function POST(request: NextRequest) {
  try {
    const { type, bookingId, refunded } = await request.json()

    if (!type || !bookingId) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 })
    }

    const d = await fetchBookingData(bookingId)
    if (!d) return NextResponse.json({ error: 'Prenotazione non trovata' }, { status: 404 })

    const { booking, student, tutor, slot, secondSlot, subject } = d

    const dateStr = slot ? formatDate(slot.date) : '—'
    const endTime = secondSlot?.end_time ?? slot?.end_time
    const timeStr = slot ? `${formatTime(slot.start_time)} – ${formatTime(endTime)}` : '—'
    const gradeLabel = (GRADE_LABELS as any)[booking.grade] ?? booking.grade
    const studentName = `${student?.first_name} ${student?.last_name}`
    const tutorName = `${tutor?.first_name} ${tutor?.last_name}`
    const subjectName = subject?.name ?? '—'

    if (type === 'confirm') {
      const [studentResult, tutorResult] = await Promise.all([
        resend.emails.send({
          from: FROM_EMAIL,
          to: student?.email,
          subject: `✅ Prenotazione confermata – ${subjectName} con ${tutorName}`,
          html: bookingConfirmStudentHtml({
            studentName,
            tutorName,
            subject: subjectName,
            grade: gradeLabel,
            topic: booking.topic,
            date: dateStr,
            time: timeStr,
            mode: booking.mode,
            meetLink: booking.meet_link,
            address: booking.address,
            hoursUsed: booking.hours_used,
          }),
        }),
        resend.emails.send({
          from: FROM_EMAIL,
          to: tutor?.email,
          subject: `📅 Nuova prenotazione – ${subjectName} con ${studentName}`,
          html: bookingConfirmTutorHtml({
            tutorName,
            studentName,
            subject: subjectName,
            grade: gradeLabel,
            topic: booking.topic,
            date: dateStr,
            time: timeStr,
            mode: booking.mode,
            meetLink: booking.meet_link,
            address: booking.address,
          }),
        }),
      ])

      return NextResponse.json({ success: true, studentResult, tutorResult })
    }

    if (type === 'cancel') {
      const hoursRefunded = refunded ? booking.hours_used : 0

      const [studentResult, tutorResult] = await Promise.all([
        resend.emails.send({
          from: FROM_EMAIL,
          to: student?.email,
          subject: `❌ Prenotazione cancellata – ${subjectName} con ${tutorName}`,
          html: bookingCancelStudentHtml({
            studentName,
            tutorName,
            subject: subjectName,
            date: dateStr,
            time: timeStr,
            hoursRefunded,
            grade: gradeLabel,
          }),
        }),
        resend.emails.send({
          from: FROM_EMAIL,
          to: tutor?.email,
          subject: `❌ Prenotazione cancellata – ${subjectName} con ${studentName}`,
          html: bookingCancelTutorHtml({
            tutorName,
            studentName,
            subject: subjectName,
            date: dateStr,
            time: timeStr,
          }),
        }),
      ])

      return NextResponse.json({ success: true, studentResult, tutorResult })
    }

    return NextResponse.json({ error: 'Tipo non valido' }, { status: 400 })
  } catch (err: any) {
    console.error('Email error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
