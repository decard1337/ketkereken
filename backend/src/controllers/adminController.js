import bcrypt from "bcryptjs"
import { pool } from "../config/db.js"
import { ADMIN_TABLES } from "../config/constants.js"
import { resolveCelTitle } from "../utils/typeHelpers.js"

function joTabla(tabla) {
  return Object.prototype.hasOwnProperty.call(ADMIN_TABLES, tabla)
}

export async function getPendingApprovals(req, res) {
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

    const ertekelesek = await Promise.all(ertekelesekRaw.map(async item => ({
      ...item,
      username: item.felhasznalonev,
      cel_title: await resolveCelTitle(item.cel_tipus, item.cel_id)
    })))

    const kepek = await Promise.all(kepekRaw.map(async item => ({
      ...item,
      username: item.felhasznalonev,
      cel_title: await resolveCelTitle(item.cel_tipus, item.cel_id)
    })))

    res.json({ ertekelesek, kepek })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Jóváhagyandó lista hiba" })
  }
}

export async function approvePending(req, res) {
  try {
    const { tipus, id } = req.body || {}

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
}

export async function rejectPending(req, res) {
  try {
    const { tipus, id, indok } = req.body || {}

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
}

export async function adminList(req, res) {
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
}

export async function adminCreate(req, res) {
  try {
    const { tabla } = req.params

    if (!joTabla(tabla)) {
      return res.status(400).json({ error: "Ismeretlen tábla" })
    }

    const allowed = ADMIN_TABLES[tabla]
    const body = req.body || {}
    const keys = allowed.filter(key => body[key] !== undefined)

    if (!keys.length) {
      return res.status(400).json({ error: "Nincs menthető mező" })
    }

    if (tabla === "felhasznalok") {
      if (!body.email || !body.felhasznalonev) {
        return res.status(400).json({ error: "Email és felhasználónév kötelező" })
      }

      const [mailRows] = await pool.query(
        "SELECT id FROM felhasznalok WHERE email=? LIMIT 1",
        [body.email]
      )
      if (mailRows.length) {
        return res.status(409).json({ error: "Ez az email már foglalt" })
      }

      const [nameRows] = await pool.query(
        "SELECT id FROM felhasznalok WHERE felhasznalonev=? LIMIT 1",
        [body.felhasznalonev]
      )
      if (nameRows.length) {
        return res.status(409).json({ error: "Ez a név már foglalt" })
      }

      const randomPassword = Math.random().toString(36).slice(-10) + "A1!"
      const passwordHash = await bcrypt.hash(randomPassword, 12)

      const insertKeys = [...keys, "jelszo_hash"]
      const values = keys.map(key => body[key])
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

    const values = keys.map(key => body[key])
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
}

export async function adminUpdate(req, res) {
  try {
    const { tabla, id } = req.params

    if (!joTabla(tabla)) {
      return res.status(400).json({ error: "Ismeretlen tábla" })
    }

    const allowed = ADMIN_TABLES[tabla]
    const body = req.body || {}
    const keys = allowed.filter(key => body[key] !== undefined)

    if (!keys.length) {
      return res.status(400).json({ error: "Nincs menthető mező" })
    }

    if (tabla === "felhasznalok") {
      if (body.email !== undefined) {
        const [mailRows] = await pool.query(
          "SELECT id FROM felhasznalok WHERE email=? AND id<>? LIMIT 1",
          [body.email, id]
        )
        if (mailRows.length) {
          return res.status(409).json({ error: "Ez az email már foglalt" })
        }
      }

      if (body.felhasznalonev !== undefined) {
        const [nameRows] = await pool.query(
          "SELECT id FROM felhasznalok WHERE felhasznalonev=? AND id<>? LIMIT 1",
          [body.felhasznalonev, id]
        )
        if (nameRows.length) {
          return res.status(409).json({ error: "Ez a név már foglalt" })
        }
      }
    }

    const setSql = keys.map(key => `${key}=?`).join(", ")
    const values = keys.map(key => body[key])

    await pool.query(`UPDATE ${tabla} SET ${setSql} WHERE id=?`, [...values, id])

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
}

export async function adminResetPassword(req, res) {
  try {
    const { id } = req.params
    const { newPassword } = req.body || {}

    const password = String(newPassword || "")
    if (password.length < 6) {
      return res.status(400).json({ error: "Az új jelszó túl rövid" })
    }

    const hash = await bcrypt.hash(password, 12)
    await pool.query("UPDATE felhasznalok SET jelszo_hash=? WHERE id=?", [hash, id])

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Jelszó módosítási hiba" })
  }
}

export async function adminUploadProfileImage(req, res) {
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
}

export async function adminDelete(req, res) {
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
}
