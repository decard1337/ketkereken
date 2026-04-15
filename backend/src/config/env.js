export const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173"
export const JWT_SECRET = process.env.JWT_SECRET || "valtoztass_meg"
export const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "kk_token"
export const TOKEN_DAYS = Number(process.env.TOKEN_TTL_DAYS || 7)

export const APP_BASE_URL = process.env.APP_BASE_URL || FRONTEND_ORIGIN
export const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com"
export const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
export const SMTP_SECURE = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true"
export const SMTP_USER = process.env.SMTP_USER || "noreply.ketkereken@gmail.com"
export const SMTP_PASS = process.env.SMTP_PASS || "dtfi pyft bkbn xpeu"
export const SMTP_FROM = process.env.SMTP_FROM || "Két Keréken <noreply.ketkereken@gmail.com>"
export const RESET_TOKEN_MINUTES = Number(process.env.RESET_TOKEN_MINUTES || 30)
