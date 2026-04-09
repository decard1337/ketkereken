import { pool } from "../config/db.js"
import { enrichActivityRows, createActivity } from "../utils/activityHelpers.js"

const ALLOWED_REACTIONS = ["heart", "fire", "clap", "bike", "wow"]

async function attachReactions(rows, currentUserId = null) {
  if (!rows.length) return []

  const activityIds = rows.map((row) => row.id)
  const placeholders = activityIds.map(() => "?").join(",")

  const [reactionRows] = await pool.query(
    `SELECT aktivitas_id, reakcio, COUNT(*) AS darab
     FROM aktivitas_reakciok
     WHERE aktivitas_id IN (${placeholders})
     GROUP BY aktivitas_id, reakcio`,
    activityIds
  )

  let myReactionRows = []
  if (currentUserId) {
    const [mine] = await pool.query(
      `SELECT aktivitas_id, reakcio
       FROM aktivitas_reakciok
       WHERE felhasznalo_id=? AND aktivitas_id IN (${placeholders})`,
      [currentUserId, ...activityIds]
    )
    myReactionRows = mine
  }

  const reactionMap = new Map()
  const myReactionMap = new Map()

  for (const row of reactionRows) {
    if (!reactionMap.has(row.aktivitas_id)) {
      reactionMap.set(row.aktivitas_id, {})
    }

    reactionMap.get(row.aktivitas_id)[row.reakcio] = Number(row.darab || 0)
  }

  for (const row of myReactionRows) {
    myReactionMap.set(row.aktivitas_id, row.reakcio)
  }

  return rows.map((row) => ({
    ...row,
    reactions: reactionMap.get(row.id) || {},
    myReaction: myReactionMap.get(row.id) || null
  }))
}

async function attachComments(rows, currentUserId = null) {
  if (!rows.length) return []

  const activityIds = rows.map((row) => row.id)
  const placeholders = activityIds.map(() => "?").join(",")

  const [commentRows] = await pool.query(
    `SELECT
       k.id,
       k.aktivitas_id,
       k.felhasznalo_id,
       k.szoveg,
       k.letrehozva,
       f.felhasznalonev,
       f.profilkep
     FROM aktivitas_kommentek k
     JOIN felhasznalok f ON f.id = k.felhasznalo_id
     WHERE k.aktivitas_id IN (${placeholders})
     ORDER BY k.letrehozva ASC`,
    activityIds
  )

  const commentsMap = new Map()

  for (const row of commentRows) {
    if (!commentsMap.has(row.aktivitas_id)) {
      commentsMap.set(row.aktivitas_id, [])
    }

    commentsMap.get(row.aktivitas_id).push({
      id: row.id,
      szoveg: row.szoveg,
      letrehozva: row.letrehozva,
      isOwn: currentUserId ? Number(currentUserId) === Number(row.felhasznalo_id) : false,
      user: {
        id: row.felhasznalo_id,
        username: row.felhasznalonev,
        profilkep: row.profilkep
      }
    })
  }

  return rows.map((row) => ({
    ...row,
    comments: commentsMap.get(row.id) || []
  }))
}

async function buildFeedResponse(rows, currentUserId = null) {
  const withReactions = await attachReactions(rows, currentUserId)
  const withComments = await attachComments(withReactions, currentUserId)
  return enrichActivityRows(withComments)
}

