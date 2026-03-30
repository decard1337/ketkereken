import { pool } from "../config/db.js"
import { PUBLIKUS_TABLEK } from "../config/constants.js"

export async function getPublicTable(req, res) {
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
}
