import bcrypt from "bcryptjs"
import { pool } from "../config/db.js"
import { makeToken, setAuthCookie, clearAuthCookie } from "../utils/authHelpers.js"
import { userToResponse } from "../utils/userHelpers.js"

export async function register(req, res) {
  try {
    const { email, username, password } = req.body || {}

    if (!email || !username || !password) {
      return res.status(400).json({ error: "Hiányzó mezők" })
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: "Túl rövid jelszó" })
    }

    const [emailRows] = await pool.query(
      "SELECT id FROM felhasznalok WHERE email=? LIMIT 1",
      [email]
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
      [email, username, passwordHash]
    )

    const tokenUser = {
      id: result.insertId,
      email,
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
        email,
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

    if (!email || !password) {
      return res.status(400).json({ error: "Hiányzó mezők" })
    }

    const [rows] = await pool.query(
      "SELECT id, email, felhasznalonev, jelszo_hash, rang, profilkep, bio, letrehozva FROM felhasznalok WHERE email=? LIMIT 1",
      [email]
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
