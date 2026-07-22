import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { resend, FROM_EMAIL, newMessageHtml } from '@/lib/email'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://proflive.app'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export async function POST(request: NextRequest) {
  try {
    const { messageId } = await request.json()
    if (!messageId) return NextResponse.json({ error: 'messageId mancante' }, { status: 400 })

    // Messaggio appena inviato
    const { data: msg } = await supabaseAdmin
      .from('messages')
      .select('id, conversation_id, sender_id, content, image_url')
      .eq('id', messageId).single()
    if (!msg) return NextResponse.json({ ok: false })

    // Conversazione
    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('id, student_id, tutor_id')
      .eq('id', msg.conversation_id).single()
    if (!conv) return NextResponse.json({ ok: false })

    // Il destinatario è l'altra persona della conversazione
    const recipientId = msg.sender_id === conv.student_id ? conv.tutor_id : conv.student_id
    if (!recipientId || recipientId === msg.sender_id) return NextResponse.json({ ok: false })

    // Notifica "smart": invia solo se questo è l'UNICO messaggio non letto del mittente
    // (se ce ne sono già altri non letti, il destinatario è già stato avvisato)
    const { count } = await supabaseAdmin
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conv.id)
      .eq('sender_id', msg.sender_id)
      .eq('read', false)
    if ((count || 0) > 1) return NextResponse.json({ ok: true, skipped: 'already-notified' })

    // Profili destinatario + mittente
    const [{ data: recipient }, { data: sender }] = await Promise.all([
      supabaseAdmin.from('profiles').select('email, first_name, role').eq('id', recipientId).single(),
      supabaseAdmin.from('profiles').select('first_name, last_name').eq('id', msg.sender_id).single(),
    ])
    if (!recipient?.email) return NextResponse.json({ ok: false })

    const senderName = sender ? `${sender.first_name} ${sender.last_name?.[0] || ''}.` : 'Un utente'
    const preview = msg.content
      ? escapeHtml(msg.content.length > 140 ? msg.content.slice(0, 140) + '…' : msg.content)
      : '📷 Ti ha inviato un\'immagine'

    let chatUrl = `${APP_URL}/studente?conv=${conv.id}`
    if (recipient.role === 'tutor') chatUrl = `${APP_URL}/tutor/chat?conv=${conv.id}`
    else if (recipient.role === 'admin') chatUrl = `${APP_URL}/admin/chat`

    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipient.email,
      subject: `Nuovo messaggio da ${senderName}`,
      html: newMessageHtml({ recipientName: recipient.first_name, senderName, preview, chatUrl }),
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[chat-notify]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
