import { pool } from "../config/db.js"

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

export function normalizalCelTipus(value) {
  return CEL_TIPUS_MAP[String(value || "").trim().toLowerCase()] || null
}

export async function celLetezik(cel_tipus, cel_id) {
  const tabla = normalizalCelTipus(cel_tipus)

  if (!tabla || !cel_id) {
    return false
  }

  const [rows] = await pool.query(
    `SELECT id FROM ${tabla} WHERE id=? LIMIT 1`,
    [cel_id]
  )

  return rows.length > 0
}

export async function resolveCelTitle(cel_tipus, cel_id) {
  const tabla = normalizalCelTipus(cel_tipus)

  if (!tabla || !cel_id) {
    return null
  }

  try {
    let sql = ""

    if (tabla === "utvonalak") {
      sql = "SELECT cim AS title FROM utvonalak WHERE id=? LIMIT 1"
    }

    if (tabla === "destinaciok") {
      sql = "SELECT nev AS title FROM destinaciok WHERE id=? LIMIT 1"
    }

    if (tabla === "esemenyek") {
      sql = "SELECT nev AS title FROM esemenyek WHERE id=? LIMIT 1"
    }

    if (tabla === "kolcsonzok") {
      sql = "SELECT nev AS title FROM kolcsonzok WHERE id=? LIMIT 1"
    }

    if (!sql) {
      return null
    }

    const [rows] = await pool.query(sql, [cel_id])
    return rows[0]?.title || null
  } catch (err) {
    console.error("resolveCelTitle hiba:", err)
    return null
  }
}