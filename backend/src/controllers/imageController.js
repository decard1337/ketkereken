import { pool } from "../config/db.js"
import { celLetezik, normalizalCelTipus, resolveCelTitle } from "../utils/typeHelpers.js"
import { createActivity } from "../utils/activityHelpers.js"

export async function uploadImage(req, res) {
  try {
    let { cel_tipus, cel_id, leiras } = req.body || {}
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

    await createActivity({
      felhasznalo_id: req.user.id,
      tipus: "kep_feltoltve",
      cel_tipus,
      cel_id,
      szoveg: leiras || null
    })

    res.json({ ok: true, id: result.insertId, fajl_utvonal })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Képfeltöltési hiba" })
  }
}

export async function getImages(req, res) {
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

    res.json(rows.map(item => ({ ...item, username: item.felhasznalonev })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Képek lekérdezési hiba" })
  }
}

export async function getOwnImages(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, cel_tipus, cel_id, fajl_utvonal, leiras, statusz, elutasitas_indok, letrehozva
       FROM kepek
       WHERE felhasznalo_id=?
       ORDER BY letrehozva DESC`,
      [req.user.id]
    )

    const enriched = await Promise.all(rows.map(async item => ({
      ...item,
      title: await resolveCelTitle(item.cel_tipus, item.cel_id)
    })))

    res.json(enriched)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Hiba" })
  }
}
