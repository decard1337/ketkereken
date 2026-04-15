import bcrypt from "bcryptjs"
<<<<<<< HEAD
import crypto from "crypto"
import { pool } from "../config/db.js"
import { APP_BASE_URL, RESET_TOKEN_MINUTES } from "../config/env.js"
import { makeToken, setAuthCookie, clearAuthCookie } from "../utils/authHelpers.js"
import { userToResponse } from "../utils/userHelpers.js"
import { sendPasswordResetMail } from "../services/mailService.js"

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase()
}
=======
import { pool } from "../config/db.js"
import { makeToken, setAuthCookie, clearAuthCookie } from "../utils/authHelpers.js"
import { userToResponse } from "../utils/userHelpers.js"
>>>>>>> d3fda18727ce8b2d98d799fc65d84bbb28bad97f

export async function register(req, res) {
  try {
    const { email, username, password } = req.body || {}
<<<<<<< HEAD
    const normalizedEmail = normalizeEmail(email)

    if (!normalizedEmail || !username || !password) {
=======

    if (!email || !username || !password) {
>>>>>>> d3fda18727ce8b2d98d799fc65d84bbb28bad97f
      return res.status(400).json({ error: "Hiányzó mezők" })
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: "Túl rövid jelszó" })
    }

    const [emailRows] = await pool.query(
<<<<<<< HEAD
      "SELECT id FROM felhasznalok WHERE LOWER(email)=? LIMIT 1",
      [normalizedEmail]
=======
      "SELECT id FROM felhasznalok WHERE email=? LIMIT 1",
      [email]
>>>>>>> d3fda18727ce8b2d98d799fc65d84bbb28bad97f
    )

    if (emailRows.length) {
      return res.status(409).json({ error: "Ez az email már foglalt" })
    }

    const [nameRows] = await pool.query(
      "SELECT id FROM felhasznalok WHERE felhasznalonev=? LIMIT 1",
      [username]
    )

    if (nameRows.length) {
      return res.status(409).json({ error: "Ez a név már foglalt" })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const [result] = await pool.query(
      "INSERT INTO felhasznalok (email, felhasznalonev, jelszo_hash, rang) VALUES (?,?,?, 'felhasznalo')",
<<<<<<< HEAD
      [normalizedEmail, username, passwordHash]
=======
      [email, username, passwordHash]
>>>>>>> d3fda18727ce8b2d98d799fc65d84bbb28bad97f
    )

    const tokenUser = {
      id: result.insertId,
<<<<<<< HEAD
      email: normalizedEmail,
=======
      email,
>>>>>>> d3fda18727ce8b2d98d799fc65d84bbb28bad97f
      username,
      role: "felhasznalo",
      profilkep: null,
      bio: null,
      letrehozva: new Date().toISOString()
    }

    setAuthCookie(res, makeToken(tokenUser))

    res.json({
      user: {
        id: result.insertId,
<<<<<<< HEAD
        email: normalizedEmail,
=======
        email,
>>>>>>> d3fda18727ce8b2d98d799fc65d84bbb28bad97f
        username,
        role: "felhasznalo",
        profilkep: null,
        bio: null,
        letrehozva: tokenUser.letrehozva
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Regisztrációs hiba" })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body || {}
<<<<<<< HEAD
    const normalizedEmail = normalizeEmail(email)

    if (!normalizedEmail || !password) {
=======

    if (!email || !password) {
>>>>>>> d3fda18727ce8b2d98d799fc65d84bbb28bad97f
      return res.status(400).json({ error: "Hiányzó mezők" })
    }

    const [rows] = await pool.query(
<<<<<<< HEAD
      "SELECT id, email, felhasznalonev, jelszo_hash, rang, profilkep, bio, letrehozva FROM felhasznalok WHERE LOWER(email)=? LIMIT 1",
      [normalizedEmail]
=======
      "SELECT id, email, felhasznalonev, jelszo_hash, rang, profilkep, bio, letrehozva FROM felhasznalok WHERE email=? LIMIT 1",
      [email]
>>>>>>> d3fda18727ce8b2d98d799fc65d84bbb28bad97f
    )

    const user = rows[0]
    if (!user) {
      return res.status(401).json({ error: "Hibás belépési adatok" })
    }

    const ok = await bcrypt.compare(password, user.jelszo_hash)
    if (!ok) {
      return res.status(401).json({ error: "Hibás belépési adatok" })
    }

    setAuthCookie(res, makeToken({
      id: user.id,
      email: user.email,
      username: user.felhasznalonev,
      role: user.rang,
      profilkep: user.profilkep,
      bio: user.bio,
      letrehozva: user.letrehozva
    }))

    res.json({ user: userToResponse(user) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Bejelentkezési hiba" })
  }
}

export function logout(req, res) {
  clearAuthCookie(res)
  res.json({ ok: true })
}

export async function me(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, email, felhasznalonev, rang, profilkep, bio, letrehozva FROM felhasznalok WHERE id=? LIMIT 1",
      [req.user.id]
    )

    const user = rows[0]
    if (!user) {
      return res.status(404).json({ error: "Felhasználó nem található" })
    }

    res.json({ user: userToResponse(user) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Felhasználó lekérdezési hiba" })
  }
}
<<<<<<< HEAD

export async function requestPasswordReset(req, res) {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email)

    if (!normalizedEmail) {
      return res.status(400).json({ error: "Add meg az email címet" })
    }

    const [rows] = await pool.query(
      "SELECT id, email FROM felhasznalok WHERE LOWER(email)=? LIMIT 1",
      [normalizedEmail]
    )

    const user = rows[0]

    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex")
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex")
      const expiresAt = new Date(Date.now() + RESET_TOKEN_MINUTES * 60 * 1000)

      await pool.query(
        `UPDATE felhasznalok
         SET reset_token_hash=?, reset_token_lejar=?, reset_token_letrehozva=NOW()
         WHERE id=?`,
        [tokenHash, expiresAt, user.id]
      )

      const resetUrl = `${APP_BASE_URL.replace(/\/$/, "")}/reset-jelszo?token=${encodeURIComponent(rawToken)}`
      await sendPasswordResetMail({ to: user.email, resetUrl })
    }

    res.json({
      ok: true,
      message: "Ha létezik fiók ehhez az email címhez, elküldtük a jelszó-visszaállító linket."
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Jelszó-visszaállítási hiba" })
  }
}

export async function verifyPasswordResetToken(req, res) {
  try {
    const token = String(req.query?.token || "").trim()

    if (!token) {
      return res.status(400).json({ error: "Hiányzó token" })
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

    const [rows] = await pool.query(
      `SELECT id FROM felhasznalok
       WHERE reset_token_hash=?
         AND reset_token_lejar IS NOT NULL
         AND reset_token_lejar > NOW()
       LIMIT 1`,
      [tokenHash]
    )

    if (!rows.length) {
      return res.status(400).json({ valid: false, error: "Érvénytelen vagy lejárt link" })
    }

    res.json({ valid: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Token ellenőrzési hiba" })
  }
}

export async function resetPassword(req, res) {
  try {
    const token = String(req.body?.token || "").trim()
    const password = String(req.body?.password || "")

    if (!token || !password) {
      return res.status(400).json({ error: "Hiányzó mezők" })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "A jelszónak legalább 6 karakteresnek kell lennie" })
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

    const [rows] = await pool.query(
      `SELECT id FROM felhasznalok
       WHERE reset_token_hash=?
         AND reset_token_lejar IS NOT NULL
         AND reset_token_lejar > NOW()
       LIMIT 1`,
      [tokenHash]
    )

    const user = rows[0]
    if (!user) {
      return res.status(400).json({ error: "Érvénytelen vagy lejárt link" })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await pool.query(
      `UPDATE felhasznalok
       SET jelszo_hash=?, reset_token_hash=NULL, reset_token_lejar=NULL, reset_token_letrehozva=NULL
       WHERE id=?`,
      [passwordHash, user.id]
    )

    clearAuthCookie(res)
    res.json({ ok: true, message: "A jelszó sikeresen módosítva lett." })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Jelszó módosítási hiba" })
  }
}
=======
>>>>>>> d3fda18727ce8b2d98d799fc65d84bbb28bad97f
