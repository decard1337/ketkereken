import { pool } from "../config/db.js"
import { makeToken, setAuthCookie } from "../utils/authHelpers.js"
import { resolveCelTitle } from "../utils/celHelpers.js"
import { userToResponse } from "../utils/userHelpers.js"

export async function getPublicProfile(req, res) {
  try {
    const username = String(req.params.username || "").trim()

    if (!username) {
      return res.status(400).json({ error: "Hiányzó felhasználónév" })
    }

    const [userRows] = await pool.query(
      "SELECT id, felhasznalonev, rang, profilkep, bio, letrehozva FROM felhasznalok WHERE felhasznalonev=? LIMIT 1",
      [username]
    )

    const viewedUser = userRows[0]
    if (!viewedUser) {
      return res.status(404).json({ error: "Felhasználó nem található" })
    }

    const [ertekelesekRaw] = await pool.query(
      `SELECT id, cel_tipus, cel_id, pontszam, szoveg, statusz, letrehozva
       FROM ertekelesek
       WHERE felhasznalo_id=? AND statusz='elfogadva'
       ORDER BY letrehozva DESC`,
      [viewedUser.id]
    )

    const [kepekRaw] = await pool.query(
      `SELECT id, cel_tipus, cel_id, fajl_utvonal, leiras, statusz, letrehozva
       FROM kepek
       WHERE felhasznalo_id=? AND statusz='elfogadva'
       ORDER BY letrehozva DESC`,
      [viewedUser.id]
    )

    const [kedvencekRaw] = await pool.query(
      `SELECT id, cel_tipus, cel_id, letrehozva
       FROM kedvencek
       WHERE felhasznalo_id=?
       ORDER BY letrehozva DESC`,
      [viewedUser.id]
    )

    const [[followersCountRow]] = await pool.query(
      "SELECT COUNT(*) AS count FROM kovetesek WHERE kovetett_id=?",
      [viewedUser.id]
    )

    const [[followingCountRow]] = await pool.query(
      "SELECT COUNT(*) AS count FROM kovetesek WHERE koveto_id=?",
      [viewedUser.id]
    )

    let following = false

    if (req.user?.id) {
      const [followRows] = await pool.query(
        "SELECT id FROM kovetesek WHERE koveto_id=? AND kovetett_id=? LIMIT 1",
        [req.user.id, viewedUser.id]
      )

      following = followRows.length > 0
    }

    const ertekelesek = await Promise.all(ertekelesekRaw.map(async item => ({
      ...item,
      title: await resolveCelTitle(item.cel_tipus, item.cel_id)
    })))

    const kepek = await Promise.all(kepekRaw.map(async item => ({
      ...item,
      title: await resolveCelTitle(item.cel_tipus, item.cel_id)
    })))

    const kedvencek = await Promise.all(kedvencekRaw.map(async item => ({
      ...item,
      title: await resolveCelTitle(item.cel_tipus, item.cel_id)
    })))

    res.json({
      user: {
        id: viewedUser.id,
        username: viewedUser.felhasznalonev,
        role: viewedUser.rang,
        profilkep: viewedUser.profilkep,
        bio: viewedUser.bio,
        letrehozva: viewedUser.letrehozva,
        followersCount: Number(followersCountRow?.count || 0),
        followingCount: Number(followingCountRow?.count || 0),
        following
      },
      kedvencek,
      ertekelesek,
      kepek
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Nyilvános profil hiba" })
  }
}

export async function updateMyProfile(req, res) {
  try {
    const { username, bio } = req.body || {}

    const cleanUsername = String(username || "").trim().slice(0, 100)
    const cleanBio = bio ? String(bio).slice(0, 800) : null

    if (!cleanUsername) {
      return res.status(400).json({ error: "Hiányzó felhasználónév" })
    }

    const [currentRows] = await pool.query(
      "SELECT id, email, felhasznalonev, rang, profilkep, bio, letrehozva FROM felhasznalok WHERE id=? LIMIT 1",
      [req.user.id]
    )

    const currentUser = currentRows[0]
    if (!currentUser) {
      return res.status(404).json({ error: "Felhasználó nem található" })
    }

    if (cleanUsername !== currentUser.felhasznalonev) {
      const [existsRows] = await pool.query(
        "SELECT id FROM felhasznalok WHERE felhasznalonev=? LIMIT 1",
        [cleanUsername]
      )

      if (existsRows.length) {
        return res.status(409).json({ error: "Ez a név már foglalt" })
      }
    }

    await pool.query(
      "UPDATE felhasznalok SET felhasznalonev=?, bio=?, utolso_modositas=NOW() WHERE id=?",
      [cleanUsername, cleanBio, req.user.id]
    )

    const [rows] = await pool.query(
      "SELECT id, email, felhasznalonev, rang, profilkep, bio, letrehozva FROM felhasznalok WHERE id=? LIMIT 1",
      [req.user.id]
    )

    const user = rows[0]

    setAuthCookie(res, makeToken({
      id: user.id,
      email: user.email,
      username: user.felhasznalonev,
      role: user.rang,
      profilkep: user.profilkep,
      bio: user.bio,
      letrehozva: user.letrehozva
    }))

    res.json({ user: userToResponse(user) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Profil mentési hiba" })
  }
}

export async function uploadMyProfileImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nincs fájl" })
    }

    const fajlUt = `/uploads/${req.file.filename}`

    await pool.query(
      "UPDATE felhasznalok SET profilkep=?, utolso_modositas=NOW() WHERE id=?",
      [fajlUt, req.user.id]
    )

    const [rows] = await pool.query(
      "SELECT id, email, felhasznalonev, rang, profilkep, bio, letrehozva FROM felhasznalok WHERE id=? LIMIT 1",
      [req.user.id]
    )

    const user = rows[0]

    setAuthCookie(res, makeToken({
      id: user.id,
      email: user.email,
      username: user.felhasznalonev,
      role: user.rang,
      profilkep: user.profilkep,
      bio: user.bio,
      letrehozva: user.letrehozva
    }))

    res.json({ user: userToResponse(user) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Profilkép mentési hiba" })
  }
}