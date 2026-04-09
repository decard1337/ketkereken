import { pool } from "../config/db.js"
import { resolveCelTitle } from "./celHelpers.js"

export async function createActivity({
  felhasznalo_id,
  tipus,
  cel_tipus = null,
  cel_id = null,
  szoveg = null,
  extra = null
}) {
  await pool.query(
    `INSERT INTO aktivitasok
     (felhasznalo_id, tipus, cel_tipus, cel_id, szoveg, extra_json)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      felhasznalo_id,
      tipus,
      cel_tipus,
      cel_id,
      szoveg,
      extra ? JSON.stringify(extra) : null
    ]
  )
}

export async function enrichActivityRows(rows) {
  return Promise.all(
    rows.map(async (row) => {
      let extra = null
      let celTitle = null

      try {
        extra = row.extra_json ? JSON.parse(row.extra_json) : null
      } catch (err) {
        console.error("extra_json parse hiba:", err)
        extra = null
      }

      if (row.cel_tipus && row.cel_id) {
        try {
          celTitle = await resolveCelTitle(row.cel_tipus, row.cel_id)
        } catch (err) {
          console.error("resolveCelTitle hiba:", err)
          celTitle = null
        }
      }

      return {
        id: row.id,
        tipus: row.tipus,
        cel_tipus: row.cel_tipus,
        cel_id: row.cel_id,
        szoveg: row.szoveg,
        extra,
        letrehozva: row.letrehozva,
        celTitle,

        reactions: row.reactions || {},
        myReaction: row.myReaction || null,
        comments: Array.isArray(row.comments) ? row.comments : [],

        user: {
          id: row.user_id,
          username: row.felhasznalonev,
          profilkep: row.profilkep
        }
      }
    })
  )
}