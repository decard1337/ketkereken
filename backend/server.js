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
  utvonalak: ["cim", "leiras", "koordinatak", "hossz", "nehezseg", "statusz", "idotartam", "szintkulonbseg"],
  destinaciok: ["nev", "leiras", "lat", "lng", "ertekeles", "tipus", "statusz"],
  esemenyek: ["nev", "leiras", "lat", "lng", "datum", "resztvevok", "tipus", "statusz", "utvonal_id"],
  kolcsonzok: ["nev", "cim", "lat", "lng", "ar", "telefon", "nyitvatartas", "statusz"],
  felhasznalok: ["email", "felhasznalonev", "rang", "profilkep", "bio"]
}

const PUBLIKUS_TABLEK = ["utvonalak", "destinaciok", "esemenyek", "kolcsonzok"]

const CEL_TIPUS_MAP = {
  utvonal: "utvonalak",
  utvonalak: "utvonalak",
  destinacio: "destinaciok",
  destinaciok: "destinaciok",
  esemeny: "esemenyek",
  esemenyek: "esemenyek",
  kolcsonzo: "kolcsonzok",
  kolcsonzok: "kolcsonzok"
}

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}))

app.use(express.json({ limit: "10mb" }))
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

function normalizalCelTipus(value) {
  return CEL_TIPUS_MAP[String(value || "").trim().toLowerCase()] || null
}

