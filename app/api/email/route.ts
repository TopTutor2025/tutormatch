import { NextRequest, NextResponse } from 'next/server'
import { sendConfirmEmail, sendCancelEmail } from '@/lib/send-booking-email'

export async function POST(request: NextRequest) {
  try {
    const { type, bookingId, refunded } = await request.json()

    if (!type || !bookingId) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 })
    }

    if (type === 'confirm') {
      await sendConfirmEmail(bookingId)
      return NextResponse.json({ success: true })
    }

    if (type === 'cancel') {
      await sendCancelEmail(bookingId, !!refunded)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Tipo non valido' }, { status: 400 })
  } catch (err: any) {
    console.error('Email error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
