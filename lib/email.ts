import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM_EMAIL = 'Proflive <noreply@proflive.app>'

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Proflive</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;">

        <!-- Header -->
        <tr><td style="background:#000;border-radius:16px 16px 0 0;padding:24px 32px;text-align:center;">
          <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="background:#000;width:32px;height:32px;border-radius:8px;text-align:center;vertical-align:middle;padding-right:10px;">
                <span style="color:#fff;font-size:18px;">📍</span>
              </td>
              <td style="color:#fff;font-size:20px;font-weight:700;vertical-align:middle;letter-spacing:-0.5px;">Proflive</td>
            </tr>
          </table>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#fff;border-radius:0 0 16px 16px;padding:32px;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 0;text-align:center;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">
            © 2025 Proflive ·
            <a href="https://proflive.app" style="color:#9ca3af;">proflive.app</a>
          </p>
          <p style="color:#9ca3af;font-size:11px;margin:4px 0 0;">
            Hai ricevuto questa email perché sei registrato su Proflive.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
      <span style="color:#6b7280;font-size:13px;">${label}</span><br/>
      <span style="color:#111827;font-size:14px;font-weight:600;">${value}</span>
    </td>
  </tr>`
}

// ─── CONFERMA PRENOTAZIONE ───────────────────────────────────────────────────

export function bookingConfirmStudentHtml(data: {
  studentName: string
  tutorName: string
  subject: string
  grade: string
  topic: string
  date: string
  time: string
  mode: string
  meetLink?: string | null
  address?: string | null
  hoursUsed: number
}): string {
  const modeLabel = data.mode === 'online' ? '💻 Online (videochiamata)' : '📍 In presenza'
  const content = `
    <div style="margin-bottom:24px;">
      <div style="display:inline-block;background:#dcfce7;color:#16a34a;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:16px;">✅ Prenotazione confermata</div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">Ciao ${data.studentName}!</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;line-height:1.5;">La tua lezione con <strong>${data.tutorName}</strong> è confermata.</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      ${detailRow('Materia', data.subject)}
      ${detailRow('Argomento', data.topic)}
      ${detailRow('Grado', data.grade)}
      ${detailRow('Data e ora', `${data.date} · ${data.time}`)}
      ${detailRow('Modalità', modeLabel)}
      ${data.hoursUsed > 0 ? detailRow('Ore scalate', `${data.hoursUsed}h dal tuo credito`) : ''}
    </table>

    ${data.meetLink ? `
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 10px;font-size:13px;color:#1d4ed8;font-weight:600;">🎥 Link videochiamata</p>
      <a href="${data.meetLink}" style="display:block;background:#1d4ed8;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 20px;border-radius:10px;text-align:center;">
        Entra nella videochiamata →
      </a>
      <p style="margin:10px 0 0;font-size:12px;color:#3b82f6;">Al primo accesso Jitsi potrebbe chiederti di accedere con Google.</p>
    </div>` : ''}

    ${data.address ? `
    <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:13px;color:#92400e;font-weight:600;">📍 Indirizzo incontro</p>
      <p style="margin:0;font-size:14px;color:#78350f;">${data.address}</p>
    </div>` : ''}

    <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6;">
      Per qualsiasi problema contatta il supporto dalla sezione Chat della tua area personale su
      <a href="https://proflive.app" style="color:#111827;">proflive.app</a>.
    </p>`
  return baseTemplate(content)
}

export function bookingConfirmTutorHtml(data: {
  tutorName: string
  studentName: string
  subject: string
  grade: string
  topic: string
  date: string
  time: string
  mode: string
  meetLink?: string | null
  address?: string | null
}): string {
  const modeLabel = data.mode === 'online' ? '💻 Online (videochiamata)' : '📍 In presenza'
  const content = `
    <div style="margin-bottom:24px;">
      <div style="display:inline-block;background:#dbeafe;color:#1d4ed8;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:16px;">📅 Nuova prenotazione</div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">Ciao ${data.tutorName}!</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;line-height:1.5;"><strong>${data.studentName}</strong> ha prenotato una lezione con te.</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      ${detailRow('Studente', data.studentName)}
      ${detailRow('Materia', data.subject)}
      ${detailRow('Argomento', data.topic)}
      ${detailRow('Grado', data.grade)}
      ${detailRow('Data e ora', `${data.date} · ${data.time}`)}
      ${detailRow('Modalità', modeLabel)}
    </table>

    ${data.meetLink ? `
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 10px;font-size:13px;color:#1d4ed8;font-weight:600;">🎥 Link videochiamata</p>
      <a href="${data.meetLink}" style="display:block;background:#1d4ed8;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 20px;border-radius:10px;text-align:center;">
        Entra nella videochiamata →
      </a>
    </div>` : ''}

    ${data.address ? `
    <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:13px;color:#92400e;font-weight:600;">📍 Indirizzo incontro</p>
      <p style="margin:0;font-size:14px;color:#78350f;">${data.address}</p>
    </div>` : ''}

    <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6;">
      Gestisci le tue lezioni dalla tua area personale su
      <a href="https://proflive.app" style="color:#111827;">proflive.app</a>.
    </p>`
  return baseTemplate(content)
}

// ─── CANCELLAZIONE PRENOTAZIONE ─────────────────────────────────────────────

export function bookingCancelStudentHtml(data: {
  studentName: string
  tutorName: string
  subject: string
  date: string
  time: string
  hoursRefunded: number
  grade: string
}): string {
  const content = `
    <div style="margin-bottom:24px;">
      <div style="display:inline-block;background:#fee2e2;color:#dc2626;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:16px;">❌ Prenotazione cancellata</div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">Ciao ${data.studentName},</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;line-height:1.5;">La tua prenotazione è stata cancellata dall'amministratore.</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      ${detailRow('Tutor', data.tutorName)}
      ${detailRow('Materia', data.subject)}
      ${detailRow('Data e ora', `${data.date} · ${data.time}`)}
    </table>

    ${data.hoursRefunded > 0 ? `
    <div style="background:#dcfce7;border:1px solid #86efac;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#16a34a;font-weight:600;">
        ✅ Rimborso: <strong>${data.hoursRefunded}h</strong> sono state restituite al tuo credito ${data.grade}.
      </p>
    </div>` : ''}

    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin-bottom:16px;">
      Puoi prenotare una nuova lezione in qualsiasi momento dalla sezione <strong>Cerca tutor</strong>.
    </p>

    <a href="https://proflive.app/studente/cerca" style="display:inline-block;background:#000;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 24px;border-radius:10px;">
      Cerca un tutor →
    </a>`
  return baseTemplate(content)
}

export function bookingCancelTutorHtml(data: {
  tutorName: string
  studentName: string
  subject: string
  date: string
  time: string
}): string {
  const content = `
    <div style="margin-bottom:24px;">
      <div style="display:inline-block;background:#fee2e2;color:#dc2626;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:16px;">❌ Prenotazione cancellata</div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">Ciao ${data.tutorName},</h1>
      <p style="margin:0;color:#6b7280;font-size:15px;line-height:1.5;">Una prenotazione è stata cancellata dall'amministratore.</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      ${detailRow('Studente', data.studentName)}
      ${detailRow('Materia', data.subject)}
      ${detailRow('Data e ora', `${data.date} · ${data.time}`)}
    </table>

    <p style="color:#6b7280;font-size:14px;line-height:1.6;">
      Lo slot è stato rimesso disponibile nel tuo calendario. Per maggiori informazioni contatta il supporto dalla tua area personale.
    </p>`
  return baseTemplate(content)
}
