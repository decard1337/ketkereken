import jwt from "jsonwebtoken"
import { COOKIE_NAME, JWT_SECRET, TOKEN_DAYS } from "../config/env.js"

export function makeToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      profilkep: user.profilkep || null,
      bio: user.bio || null,
      letrehozva: user.letrehozva || null
    },
    JWT_SECRET,
    { expiresIn: `${TOKEN_DAYS}d` }
  )
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: TOKEN_DAYS * 24 * 60 * 60 * 1000,
    path: "/"
  })
}

export function clearAuthCookie(res) {
  res.cookie(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 0,
    path: "/"
  })
}

export function getToken(req) {
  if (req.cookies?.[COOKIE_NAME]) return req.cookies[COOKIE_NAME]

  const auth = req.headers.authorization
  if (auth && auth.startsWith("Bearer ")) {
    return auth.slice(7)
  }

  return null
}
