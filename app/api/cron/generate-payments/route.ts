import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  // Verifica il secret per proteggere la route
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Scade gli abbonamenti con expires_at passato (safety net)
    await supabaseAdmin.rpc('expire_subscriptions')

    // Pulizia immagini chat più vecchie di 7 giorni
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: oldImages } = await supabaseAdmin
      .from('messages')
      .select('id, image_url')
      .not('image_url', 'is', null)
      .lt('created_at', sevenDaysAgo)

    if (oldImages && oldImages.length > 0) {
      // Estrai i path dallo storage URL ed elimina i file
      const paths = oldImages
        .map(m => {
          try {
            const url = new URL(m.image_url)
            // Il path nello storage è dopo /object/public/chat-images/
            const parts = url.pathname.split('/chat-images/')
            return parts[1] || null
          } catch { return null }
        })
        .filter(Boolean) as string[]

      if (paths.length > 0) {
        await supabaseAdmin.storage.from('chat-images').remove(paths)
      }

      // Svuota image_url nei messaggi (content rimane se presente)
      const ids = oldImages.map(m => m.id)
      await supabaseAdmin.from('messages').update({ image_url: null }).in('id', ids)
      console.log(`[cron] Eliminate ${paths.length} immagini chat scadute`)
    }

    const { error } = await supabaseAdmin.rpc('generate_monthly_payments')

    if (error) {
      console.error('Error generating payments:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Pagamenti mensili generati con successo',
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('Cron error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