export async function getMyFeed(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
         a.*,
         f.id AS user_id,
         f.felhasznalonev,
         f.profilkep
       FROM aktivitasok a
       JOIN felhasznalok f ON f.id = a.felhasznalo_id
       WHERE a.felhasznalo_id = ?
          OR a.felhasznalo_id IN (
            SELECT kovetett_id
            FROM kovetesek
            WHERE koveto_id = ?
          )
       ORDER BY a.letrehozva DESC
       LIMIT 100`,
      [req.user.id, req.user.id]
    )

    const enriched = await buildFeedResponse(rows, req.user.id)
    res.json(enriched)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Feed lekérdezési hiba" })
  }
}

export async function getUserFeed(req, res) {
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
      `SELECT
         a.*,
         f.id AS user_id,
         f.felhasznalonev,
         f.profilkep
       FROM aktivitasok a
       JOIN felhasznalok f ON f.id = a.felhasznalo_id
       WHERE a.felhasznalo_id = ?
       ORDER BY a.letrehozva DESC
       LIMIT 100`,
      [targetUser.id]
    )

    const currentUserId = req.user?.id || null
    const enriched = await buildFeedResponse(rows, currentUserId)
    res.json(enriched)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Felhasználói feed lekérdezési hiba" })
  }
}

export async function createStatusPost(req, res) {
  try {
    const szoveg = String(req.body?.szoveg || "").trim()

    if (!szoveg) {
      return res.status(400).json({ error: "Üres szöveg" })
    }

    if (szoveg.length > 500) {
      return res.status(400).json({ error: "Túl hosszú szöveg" })
    }

    await createActivity({
      felhasznalo_id: req.user.id,
      tipus: "statusz_poszt",
      szoveg
    })

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Státusz mentési hiba" })
  }
}

export async function reactToActivity(req, res) {
  try {
    const aktivitasId = Number(req.body?.aktivitas_id)
    const reakcio = String(req.body?.reakcio || "").trim()

    if (!Number.isFinite(aktivitasId) || aktivitasId <= 0) {
      return res.status(400).json({ error: "Hibás aktivitás azonosító" })
    }

    if (!ALLOWED_REACTIONS.includes(reakcio)) {
      return res.status(400).json({ error: "Nem engedélyezett reakció" })
    }

    const [activityRows] = await pool.query(
      "SELECT id FROM aktivitasok WHERE id=? LIMIT 1",
      [aktivitasId]
    )

    if (!activityRows.length) {
      return res.status(404).json({ error: "Az aktivitás nem található" })
    }

    const [existingRows] = await pool.query(
      `SELECT id, reakcio
       FROM aktivitas_reakciok
       WHERE aktivitas_id=? AND felhasznalo_id=?
       LIMIT 1`,
      [aktivitasId, req.user.id]
    )

    if (!existingRows.length) {
      await pool.query(
        `INSERT INTO aktivitas_reakciok (aktivitas_id, felhasznalo_id, reakcio)
         VALUES (?, ?, ?)`,
        [aktivitasId, req.user.id, reakcio]
      )

      return res.json({
        action: "added",
        myReaction: reakcio
      })
    }

    const current = existingRows[0]

    if (current.reakcio === reakcio) {
      await pool.query(
        "DELETE FROM aktivitas_reakciok WHERE id=?",
        [current.id]
      )

      return res.json({
        action: "removed",
        myReaction: null
      })
    }

    await pool.query(
      "UPDATE aktivitas_reakciok SET reakcio=? WHERE id=?",
      [reakcio, current.id]
    )

    res.json({
      action: "changed",
      myReaction: reakcio
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Reakció mentési hiba" })
  }
}

export async function createComment(req, res) {
  try {
    const aktivitasId = Number(req.body?.aktivitas_id)
    const szoveg = String(req.body?.szoveg || "").trim()

    if (!Number.isFinite(aktivitasId) || aktivitasId <= 0) {
      return res.status(400).json({ error: "Hibás aktivitás azonosító" })
    }

    if (!szoveg) {
      return res.status(400).json({ error: "A komment üres" })
    }

    if (szoveg.length > 400) {
      return res.status(400).json({ error: "A komment túl hosszú" })
    }

    const [activityRows] = await pool.query(
      "SELECT id FROM aktivitasok WHERE id=? LIMIT 1",
      [aktivitasId]
    )

    if (!activityRows.length) {
      return res.status(404).json({ error: "Az aktivitás nem található" })
    }

    const [result] = await pool.query(
      `INSERT INTO aktivitas_kommentek (aktivitas_id, felhasznalo_id, szoveg)
       VALUES (?, ?, ?)`,
      [aktivitasId, req.user.id, szoveg]
    )

    res.json({
      ok: true,
      id: result.insertId
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Komment mentési hiba" })
  }
}

export async function deleteComment(req, res) {
  try {
    const commentId = Number(req.params.commentId)

    if (!Number.isFinite(commentId) || commentId <= 0) {
      return res.status(400).json({ error: "Hibás komment azonosító" })
    }

    const [rows] = await pool.query(
      `SELECT id, felhasznalo_id
       FROM aktivitas_kommentek
       WHERE id=?
       LIMIT 1`,
      [commentId]
    )

    const comment = rows[0]

    if (!comment) {
      return res.status(404).json({ error: "A komment nem található" })
    }

    if (
      Number(comment.felhasznalo_id) !== Number(req.user.id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Ehhez nincs jogosultságod" })
    }

    await pool.query(
      "DELETE FROM aktivitas_kommentek WHERE id=?",
      [commentId]
    )

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Komment törlési hiba" })
  }
}