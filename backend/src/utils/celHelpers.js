import { pool } from "../config/db.js"
import { CEL_TIPUS_MAP } from "../config/constants.js"

export function normalizalCelTipus(value) {
  return CEL_TIPUS_MAP[String(value || "").trim().toLowerCase()] || null
}

export async function celLetezik(cel_tipus, cel_id) {
  const tabla = normalizalCelTipus(cel_tipus)
  if (!tabla) return false

  const [rows] = await pool.query(
    `SELECT id FROM ${tabla} WHERE id=? LIMIT 1`,
    [cel_id]
  )

  return rows.length > 0
}

export async function resolveCelTitle(cel_tipus, cel_id) {
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
