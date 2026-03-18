import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import multer from "multer"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { pool } from "./db.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const PORT = Number(process.env.PORT || 3001)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173"
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me"
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "kk_token"
const TOKEN_DAYS = Number(process.env.TOKEN_TTL_DAYS || 7)

const UPLOAD_DIR = path.join(__dirname, "uploads")
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const ADMIN_TABLES = {
  menu: ["nev", "link", "statusz", "sorrend"],
  utvonalak: ["cim", "leiras", "koordinatak", "hossz", "nehezseg", "statusz", "idotartam", "szintkulonbseg"],
  destinaciok: ["nev", "leiras", "lat", "lng", "ertekeles", "tipus", "statusz"],
  esemenyek: ["nev", "leiras", "lat", "lng", "datum", "resztvevok", "tipus", "statusz", "utvonal_id"],
  kolcsonzok: ["nev", "cim", "lat", "lng", "ar", "telefon", "nyitvatartas", "statusz"],
  blippek: ["nev", "leiras", "lat", "lng", "tipus", "ikon", "statusz"],
  users: ["email", "username", "role", "created_at"]
}

const PUBLIKUS_TABLEK = ["menu", "utvonalak", "destinaciok", "esemenyek", "kolcsonzok", "blippek"]
const CEL_TIPUSOK = ["utvonalak", "destinaciok", "esemenyek", "kolcsonzok", "blippek"]

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())
app.use("/uploads", express.static(UPLOAD_DIR))

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "") || ".jpg"
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, name)
  }
})

const upload = multer({ storage })

function makeToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: `${TOKEN_DAYS}d` }
  )
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: TOKEN_DAYS * 24 * 60 * 60 * 1000,
    path: "/"
  })
}

function clearAuthCookie(res) {
  res.cookie(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 0,
    path: "/"
  })
}

function getToken(req) {
  if (req.cookies?.[COOKIE_NAME]) return req.cookies[COOKIE_NAME]
  const auth = req.headers.authorization
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7)
  return null
}

function authRequired(req, res, next) {
  const token = getToken(req)
  if (!token) return res.status(401).json({ error: "Nincs bejelentkezve" })

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: "Érvénytelen token" })
  }
}

function adminRequired(req, res, next) {
  authRequired(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Csak admin" })
    }
    next()
  })
}

async function celLetezik(cel_tipus, cel_id) {
  if (!CEL_TIPUSOK.includes(cel_tipus)) return false
  const [rows] = await pool.query(`SELECT id FROM ${cel_tipus} WHERE id=? LIMIT 1`, [cel_id])
  return rows.length > 0
}

function joTabla(tabla) {
  return Object.prototype.hasOwnProperty.call(ADMIN_TABLES, tabla)
}

app.get("/health", (req, res) => {
  res.json({ ok: true })
})

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, username, password } = req.body

    if (!email || !username || !password) {
      return res.status(400).json({ error: "Hiányzó mezők" })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Túl rövid jelszó" })
    }

    const [exists] = await pool.query("SELECT id FROM users WHERE email=? LIMIT 1", [email])
    if (exists.length) {
      return res.status(409).json({ error: "Ez az email már foglalt" })
    }

    const password_hash = await bcrypt.hash(password, 12)

    const [result] = await pool.query(
      "INSERT INTO users (email, username, password_hash, role) VALUES (?,?,?, 'user')",
      [email, username, password_hash]
    )

    const user = {
      id: result.insertId,
      email,
      username,
      role: "user"
    }

    const token = makeToken(user)
    setAuthCookie(res, token)

    res.json({ user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Regisztrációs hiba" })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Hiányzó mezők" })
    }

    const [rows] = await pool.query(
      "SELECT id, email, username, password_hash, role FROM felhasznalok WHERE email=? LIMIT 1",
      [email]
    )

    const user = rows[0]
    if (!user) {
      return res.status(401).json({ error: "Hibás belépési adatok" })
    }

    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) {
      return res.status(401).json({ error: "Hibás belépési adatok" })
    }

    const token = makeToken(user)
    setAuthCookie(res, token)

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Bejelentkezési hiba" })
  }
})

