import { pool } from "../config/db.js"
import { celLetezik, normalizalCelTipus, resolveCelTitle } from "../utils/typeHelpers.js"
import { createActivity } from "../utils/activityHelpers.js"

export async function createOrUpdateRating(req, res) {
  try {
    let { cel_tipus, cel_id, pontszam, szoveg } = req.body || {}
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
    await createActivity({
      felhasznalo_id: req.user.id,
      tipus: "ertekeles_letrehozva",
      cel_tipus,
      cel_id,
      extra: { pontszam: pont }
    })

    res.json({ ok: true, modositva: false })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Értékelés hiba" })
  }
}

export async function updateOwnRating(req, res) {
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
}

export async function deleteOwnRating(req, res) {
  try {
    const { id } = req.params

    const [rows] = await pool.query(
      "SELECT id FROM ertekelesek WHERE id=? AND felhasznalo_id=? LIMIT 1",
      [id, req.user.id]
    )

    if (!rows.length) {
      return res.status(404).json({ error: "Értékelés nem található" })
    }

    await pool.query("DELETE FROM ertekelesek WHERE id=? AND felhasznalo_id=?", [id, req.user.id])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Értékelés törlési hiba" })
  }
}

export async function getRatings(req, res) {
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
      adatok: rows.map(item => ({ ...item, username: item.felhasznalonev })),
      darab: avgRows[0].darab,
      atlag: avgRows[0].atlag
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Értékelés lekérdezési hiba" })
  }
}

export async function getOwnRatings(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, cel_tipus, cel_id, pontszam, szoveg, statusz, elutasitas_indok, letrehozva
       FROM ertekelesek
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