function makeToken(user) {
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

function joTabla(tabla) {
  return Object.prototype.hasOwnProperty.call(ADMIN_TABLES, tabla)
}

async function celLetezik(cel_tipus, cel_id) {
  const normalizalt = normalizalCelTipus(cel_tipus)
  if (!normalizalt) return false

  const [rows] = await pool.query(
    `SELECT id FROM ${normalizalt} WHERE id=? LIMIT 1`,
    [cel_id]
  )

  return rows.length > 0
}

async function getPublicUserByUsername(username) {
  const [rows] = await pool.query(
    "SELECT id, felhasznalonev, rang, profilkep, bio, letrehozva FROM felhasznalok WHERE felhasznalonev=? LIMIT 1",
    [username]
  )
  return rows[0] || null
}

async function resolveCelTitle(cel_tipus, cel_id) {
  const tabla = normalizalCelTipus(cel_tipus)
  if (!tabla) return null

  let sql = ""
  if (tabla === "utvonalak") sql = "SELECT cim AS title FROM utvonalak WHERE id=? LIMIT 1"
  if (tabla === "destinaciok") sql = "SELECT nev AS title FROM destinaciok WHERE id=? LIMIT 1"
  if (tabla === "esemenyek") sql = "SELECT nev AS title FROM esemenyek WHERE id=? LIMIT 1"
  if (tabla === "kolcsonzok") sql = "SELECT nev AS title FROM kolcsonzok WHERE id=? LIMIT 1"

  if (!sql) return null

  const [rows] = await pool.query(sql, [cel_id])
  return rows[0]?.title || null
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

    if (String(password).length < 6) {
      return res.status(400).json({ error: "Túl rövid jelszó" })
    }

    const [emailExists] = await pool.query(
      "SELECT id FROM felhasznalok WHERE email=? LIMIT 1",
      [email]
    )
    if (emailExists.length) {
      return res.status(409).json({ error: "Ez az email már foglalt" })
    }

    const [userExists] = await pool.query(
      "SELECT id FROM felhasznalok WHERE felhasznalonev=? LIMIT 1",
      [username]
    )
    if (userExists.length) {
      return res.status(409).json({ error: "Ez a név már foglalt" })
    }

    const jelszo_hash = await bcrypt.hash(password, 12)

    const [result] = await pool.query(
      "INSERT INTO felhasznalok (email, felhasznalonev, jelszo_hash, rang) VALUES (?,?,?, 'felhasznalo')",
      [email, username, jelszo_hash]
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
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

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

    const tokenUser = {
      id: user.id,
      email: user.email,
      username: user.felhasznalonev,
      role: user.rang,
      profilkep: user.profilkep,
      bio: user.bio,
      letrehozva: user.letrehozva
    }

    setAuthCookie(res, makeToken(tokenUser))

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.felhasznalonev,
        role: user.rang,
        profilkep: user.profilkep,
        bio: user.bio,
        letrehozva: user.letrehozva
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
  try {
    const [rows] = await pool.query(
      "SELECT id, email, felhasznalonev, rang, profilkep, bio, letrehozva FROM felhasznalok WHERE id=? LIMIT 1",
      [req.user.id]
    )

    const user = rows[0]
    if (!user) {
      return res.status(404).json({ error: "Felhasználó nem található" })
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.felhasznalonev,
        role: user.rang,
        profilkep: user.profilkep,
        bio: user.bio,
        letrehozva: user.letrehozva
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Felhasználó lekérdezési hiba" })
  }
})

app.get("/api/u/:username", async (req, res) => {
  try {
    const username = String(req.params.username || "").trim()
    if (!username) {
      return res.status(400).json({ error: "Hiányzó felhasználónév" })
    }

    const viewedUser = await getPublicUserByUsername(username)
    if (!viewedUser) {
      return res.status(404).json({ error: "Felhasználó nem található" })
    }

    const [ertekelesekRaw] = await pool.query(
      `SELECT id, cel_tipus, cel_id, pontszam, szoveg, statusz, letrehozva
       FROM ertekelesek
       WHERE felhasznalo_id=? AND statusz='elfogadva'
       ORDER BY letrehozva DESC`,
      [viewedUser.id]
    )

    const [kepekRaw] = await pool.query(
      `SELECT id, cel_tipus, cel_id, fajl_utvonal, leiras, statusz, letrehozva
       FROM kepek
       WHERE felhasznalo_id=? AND statusz='elfogadva'
       ORDER BY letrehozva DESC`,
      [viewedUser.id]
    )

    const [kedvencekRaw] = await pool.query(
      `SELECT id, cel_tipus, cel_id, letrehozva
       FROM kedvencek
       WHERE felhasznalo_id=?
       ORDER BY letrehozva DESC`,
      [viewedUser.id]
    )

    const ertekelesek = await Promise.all(
      ertekelesekRaw.map(async e => ({
        ...e,
        title: await resolveCelTitle(e.cel_tipus, e.cel_id)
      }))
    )

    const kepek = await Promise.all(
      kepekRaw.map(async k => ({
        ...k,
        title: await resolveCelTitle(k.cel_tipus, k.cel_id)
      }))
    )

    const kedvencek = await Promise.all(
      kedvencekRaw.map(async k => ({
        ...k,
        title: await resolveCelTitle(k.cel_tipus, k.cel_id)
      }))
    )

    res.json({
      user: {
        id: viewedUser.id,
        username: viewedUser.felhasznalonev,
        role: viewedUser.rang,
        profilkep: viewedUser.profilkep,
        bio: viewedUser.bio,
        letrehozva: viewedUser.letrehozva
      },
      kedvencek,
      ertekelesek,
      kepek
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Nyilvános profil hiba" })
  }
})

app.put("/api/profilom", authRequired, async (req, res) => {
  try {
    const { username, bio } = req.body || {}

    const cleanUsername = String(username || "").trim().slice(0, 100)
    const cleanBio = bio ? String(bio).slice(0, 800) : null

    if (!cleanUsername) {
      return res.status(400).json({ error: "Hiányzó felhasználónév" })
    }

    const [currentRows] = await pool.query(
      "SELECT id, email, felhasznalonev, rang, profilkep, bio, letrehozva FROM felhasznalok WHERE id=? LIMIT 1",
      [req.user.id]
    )

    const currentUser = currentRows[0]
    if (!currentUser) {
      return res.status(404).json({ error: "Felhasználó nem található" })
    }

    if (cleanUsername !== currentUser.felhasznalonev) {
      const [exists] = await pool.query(
        "SELECT id FROM felhasznalok WHERE felhasznalonev=? LIMIT 1",
        [cleanUsername]
      )
      if (exists.length) {
        return res.status(409).json({ error: "Ez a név már foglalt" })
      }
    }

    await pool.query(
      "UPDATE felhasznalok SET felhasznalonev=?, bio=?, utolso_modositas=NOW() WHERE id=?",
      [cleanUsername, cleanBio, req.user.id]
    )

    const [rows] = await pool.query(
      "SELECT id, email, felhasznalonev, rang, profilkep, bio, letrehozva FROM felhasznalok WHERE id=? LIMIT 1",
      [req.user.id]
    )

    const user = rows[0]

    setAuthCookie(res, makeToken({
      id: user.id,
      email: user.email,
      username: user.felhasznalonev,
      role: user.rang,
      profilkep: user.profilkep,
      bio: user.bio,
      letrehozva: user.letrehozva
    }))

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.felhasznalonev,
        role: user.rang,
        profilkep: user.profilkep,
        bio: user.bio,
        letrehozva: user.letrehozva
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Profil mentési hiba" })
  }
})

app.post("/api/profilom/profilkep", authRequired, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nincs fájl" })
    }

    const fajlUt = `/uploads/${req.file.filename}`

    await pool.query(
      "UPDATE felhasznalok SET profilkep=?, utolso_modositas=NOW() WHERE id=?",
      [fajlUt, req.user.id]
    )

    const [rows] = await pool.query(
      "SELECT id, email, felhasznalonev, rang, profilkep, bio, letrehozva FROM felhasznalok WHERE id=? LIMIT 1",
      [req.user.id]
    )

    const user = rows[0]

    setAuthCookie(res, makeToken({
      id: user.id,
      email: user.email,
      username: user.felhasznalonev,
      role: user.rang,
      profilkep: user.profilkep,
      bio: user.bio,
      letrehozva: user.letrehozva
    }))

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.felhasznalonev,
        role: user.rang,
        profilkep: user.profilkep,
        bio: user.bio,
        letrehozva: user.letrehozva
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Profilkép mentési hiba" })
  }
})

app.post("/api/kedvencek/toggle", authRequired, async (req, res) => {
  try {
    let { cel_tipus, cel_id } = req.body
    cel_tipus = normalizalCelTipus(cel_tipus)

    if (!cel_tipus || !cel_id) {
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

    const enriched = await Promise.all(
      rows.map(async r => ({
        ...r,
        title: await resolveCelTitle(r.cel_tipus, r.cel_id)
      }))
    )

    res.json(enriched)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Kedvencek lekérdezési hiba" })
  }
})

app.get("/api/kedvencek/status", authRequired, async (req, res) => {
  try {
    let { cel_tipus, cel_id } = req.query
    cel_tipus = normalizalCelTipus(cel_tipus)

    if (!cel_tipus || !cel_id) {
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
    let { cel_tipus, cel_id, pontszam, szoveg } = req.body
    cel_tipus = normalizalCelTipus(cel_tipus)

    if (!cel_tipus || !cel_id) {
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
        `UPDATE ertekelesek
         SET pontszam=?, szoveg=?, cel_tipus=?, statusz='fuggoben',
             ellenorizte_admin=NULL, ellenorizve=NULL, elutasitas_indok=NULL, letrehozva=NOW()
         WHERE id=?`,
        [pont, szoveg || null, cel_tipus, rows[0].id]
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

app.put("/api/sajat/ertekelesek/:id", authRequired, async (req, res) => {
  try {
    const { id } = req.params
    const { pontszam, szoveg } = req.body || {}

    const pont = Number(pontszam)
    if (!Number.isInteger(pont) || pont < 1 || pont > 5) {
      return res.status(400).json({ error: "Hibás pontszám" })
    }

    const [rows] = await pool.query(
      "SELECT * FROM ertekelesek WHERE id=? AND felhasznalo_id=? LIMIT 1",
      [id, req.user.id]
    )

    const ertekeles = rows[0]
    if (!ertekeles) {
      return res.status(404).json({ error: "Értékelés nem található" })
    }

    await pool.query(
      `UPDATE ertekelesek
       SET pontszam=?, szoveg=?, statusz='fuggoben', ellenorizte_admin=NULL, ellenorizve=NULL, elutasitas_indok=NULL, letrehozva=NOW()
       WHERE id=? AND felhasznalo_id=?`,
      [pont, szoveg || null, id, req.user.id]
    )

    const [updated] = await pool.query(
      "SELECT id, cel_tipus, cel_id, pontszam, szoveg, statusz, letrehozva FROM ertekelesek WHERE id=? LIMIT 1",
      [id]
    )

    res.json({ ok: true, ertekeles: updated[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Értékelés mentési hiba" })
  }
})

app.delete("/api/sajat/ertekelesek/:id", authRequired, async (req, res) => {
  try {
    const { id } = req.params

    const [rows] = await pool.query(
      "SELECT id FROM ertekelesek WHERE id=? AND felhasznalo_id=? LIMIT 1",
      [id, req.user.id]
    )

    if (!rows.length) {
      return res.status(404).json({ error: "Értékelés nem található" })
    }

    await pool.query(
      "DELETE FROM ertekelesek WHERE id=? AND felhasznalo_id=?",
      [id, req.user.id]
    )

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Értékelés törlési hiba" })
  }
})

app.get("/api/ertekelesek", async (req, res) => {
  try {
    let { cel_tipus, cel_id } = req.query
    cel_tipus = normalizalCelTipus(cel_tipus)

    if (!cel_tipus || !cel_id) {
      return res.status(400).json({ error: "Hibás cél" })
    }

    const [rows] = await pool.query(
      `SELECT e.id, e.pontszam, e.szoveg, e.letrehozva, u.felhasznalonev
       FROM ertekelesek e
       JOIN felhasznalok u ON u.id = e.felhasznalo_id
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
      adatok: rows.map(r => ({
        ...r,
        username: r.felhasznalonev
      })),
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
    let { cel_tipus, cel_id, leiras } = req.body
    cel_tipus = normalizalCelTipus(cel_tipus)

    if (!cel_tipus || !cel_id) {
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
    let { cel_tipus, cel_id } = req.query
    cel_tipus = normalizalCelTipus(cel_tipus)

    if (!cel_tipus || !cel_id) {
      return res.status(400).json({ error: "Hibás cél" })
    }

    const [rows] = await pool.query(
      `SELECT k.id, k.fajl_utvonal, k.leiras, k.letrehozva, u.felhasznalonev
       FROM kepek k
       JOIN felhasznalok u ON u.id = k.felhasznalo_id
       WHERE k.cel_tipus=? AND k.cel_id=? AND k.statusz='elfogadva'
       ORDER BY k.letrehozva DESC`,
      [cel_tipus, cel_id]
    )

    res.json(rows.map(r => ({
      ...r,
      username: r.felhasznalonev
    })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Képek lekérdezési hiba" })
  }
})

app.get("/api/sajat/ertekelesek", authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, cel_tipus, cel_id, pontszam, szoveg, statusz, elutasitas_indok, letrehozva
       FROM ertekelesek
       WHERE felhasznalo_id=?
       ORDER BY letrehozva DESC`,
      [req.user.id]
    )

    const enriched = await Promise.all(
      rows.map(async r => ({
        ...r,
        title: await resolveCelTitle(r.cel_tipus, r.cel_id)
      }))
    )

    res.json(enriched)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Hiba" })
  }
})

app.get("/api/sajat/kepek", authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, cel_tipus, cel_id, fajl_utvonal, leiras, statusz, elutasitas_indok, letrehozva
       FROM kepek
       WHERE felhasznalo_id=?
       ORDER BY letrehozva DESC`,
      [req.user.id]
    )

    const enriched = await Promise.all(
      rows.map(async r => ({
        ...r,
        title: await resolveCelTitle(r.cel_tipus, r.cel_id)
      }))
    )

    res.json(enriched)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Hiba" })
  }
})

app.get("/api/admin/jovahagyando", adminRequired, async (req, res) => {
  try {
    const [ertekelesekRaw] = await pool.query(
      `SELECT e.id, e.cel_tipus, e.cel_id, e.pontszam, e.szoveg, e.letrehozva, u.felhasznalonev, u.email
       FROM ertekelesek e
       JOIN felhasznalok u ON u.id = e.felhasznalo_id
       WHERE e.statusz='fuggoben'
       ORDER BY e.letrehozva ASC`
    )

    const [kepekRaw] = await pool.query(
      `SELECT k.id, k.cel_tipus, k.cel_id, k.fajl_utvonal, k.leiras, k.letrehozva, u.felhasznalonev, u.email
       FROM kepek k
       JOIN felhasznalok u ON u.id = k.felhasznalo_id
       WHERE k.statusz='fuggoben'
       ORDER BY k.letrehozva ASC`
    )

    const ertekelesek = await Promise.all(
      ertekelesekRaw.map(async e => ({
        ...e,
        username: e.felhasznalonev,
        cel_title: await resolveCelTitle(e.cel_tipus, e.cel_id)
      }))
    )

    const kepek = await Promise.all(
      kepekRaw.map(async k => ({
        ...k,
        username: k.felhasznalonev,
        cel_title: await resolveCelTitle(k.cel_tipus, k.cel_id)
      }))
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
        "UPDATE ertekelesek SET statusz='elfogadva', ellenorizte_admin=?, ellenorizve=NOW(), elutasitas_indok=NULL WHERE id=?",
        [req.user.id, id]
      )
    }

    if (tipus === "kep") {
      await pool.query(
        "UPDATE kepek SET statusz='elfogadva', ellenorizte_admin=?, ellenorizve=NOW(), elutasitas_indok=NULL WHERE id=?",
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
    const { tipus, id, indok } = req.body

    if (!id || !["ertekeles", "kep"].includes(tipus)) {
      return res.status(400).json({ error: "Hibás kérés" })
    }

    const reason = indok ? String(indok).slice(0, 1000) : null

    if (tipus === "ertekeles") {
      await pool.query(
        "UPDATE ertekelesek SET statusz='elutasitva', ellenorizte_admin=?, ellenorizve=NOW(), elutasitas_indok=? WHERE id=?",
        [req.user.id, reason, id]
      )
    }

    if (tipus === "kep") {
      await pool.query(
        "UPDATE kepek SET statusz='elutasitva', ellenorizte_admin=?, ellenorizve=NOW(), elutasitas_indok=? WHERE id=?",
        [req.user.id, reason, id]
      )
    }

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Elutasítási hiba" })
  }
})

app.get("/api/admin/:tabla", adminRequired, async (req, res) => {
  try {
    const { tabla } = req.params

    if (!joTabla(tabla)) {
      return res.status(400).json({ error: "Ismeretlen tábla" })
    }

    if (tabla === "felhasznalok") {
      const [rows] = await pool.query(
        "SELECT id, email, felhasznalonev, rang, profilkep, bio, letrehozva FROM felhasznalok ORDER BY id ASC"
      )
      return res.json(rows)
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

    if (tabla === "felhasznalok") {
      if (!body.email || !body.felhasznalonev) {
        return res.status(400).json({ error: "Email és felhasználónév kötelező" })
      }

      const [mailExists] = await pool.query(
        "SELECT id FROM felhasznalok WHERE email=? LIMIT 1",
        [body.email]
      )
      if (mailExists.length) {
        return res.status(409).json({ error: "Ez az email már foglalt" })
      }

      const [nameExists] = await pool.query(
        "SELECT id FROM felhasznalok WHERE felhasznalonev=? LIMIT 1",
        [body.felhasznalonev]
      )
      if (nameExists.length) {
        return res.status(409).json({ error: "Ez a név már foglalt" })
      }

      const randomPassword = Math.random().toString(36).slice(-10) + "A1!"
      const passwordHash = await bcrypt.hash(randomPassword, 12)

      const insertKeys = [...keys, "jelszo_hash"]
      const values = keys.map(k => body[k])

      const qMarks = insertKeys.map(() => "?").join(", ")

      const [result] = await pool.query(
        `INSERT INTO felhasznalok (${insertKeys.join(", ")}) VALUES (${qMarks})`,
        [...values, passwordHash]
      )

      const [rows] = await pool.query(
        "SELECT id, email, felhasznalonev, rang, profilkep, bio, letrehozva FROM felhasznalok WHERE id=?",
        [result.insertId]
      )

      return res.json(rows[0])
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

    if (tabla === "felhasznalok") {
      if (body.email !== undefined) {
        const [mailExists] = await pool.query(
          "SELECT id FROM felhasznalok WHERE email=? AND id<>? LIMIT 1",
          [body.email, id]
        )
        if (mailExists.length) {
          return res.status(409).json({ error: "Ez az email már foglalt" })
        }
      }

      if (body.felhasznalonev !== undefined) {
        const [nameExists] = await pool.query(
          "SELECT id FROM felhasznalok WHERE felhasznalonev=? AND id<>? LIMIT 1",
          [body.felhasznalonev, id]
        )
        if (nameExists.length) {
          return res.status(409).json({ error: "Ez a név már foglalt" })
        }
      }
    }

    const setSql = keys.map(k => `${k}=?`).join(", ")
    const values = keys.map(k => body[k])

    await pool.query(
      `UPDATE ${tabla} SET ${setSql} WHERE id=?`,
      [...values, id]
    )

    if (tabla === "felhasznalok") {
      const [rows] = await pool.query(
        "SELECT id, email, felhasznalonev, rang, profilkep, bio, letrehozva FROM felhasznalok WHERE id=?",
        [id]
      )
      return res.json(rows[0])
    }

    const [rows] = await pool.query(`SELECT * FROM ${tabla} WHERE id=?`, [id])
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Mentési hiba" })
  }
})

app.put("/api/admin/felhasznalok/:id/jelszo", adminRequired, async (req, res) => {
  try {
    const { id } = req.params
    const { newPassword } = req.body || {}

    const password = String(newPassword || "")
    if (password.length < 6) {
      return res.status(400).json({ error: "Az új jelszó túl rövid" })
    }

    const hash = await bcrypt.hash(password, 12)

    await pool.query(
      "UPDATE felhasznalok SET jelszo_hash=? WHERE id=?",
      [hash, id]
    )

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Jelszó módosítási hiba" })
  }
})

app.post("/api/admin/felhasznalok/:id/profilkep", adminRequired, upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params

    if (!req.file) {
      return res.status(400).json({ error: "Nincs fájl" })
    }

    const fajlUt = `/uploads/${req.file.filename}`

    await pool.query(
      "UPDATE felhasznalok SET profilkep=? WHERE id=?",
      [fajlUt, id]
    )

    const [rows] = await pool.query(
      "SELECT id, email, felhasznalonev, rang, profilkep, bio, letrehozva FROM felhasznalok WHERE id=?",
      [id]
    )

    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Profilkép módosítási hiba" })
  }
})

app.delete("/api/admin/:tabla/:id", adminRequired, async (req, res) => {
  try {
    const { tabla, id } = req.params

    if (!joTabla(tabla)) {
      return res.status(400).json({ error: "Ismeretlen tábla" })
    }

    if (tabla === "felhasznalok" && Number(id) === Number(req.user.id)) {
      return res.status(400).json({ error: "Saját admin felhasználót nem törölheted" })
    }

    await pool.query(`DELETE FROM ${tabla} WHERE id=?`, [id])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Törlési hiba" })
  }
})

app.get("/api/:tabla", async (req, res) => {
  try {
    const { tabla } = req.params

    if (!PUBLIKUS_TABLEK.includes(tabla)) {
      return res.status(400).json({ error: "Ismeretlen tábla" })
    }

    const [rows] = await pool.query(
      `SELECT * FROM ${tabla} WHERE statusz='aktiv' ORDER BY id ASC`
    )

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Lekérdezési hiba" })
  }
})

app.listen(PORT, () => {
  console.log(`API fut: http://localhost:${PORT}`)
})