app.post("/api/auth/logout", (req, res) => {
  clearAuthCookie(res)
  res.json({ ok: true })
})

app.get("/api/auth/me", authRequired, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      username: req.user.username,
      role: req.user.role
    }
  })
})

app.get("/api/:tabla", async (req, res) => {
  try {
    const { tabla } = req.params

    if (!PUBLIKUS_TABLEK.includes(tabla)) {
      return res.status(400).json({ error: "Ismeretlen tábla" })
    }

    let sql = `SELECT * FROM ${tabla}`

    if (tabla === "menu") {
      sql += " WHERE statusz='aktiv' ORDER BY sorrend ASC, id ASC"
    } else if (["utvonalak", "destinaciok", "esemenyek", "kolcsonzok", "blippek"].includes(tabla)) {
      sql += " WHERE statusz='aktiv' ORDER BY id ASC"
    }

    const [rows] = await pool.query(sql)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Lekérdezési hiba" })
  }
})

app.get("/api/admin/:tabla", adminRequired, async (req, res) => {
  try {
    const { tabla } = req.params

    if (!joTabla(tabla)) {
      return res.status(400).json({ error: "Ismeretlen tábla" })
    }

    const [rows] = await pool.query(`SELECT * FROM ${tabla} ORDER BY id ASC`)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Admin lista hiba" })
  }
})

app.post("/api/admin/:tabla", adminRequired, async (req, res) => {
  try {
    const { tabla } = req.params

    if (!joTabla(tabla)) {
      return res.status(400).json({ error: "Ismeretlen tábla" })
    }

    const allowed = ADMIN_TABLES[tabla]
    const body = req.body || {}

    const keys = allowed.filter(k => body[k] !== undefined)
    if (!keys.length) {
      return res.status(400).json({ error: "Nincs menthető mező" })
    }

    const values = keys.map(k => body[k])
    const qMarks = keys.map(() => "?").join(", ")

    const [result] = await pool.query(
      `INSERT INTO ${tabla} (${keys.join(", ")}) VALUES (${qMarks})`,
      values
    )

    const [rows] = await pool.query(`SELECT * FROM ${tabla} WHERE id=?`, [result.insertId])
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Létrehozási hiba" })
  }
})

app.put("/api/admin/:tabla/:id", adminRequired, async (req, res) => {
  try {
    const { tabla, id } = req.params

    if (!joTabla(tabla)) {
      return res.status(400).json({ error: "Ismeretlen tábla" })
    }

    const allowed = ADMIN_TABLES[tabla]
    const body = req.body || {}

    const keys = allowed.filter(k => body[k] !== undefined)
    if (!keys.length) {
      return res.status(400).json({ error: "Nincs menthető mező" })
    }

    const setSql = keys.map(k => `${k}=?`).join(", ")
    const values = keys.map(k => body[k])

    await pool.query(
      `UPDATE ${tabla} SET ${setSql} WHERE id=?`,
      [...values, id]
    )

    const [rows] = await pool.query(`SELECT * FROM ${tabla} WHERE id=?`, [id])
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Mentési hiba" })
  }
})

app.delete("/api/admin/:tabla/:id", adminRequired, async (req, res) => {
  try {
    const { tabla, id } = req.params

    if (!joTabla(tabla)) {
      return res.status(400).json({ error: "Ismeretlen tábla" })
    }

    await pool.query(`DELETE FROM ${tabla} WHERE id=?`, [id])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Törlési hiba" })
  }
})

app.post("/api/kedvencek/toggle", authRequired, async (req, res) => {
  try {
    const { cel_tipus, cel_id } = req.body

    if (!CEL_TIPUSOK.includes(cel_tipus) || !cel_id) {
      return res.status(400).json({ error: "Hibás cél" })
    }

    const exists = await celLetezik(cel_tipus, cel_id)
    if (!exists) {
      return res.status(404).json({ error: "A cél nem létezik" })
    }

    const [rows] = await pool.query(
      "SELECT id FROM kedvencek WHERE felhasznalo_id=? AND cel_tipus=? AND cel_id=? LIMIT 1",
      [req.user.id, cel_tipus, cel_id]
    )

    if (rows.length) {
      await pool.query("DELETE FROM kedvencek WHERE id=?", [rows[0].id])
      return res.json({ kedvelt: false })
    }

    await pool.query(
      "INSERT INTO kedvencek (felhasznalo_id, cel_tipus, cel_id) VALUES (?,?,?)",
      [req.user.id, cel_tipus, cel_id]
    )

    res.json({ kedvelt: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Kedvenc hiba" })
  }
})

app.get("/api/kedvencek", authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM kedvencek WHERE felhasznalo_id=? ORDER BY letrehozva DESC",
      [req.user.id]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Kedvencek lekérdezési hiba" })
  }
})

