import { pool } from "../config/db.js"
import { createActivity } from "../utils/activityHelpers.js"

export async function toggleFollow(req, res) {
  try {
    const { username } = req.body || {}

    if (!username) {
      return res.status(400).json({ error: "Hiányzó felhasználónév" })
    }

    const [userRows] = await pool.query(
      "SELECT id, felhasznalonev FROM felhasznalok WHERE felhasznalonev=? LIMIT 1",
      [username]
    )

    const targetUser = userRows[0]

    if (!targetUser) {
      return res.status(404).json({ error: "A felhasználó nem található" })
    }

    if (Number(targetUser.id) === Number(req.user.id)) {
      return res.status(400).json({ error: "Saját magadat nem követheted" })
    }

    const [followRows] = await pool.query(
      "SELECT id FROM kovetesek WHERE koveto_id=? AND kovetett_id=? LIMIT 1",
      [req.user.id, targetUser.id]
    )

    if (followRows.length > 0) {
      await pool.query(
        "DELETE FROM kovetesek WHERE id=?",
        [followRows[0].id]
      )

      return res.json({
        action: "unfollowed",
        following: false
      })
    }

    await pool.query(
      "INSERT INTO kovetesek (koveto_id, kovetett_id) VALUES (?, ?)",
      [req.user.id, targetUser.id]
    )

      await createActivity({
          felhasznalo_id: req.user.id,
          tipus: "felhasznalo_kovetese",
          szoveg: targetUser.felhasznalonev,
          extra: {
              targetUserId: targetUser.id,
              targetUsername: targetUser.felhasznalonev
          }
      })

    res.json({
      action: "followed",
      following: true
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Követési hiba" })
  }
}

export async function getFollowStatus(req, res) {
  try {
    const username = String(req.params.username || "").trim()

    if (!username) {
      return res.status(400).json({ error: "Hiányzó felhasználónév" })
    }

    const [userRows] = await pool.query(
      "SELECT id FROM felhasznalok WHERE felhasznalonev=? LIMIT 1",
      [username]
    )

    const targetUser = userRows[0]

    if (!targetUser) {
      return res.status(404).json({ error: "A felhasználó nem található" })
    }

    const [rows] = await pool.query(
      "SELECT id FROM kovetesek WHERE koveto_id=? AND kovetett_id=? LIMIT 1",
      [req.user.id, targetUser.id]
    )

    res.json({
      following: rows.length > 0
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Követés státusz hiba" })
  }
}

export async function getFollowers(req, res) {
  try {
    const username = String(req.params.username || "").trim()

    if (!username) {
      return res.status(400).json({ error: "Hiányzó felhasználónév" })
    }

    const [userRows] = await pool.query(
      "SELECT id FROM felhasznalok WHERE felhasznalonev=? LIMIT 1",
      [username]
    )

    const targetUser = userRows[0]

    if (!targetUser) {
      return res.status(404).json({ error: "A felhasználó nem található" })
    }

    const [rows] = await pool.query(
      `SELECT f.id, f.felhasznalonev, f.profilkep, f.bio
       FROM kovetesek k
       JOIN felhasznalok f ON f.id = k.koveto_id
       WHERE k.kovetett_id=?
       ORDER BY k.letrehozva DESC`,
      [targetUser.id]
    )

    res.json(rows.map(row => ({
      id: row.id,
      username: row.felhasznalonev,
      profilkep: row.profilkep,
      bio: row.bio
    })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Követők lekérdezési hiba" })
  }
}

export async function getFollowing(req, res) {
  try {
    const username = String(req.params.username || "").trim()

    if (!username) {
      return res.status(400).json({ error: "Hiányzó felhasználónév" })
    }

    const [userRows] = await pool.query(
      "SELECT id FROM felhasznalok WHERE felhasznalonev=? LIMIT 1",
      [username]
    )

    const targetUser = userRows[0]

    if (!targetUser) {
      return res.status(404).json({ error: "A felhasználó nem található" })
    }

    const [rows] = await pool.query(
      `SELECT f.id, f.felhasznalonev, f.profilkep, f.bio
       FROM kovetesek k
       JOIN felhasznalok f ON f.id = k.kovetett_id
       WHERE k.koveto_id=?
       ORDER BY k.letrehozva DESC`,
      [targetUser.id]
    )

    res.json(rows.map(row => ({
      id: row.id,
      username: row.felhasznalonev,
      profilkep: row.profilkep,
      bio: row.bio
    })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Követések lekérdezési hiba" })
  }
}