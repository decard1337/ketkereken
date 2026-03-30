import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config/env.js"
import { getToken } from "../utils/authHelpers.js"

export function authRequired(req, res, next) {
  const token = getToken(req)

  if (!token) {
    return res.status(401).json({ error: "Nincs bejelentkezve" })
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch (err) {
    return res.status(401).json({ error: "Érvénytelen token" })
  }
}

export function adminRequired(req, res, next) {
  authRequired(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Csak admin" })
    }

    next()
  })
}