app.get("/api/kedvencek/status", authRequired, async (req, res) => {
  try {
    const { cel_tipus, cel_id } = req.query

    if (!CEL_TIPUSOK.includes(cel_tipus) || !cel_id) {
      return res.status(400).json({ error: "Hibás cél" })
    }

    const [rows] = await pool.query(
      "SELECT id FROM kedvencek WHERE felhasznalo_id=? AND cel_tipus=? AND cel_id=? LIMIT 1",
      [req.user.id, cel_tipus, cel_id]
    )

    res.json({ kedvelt: rows.length > 0 })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Kedvenc státusz hiba" })
  }
})

app.post("/api/ertekelesek", authRequired, async (req, res) => {
  try {
    const { cel_tipus, cel_id, pontszam, szoveg } = req.body

    if (!CEL_TIPUSOK.includes(cel_tipus) || !cel_id) {
      return res.status(400).json({ error: "Hibás cél" })
    }

    const pont = Number(pontszam)
    if (!Number.isInteger(pont) || pont < 1 || pont > 5) {
      return res.status(400).json({ error: "Hibás pontszám" })
    }

    const exists = await celLetezik(cel_tipus, cel_id)
    if (!exists) {
      return res.status(404).json({ error: "A cél nem létezik" })
    }

    const [rows] = await pool.query(
      "SELECT id FROM ertekelesek WHERE felhasznalo_id=? AND cel_tipus=? AND cel_id=? LIMIT 1",
      [req.user.id, cel_tipus, cel_id]
    )

    if (rows.length) {
      await pool.query(
        "UPDATE ertekelesek SET pontszam=?, szoveg=?, statusz='fuggoben', ellenorizte_admin=NULL, ellenorizve=NULL, letrehozva=NOW() WHERE id=?",
        [pont, szoveg || null, rows[0].id]
      )
      return res.json({ ok: true, modositva: true })
    }

    await pool.query(
      "INSERT INTO ertekelesek (felhasznalo_id, cel_tipus, cel_id, pontszam, szoveg) VALUES (?,?,?,?,?)",
      [req.user.id, cel_tipus, cel_id, pont, szoveg || null]
    )

    res.json({ ok: true, modositva: false })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Értékelés hiba" })
  }
})

