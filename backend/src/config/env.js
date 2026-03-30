export const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173"
export const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me"
export const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "kk_token"
export const TOKEN_DAYS = Number(process.env.TOKEN_TTL_DAYS || 7)
