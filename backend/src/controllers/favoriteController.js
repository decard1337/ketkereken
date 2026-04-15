import { pool } from "../config/db.js"
import { celLetezik, normalizalCelTipus, resolveCelTitle } from "../utils/typeHelpers.js"
import { createActivity } from "../utils/activityHelpers.js"

export async function toggleFavorite(req, res) {
  try {
    let { cel_tipus, cel_id } = req.body || {}
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

    if (rows.length > 0) {
      await pool.query("DELETE FROM kedvencek WHERE id=?", [rows[0].id])
      return res.json({ action: "removed", kedvelt: false })
    }

    await pool.query(
      "INSERT INTO kedvencek (felhasznalo_id, cel_tipus, cel_id) VALUES (?,?,?)",
      [req.user.id, cel_tipus, cel_id]
    )

    await createActivity({
      felhasznalo_id: req.user.id,
      tipus: "kedvenc_hozzaadva",
      cel_tipus,
      cel_id
    })

    res.json({ action: "added", kedvelt: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Kedvenc hiba" })
  }
}

export async function getMyFavorites(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM kedvencek WHERE felhasznalo_id=? ORDER BY letrehozva DESC",
      [req.user.id]
    )

    const enriched = await Promise.all(rows.map(async item => ({
      ...item,
      title: await resolveCelTitle(item.cel_tipus, item.cel_id)
    })))

    res.json(enriched)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Kedvencek lekérdezési hiba" })
  }
}

export async function getFavoriteStatus(req, res) {
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
}