app.get("/api/ertekelesek", async (req, res) => {
  try {
    const { cel_tipus, cel_id } = req.query

    if (!CEL_TIPUSOK.includes(cel_tipus) || !cel_id) {
      return res.status(400).json({ error: "Hibás cél" })
    }

    const [rows] = await pool.query(
      `SELECT e.id, e.pontszam, e.szoveg, e.letrehozva, u.username
       FROM ertekelesek e
       JOIN users u ON u.id = e.felhasznalo_id
       WHERE e.cel_tipus=? AND e.cel_id=? AND e.statusz='elfogadva'
       ORDER BY e.letrehozva DESC`,
      [cel_tipus, cel_id]
    )

    const [avgRows] = await pool.query(
      `SELECT COUNT(*) AS darab, ROUND(AVG(pontszam),2) AS atlag
       FROM ertekelesek
       WHERE cel_tipus=? AND cel_id=? AND statusz='elfogadva'`,
      [cel_tipus, cel_id]
    )

    res.json({
      adatok: rows,
      darab: avgRows[0].darab,
      atlag: avgRows[0].atlag
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Értékelés lekérdezési hiba" })
  }
})

app.post("/api/kepek", authRequired, upload.single("file"), async (req, res) => {
  try {
    const { cel_tipus, cel_id, leiras } = req.body

    if (!CEL_TIPUSOK.includes(cel_tipus) || !cel_id) {
      return res.status(400).json({ error: "Hibás cél" })
    }

    if (!req.file) {
      return res.status(400).json({ error: "Nincs fájl" })
    }

    const exists = await celLetezik(cel_tipus, cel_id)
    if (!exists) {
      return res.status(404).json({ error: "A cél nem létezik" })
    }

    const fajl_utvonal = `/uploads/${req.file.filename}`

    const [result] = await pool.query(
      "INSERT INTO kepek (felhasznalo_id, cel_tipus, cel_id, fajl_utvonal, leiras) VALUES (?,?,?,?,?)",
      [req.user.id, cel_tipus, cel_id, fajl_utvonal, leiras || null]
    )

    res.json({
      ok: true,
      id: result.insertId,
      fajl_utvonal
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Képfeltöltési hiba" })
  }
})

app.get("/api/kepek", async (req, res) => {
  try {
    const { cel_tipus, cel_id } = req.query

    if (!CEL_TIPUSOK.includes(cel_tipus) || !cel_id) {
      return res.status(400).json({ error: "Hibás cél" })
    }

    const [rows] = await pool.query(
      `SELECT k.id, k.fajl_utvonal, k.leiras, k.letrehozva, u.username
       FROM kepek k
       JOIN users u ON u.id = k.felhasznalo_id
       WHERE k.cel_tipus=? AND k.cel_id=? AND k.statusz='elfogadva'
       ORDER BY k.letrehozva DESC`,
      [cel_tipus, cel_id]
    )

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Képek lekérdezési hiba" })
  }
})

app.get("/api/admin/jovahagyando", adminRequired, async (req, res) => {
  try {
    const [ertekelesek] = await pool.query(
      `SELECT e.id, e.cel_tipus, e.cel_id, e.pontszam, e.szoveg, e.letrehozva, u.username, u.email
       FROM ertekelesek e
       JOIN users u ON u.id = e.felhasznalo_id
       WHERE e.statusz='fuggoben'
       ORDER BY e.letrehozva ASC`
    )

    const [kepek] = await pool.query(
      `SELECT k.id, k.cel_tipus, k.cel_id, k.fajl_utvonal, k.leiras, k.letrehozva, u.username, u.email
       FROM kepek k
       JOIN users u ON u.id = k.felhasznalo_id
       WHERE k.statusz='fuggoben'
       ORDER BY k.letrehozva ASC`
    )

    res.json({ ertekelesek, kepek })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Jóváhagyandó lista hiba" })
  }
})

app.post("/api/admin/elfogad", adminRequired, async (req, res) => {
  try {
    const { tipus, id } = req.body

    if (!id || !["ertekeles", "kep"].includes(tipus)) {
      return res.status(400).json({ error: "Hibás kérés" })
    }

    if (tipus === "ertekeles") {
      await pool.query(
        "UPDATE ertekelesek SET statusz='elfogadva', ellenorizte_admin=?, ellenorizve=NOW() WHERE id=?",
        [req.user.id, id]
      )
    }

    if (tipus === "kep") {
      await pool.query(
        "UPDATE kepek SET statusz='elfogadva', ellenorizte_admin=?, ellenorizve=NOW() WHERE id=?",
        [req.user.id, id]
      )
    }

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Elfogadási hiba" })
  }
})

app.post("/api/admin/elutasit", adminRequired, async (req, res) => {
  try {
    const { tipus, id } = req.body

    if (!id || !["ertekeles", "kep"].includes(tipus)) {
      return res.status(400).json({ error: "Hibás kérés" })
    }

    if (tipus === "ertekeles") {
      await pool.query(
        "UPDATE ertekelesek SET statusz='elutasitva', ellenorizte_admin=?, ellenorizve=NOW() WHERE id=?",
        [req.user.id, id]
      )
    }

    if (tipus === "kep") {
      await pool.query(
        "UPDATE kepek SET statusz='elutasitva', ellenorizte_admin=?, ellenorizve=NOW() WHERE id=?",
        [req.user.id, id]
      )
    }

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Elutasítási hiba" })
  }
})

app.listen(PORT, () => {
  console.log(`API fut: http://localhost:${PORT}`)
})