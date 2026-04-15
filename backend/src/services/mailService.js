import nodemailer from "nodemailer"
import { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM } from "../config/env.js"

function hasSmtpConfig() {
  return Boolean(SMTP_HOST && SMTP_PORT && SMTP_FROM)
}

function createTransporter() {
  if (!hasSmtpConfig()) return null

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
  })
}

export async function sendPasswordResetMail({ to, resetUrl }) {
  const transporter = createTransporter()

  if (!transporter) {
    console.log("[password-reset] SMTP nincs beállítva, link:", resetUrl)
    return { sent: false, fallback: true }
  }

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: "Két Keréken - Jelszó visszaállítás",
    text: `Jelszó-visszaállítást kértél a Két Keréken fiókodhoz.\n\nNyisd meg ezt a linket az új jelszó beállításához: ${resetUrl}\n\nA link 30 percig érvényes. Ha nem te kérted, hagyd figyelmen kívül ezt az emailt.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2>Két Keréken - Jelszó visszaállítás</h2>
        <p>Jelszó-visszaállítást kértél a Két Keréken fiókodhoz.</p>
        <p>Az új jelszó beállításához kattints erre a linkre:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>A link 30 percig érvényes. Ha nem te kérted, hagyd figyelmen kívül ezt az emailt.</p>
      </div>
    `
  })

  return { sent: true, fallback: false }
}
