import { useEffect, useMemo, useRef, useState } from "react"
import { Navigate, useParams } from "react-router-dom"
import { api } from "../lib/api"
import { useAuth } from "../lib/auth"
import "../styles/profile.css"

const REACTIONS = [
  { key: "heart", emoji: "❤️", label: "Tetszik" },
  { key: "fire", emoji: "🔥", label: "Durva" },
  { key: "clap", emoji: "👏", label: "Szép" },
  { key: "bike", emoji: "🚴", label: "Menő tekerés" },
  { key: "wow", emoji: "😮", label: "Wow" }
]

function labelForType(tipus) {
  if (tipus === "utvonalak") return "Útvonalak"
  if (tipus === "destinaciok") return "Desztinációk"
  if (tipus === "esemenyek") return "Események"
  if (tipus === "kolcsonzok") return "Kölcsönzők"
  return tipus
}

function statusLabel(statusz) {
  if (statusz === "fuggoben") return "Függőben"
  if (statusz === "elfogadva") return "Elfogadva"
  if (statusz === "elutasitva") return "Elutasítva"
  return statusz
}

function formatJoinDate(value) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
}

function formatTime(value) {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "épp most"
  if (diffMin < 60) return `${diffMin} perce`
  if (diffHour < 24) return `${diffHour} órája`
  if (diffDay < 7) return `${diffDay} napja`

  return date.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
}

function routeForType(tipus, id) {
  return `/terkep?tipus=${encodeURIComponent(
    tipus === "utvonalak"
      ? "utvonal"
      : tipus === "destinaciok"
      ? "destinacio"
      : tipus === "esemenyek"
      ? "esemeny"
      : tipus === "kolcsonzok"
      ? "kolcsonzo"
      : tipus
  )}&id=${encodeURIComponent(id)}`
}

function getActivityIcon(tipus) {
  if (tipus === "kedvenc_hozzaadva") return "heart"
  if (tipus === "ertekeles_letrehozva") return "star"
  if (tipus === "kep_feltoltve") return "image"
  if (tipus === "felhasznalo_kovetese") return "user-plus"
  if (tipus === "statusz_poszt") return "comment-dots"
  return "bolt"
}

function getActivityText(item) {
  const username = item?.user?.username || "Valaki"

  if (item.tipus === "kedvenc_hozzaadva") {
    return {
      title: `${username} kedvencekhez adott egy elemet`,
      body: item.celTitle ? `Mentett elem: ${item.celTitle}` : "Új kedvencet mentett."
    }
  }

  if (item.tipus === "ertekeles_letrehozva") {
    const pont = item?.extra?.pontszam
    return {
      title: `${username} értékelt egy helyet`,
      body: item.celTitle
        ? `${item.celTitle}${pont ? ` • ${pont}/5 csillag` : ""}`
        : "Új értékelést írt."
    }
  }

  if (item.tipus === "kep_feltoltve") {
    return {
      title: `${username} új képet töltött fel`,
      body: item.celTitle
        ? `${item.celTitle}${item.szoveg ? ` • ${item.szoveg}` : ""}`
        : item.szoveg || "Új képet töltött fel."
    }
  }

  if (item.tipus === "felhasznalo_kovetese") {
    return {
      title: `${username} követni kezdett valakit`,
      body: item?.extra?.targetUsername
        ? `Új követés: ${item.extra.targetUsername}`
        : item.szoveg || "Új felhasználót kezdett követni."
    }
  }

  if (item.tipus === "statusz_poszt") {
    return {
      title: "",
      body: ""
    }
  }

  return {
    title: `${username} új aktivitást végzett`,
    body: item.szoveg || item.celTitle || ""
  }
}

function ReactionBar({ item, onReact }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const wrapRef = useRef(null)
  const closeTimerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (!wrapRef.current) return
      if (!wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  function openPicker() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setOpen(true)
  }

  function closePickerDelayed() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => setOpen(false), 180)
  }

  async function handleReactionClick(key) {
    if (busy) return
    try {
      setBusy(true)
      await onReact(item.id, key)
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  const reactionEntries = REACTIONS.filter(
    reaction => Number(item.reactions?.[reaction.key] || 0) > 0
  )

  return (
    <div
      className="prf-reactionWrap"
      ref={wrapRef}
      onMouseEnter={openPicker}
      onMouseLeave={closePickerDelayed}
    >
      <div
        className={`prf-reactionPicker ${open ? "open" : ""}`}
        onMouseEnter={openPicker}
        onMouseLeave={closePickerDelayed}
      >
        {REACTIONS.map(reaction => (
          <button
            key={reaction.key}
            type="button"
            className={`prf-reactionEmojiBtn ${item.myReaction === reaction.key ? "active" : ""}`}
            title={reaction.label}
            onClick={() => handleReactionClick(reaction.key)}
          >
            <span>{reaction.emoji}</span>
          </button>
        ))}
      </div>

      <div className="prf-reactionBottom">
        <button
          type="button"
          className={`prf-reactionTrigger ${item.myReaction ? "active" : ""}`}
          onClick={() => setOpen(v => !v)}
        >
          <i className="fa-regular fa-face-smile" />
          <span>
            {item.myReaction
              ? REACTIONS.find(r => r.key === item.myReaction)?.label || "Reagáltál"
              : "Reagálok"}
          </span>
        </button>

        {reactionEntries.length > 0 && (
          <div className="prf-reactionSummary">
            {reactionEntries.map(reaction => (
              <div
                key={reaction.key}
                className={`prf-reactionCount ${item.myReaction === reaction.key ? "active" : ""}`}
              >
                <span>{reaction.emoji}</span>
                <span>{item.reactions[reaction.key]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CommentSection({ item, currentUser, onCreateComment, onDeleteComment }) {
  const [text, setText] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const [open, setOpen] = useState(false)

  async function submitComment(e) {
    e.preventDefault()

    const clean = String(text || "").trim()
    if (!clean) {
      setErr("Írj kommentet.")
      return
    }

    try {
      setBusy(true)
      setErr("")
      await onCreateComment(item.id, clean)
      setText("")
      setOpen(true)
    } catch (error) {
      setErr(error.message || "Nem sikerült elküldeni.")
    } finally {
      setBusy(false)
    }
  }

  const comments = Array.isArray(item.comments) ? item.comments : []

  return (
    <div className="prf-comments">
      <div className="prf-commentsHead">
        <button
          type="button"
          className="prf-commentsToggle"
          onClick={() => setOpen(v => !v)}
        >
          <i className="fa-regular fa-comment" />
          <span>Kommentek</span>
          <span className="prf-commentsCount">{comments.length}</span>
        </button>
      </div>

      <form className="prf-commentForm" onSubmit={submitComment}>
        <div className="prf-commentInputWrap">
          {currentUser?.profilkep ? (
            <img
              src={`http://localhost:3001${currentUser.profilkep}`}
              alt=""
              className="prf-commentMeImg"
            />
          ) : (
            <div className="prf-commentMeAvatar">
              {(currentUser?.username || "U").slice(0, 1).toUpperCase()}
            </div>
          )}

          <input
            className="prf-commentInput"
            type="text"
            maxLength={400}
            placeholder="Írj kommentet..."
            value={text}
            onChange={e => setText(e.target.value)}
          />

          <button type="submit" className="prf-commentSend" disabled={busy}>
            {busy ? "..." : "Küldés"}
          </button>
        </div>

        {err && <div className="prf-commentError">{err}</div>}
      </form>

      {open && (
        <div className="prf-commentList">
          {comments.length === 0 ? (
            <div className="prf-commentEmpty">Még nincs komment.</div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="prf-commentRow">
                {comment.user?.profilkep ? (
                  <img
                    src={`http://localhost:3001${comment.user.profilkep}`}
                    alt=""
                    className="prf-commentAvatarImg"
                  />
                ) : (
                  <div className="prf-commentAvatar">
                    {(comment.user?.username || "U").slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div className="prf-commentBubble">
                  <div className="prf-commentMeta">
                    <a href={`/u/${comment.user?.username}`} className="prf-commentUsername">
                      {comment.user?.username || "Felhasználó"}
                    </a>
                    <span className="prf-commentTime">{formatTime(comment.letrehozva)}</span>
                  </div>

                  <div className="prf-commentText">{comment.szoveg}</div>
                </div>

                {comment.isOwn && (
                  <button
                    type="button"
                    className="prf-commentDelete"
                    onClick={() => onDeleteComment(comment.id)}
                    title="Komment törlése"
                  >
                    <i className="fa-solid fa-trash" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function Profile() {
  const { user, ready, logout, updateUser } = useAuth()
  const { username } = useParams()

  const [profile, setProfile] = useState(null)
  const [profileNotFound, setProfileNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  const [kedvencek, setKedvencek] = useState([])
  const [ertekelesek, setErtekelesek] = useState([])
  const [kepek, setKepek] = useState([])
  const [aktivitasok, setAktivitasok] = useState([])

  const [adatok, setAdatok] = useState({
    utvonalak: [],
    destinaciok: [],
    esemenyek: [],
    kolcsonzok: []
  })

  const [activeTab, setActiveTab] = useState("kedvencek")

  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editBio, setEditBio] = useState("")
  const [editFile, setEditFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState("")
  const [saveErr, setSaveErr] = useState("")

  const [editingRatingId, setEditingRatingId] = useState(null)
  const [editingPontszam, setEditingPontszam] = useState(0)
  const [editingSzoveg, setEditingSzoveg] = useState("")
  const [ratingMsg, setRatingMsg] = useState("")
  const [ratingErr, setRatingErr] = useState("")

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)

  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const [followersOpen, setFollowersOpen] = useState(false)
  const [followingOpen, setFollowingOpen] = useState(false)
  const [followersList, setFollowersList] = useState([])
  const [followingList, setFollowingList] = useState([])
  const [followListLoading, setFollowListLoading] = useState(false)

  const [loginModalOpen, setLoginModalOpen] = useState(false)

  const isOwnProfile = Boolean(user && username && user.username === username)

  useEffect(() => {
    if (!username || !ready) return

    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setProfileNotFound(false)
        setProfile(null)
        setKedvencek([])
        setErtekelesek([])
        setKepek([])
        setAktivitasok([])
        setFollowersCount(0)
        setFollowingCount(0)
        setIsFollowing(false)

        const [utvRes, destRes, eseRes, kolRes] = await Promise.all([
          api.utvonalak(),
          api.destinaciok(),
          api.esemenyek(),
          api.kolcsonzok()
        ])

        if (cancelled) return

        setAdatok({
          utvonalak: Array.isArray(utvRes) ? utvRes : [],
          destinaciok: Array.isArray(destRes) ? destRes : [],
          esemenyek: Array.isArray(eseRes) ? eseRes : [],
          kolcsonzok: Array.isArray(kolRes) ? kolRes : []
        })

        if (isOwnProfile && user) {
          const [kedvRes, ertekRes, kepRes, followersRes, followingRes, feedRes] = await Promise.all([
            api.kedvencek(),
            api.sajatErtekelesek(),
            api.sajatKepek(),
            api.followers(username).catch(() => []),
            api.following(username).catch(() => []),
            api.userFeed(username).catch(() => [])
          ])

          if (cancelled) return

          setProfile(user)
          setKedvencek(Array.isArray(kedvRes) ? kedvRes : [])
          setErtekelesek(Array.isArray(ertekRes) ? ertekRes : [])
          setKepek(Array.isArray(kepRes) ? kepRes : [])
          setAktivitasok(Array.isArray(feedRes) ? feedRes : [])
          setFollowersCount(Array.isArray(followersRes) ? followersRes.length : 0)
          setFollowingCount(Array.isArray(followingRes) ? followingRes.length : 0)
          setIsFollowing(false)
        } else {
          const publicRes = await api.publicProfile(username)
          const feedRes = await api.userFeed(username).catch(() => [])

          if (cancelled) return

          setProfile(publicRes?.user || null)
          setKedvencek(Array.isArray(publicRes?.kedvencek) ? publicRes.kedvencek : [])
          setErtekelesek(Array.isArray(publicRes?.ertekelesek) ? publicRes.ertekelesek : [])
          setKepek(Array.isArray(publicRes?.kepek) ? publicRes.kepek : [])
          setAktivitasok(Array.isArray(feedRes) ? feedRes : [])
          setFollowersCount(Number(publicRes?.user?.followersCount || 0))
          setFollowingCount(Number(publicRes?.user?.followingCount || 0))
          setIsFollowing(Boolean(publicRes?.user?.following))
        }
      } catch (err) {
        if (!cancelled) {
          const msg = String(err?.message || "").toLowerCase()
          if (msg.includes("404") || msg.includes("nem található")) {
            setProfileNotFound(true)
          }

          setProfile(null)
          setKedvencek([])
          setErtekelesek([])
          setKepek([])
          setAktivitasok([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [username, isOwnProfile, user, ready])

  useEffect(() => {
    if (!profile) return
    setEditName(profile.username || "")
    setEditBio(profile.bio || "")
  }, [profile])

  function resolveItem(cel_tipus, cel_id) {
    const list = adatok[cel_tipus] || []
    const found = list.find(x => String(x.id) === String(cel_id))

    if (!found) {
      return {
        title: `${labelForType(cel_tipus)} #${cel_id}`,
        description: "",
        meta: ""
      }
    }

    return {
      title: found.cim || found.nev || `${labelForType(cel_tipus)} #${cel_id}`,
      description: found.leiras || found.cim || "",
      meta: found.hossz || found.datum || found.tipus || ""
    }
  }

  const resolvedFavorites = useMemo(() => {
    return kedvencek.map(k => ({ ...k, ...resolveItem(k.cel_tipus, k.cel_id) }))
  }, [kedvencek, adatok])

  const resolvedRatings = useMemo(() => {
    return ertekelesek.map(e => ({ ...e, ...resolveItem(e.cel_tipus, e.cel_id) }))
  }, [ertekelesek, adatok])

  const resolvedImages = useMemo(() => {
    return kepek.map(k => ({ ...k, ...resolveItem(k.cel_tipus, k.cel_id) }))
  }, [kepek, adatok])

  const renderedActivities = useMemo(() => {
    return aktivitasok.map(item => ({
      ...item,
      icon: getActivityIcon(item.tipus),
      activity: getActivityText(item)
    }))
  }, [aktivitasok])

  const grouped = useMemo(() => {
    return {
      utvonalak: resolvedFavorites.filter(x => x.cel_tipus === "utvonalak"),
      destinaciok: resolvedFavorites.filter(x => x.cel_tipus === "destinaciok"),
      esemenyek: resolvedFavorites.filter(x => x.cel_tipus === "esemenyek"),
      kolcsonzok: resolvedFavorites.filter(x => x.cel_tipus === "kolcsonzok")
    }
  }, [resolvedFavorites])

  async function refreshUserFeed() {
    const feedRes = await api.userFeed(username)
    setAktivitasok(Array.isArray(feedRes) ? feedRes : [])
  }

  async function submitProfileEdit(e) {
    e.preventDefault()
    setSaving(true)
    setSaveErr("")
    setSaveMsg("")

    try {
      let res = await api.profilMentese(editName, editBio)
      let updatedUser = res.user

      if (editFile) {
        const picRes = await api.profilkepFeltoltes(editFile)
        updatedUser = picRes.user
      }

      setProfile(updatedUser)
      updateUser(updatedUser)
      setEditName(updatedUser.username || "")
      setEditBio(updatedUser.bio || "")
      setEditFile(null)
      setSaveMsg("Profil mentve")

      setTimeout(() => {
        setEditOpen(false)
        setSaveMsg("")
      }, 500)
    } catch (err) {
      setSaveErr(err.message || "Mentési hiba")
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveRating(id) {
    if (!editingPontszam) {
      setRatingErr("Adj meg csillagot.")
      return
    }

    try {
      setRatingErr("")
      setRatingMsg("")
      await api.updateSajatErtekeles(id, editingPontszam, editingSzoveg)

      const uj = await api.sajatErtekelesek()
      setErtekelesek(Array.isArray(uj) ? uj : [])

      setEditingRatingId(null)
      setEditingPontszam(0)
      setEditingSzoveg("")
      setRatingMsg("Értékelés módosítva. Újra jóváhagyásra vár.")
    } catch (err) {
      setRatingErr(err.message || "Nem sikerült menteni.")
    }
  }

  async function handleDeleteRating(id) {
    try {
      setRatingErr("")
      setRatingMsg("")
      await api.deleteSajatErtekeles(id)

      const uj = await api.sajatErtekelesek()
      setErtekelesek(Array.isArray(uj) ? uj : [])

      if (editingRatingId === id) {
        setEditingRatingId(null)
        setEditingPontszam(0)
        setEditingSzoveg("")
      }

      setDeleteConfirmOpen(false)
      setDeleteTargetId(null)
      setRatingMsg("Értékelés törölve.")
    } catch (err) {
      setRatingErr(err.message || "Nem sikerült törölni.")
    }
  }

  async function handleToggleFollow() {
    if (!user) {
      setLoginModalOpen(true)
      return
    }

    if (!username || isOwnProfile) return

    try {
      setFollowLoading(true)
      const res = await api.followToggle(username)
      const newFollowing = Boolean(res?.following)
      setIsFollowing(newFollowing)
      setFollowersCount(prev => prev + (newFollowing ? 1 : -1))
    } catch (err) {
      console.error(err)
    } finally {
      setFollowLoading(false)
    }
  }

  async function openFollowersList() {
    if (!username) return
    try {
      setFollowListLoading(true)
      setFollowersOpen(true)
      const rows = await api.followers(username)
      setFollowersList(Array.isArray(rows) ? rows : [])
    } catch {
      setFollowersList([])
    } finally {
      setFollowListLoading(false)
    }
  }

  async function openFollowingList() {
    if (!username) return
    try {
      setFollowListLoading(true)
      setFollowingOpen(true)
      const rows = await api.following(username)
      setFollowingList(Array.isArray(rows) ? rows : [])
    } catch {
      setFollowingList([])
    } finally {
      setFollowListLoading(false)
    }
  }

  async function handleReact(aktivitasId, reakcio) {
    await api.reactToActivity(aktivitasId, reakcio)
    await refreshUserFeed()
  }

  async function handleCreateComment(aktivitasId, szoveg) {
    await api.createComment(aktivitasId, szoveg)
    await refreshUserFeed()
  }

  async function handleDeleteComment(commentId) {
    await api.deleteComment(commentId)
    await refreshUserFeed()
  }

  if (!username) return <Navigate to="/" replace />
  if (!ready) return null
  if (isOwnProfile && !user) return <Navigate to="/login" replace />

  return (
    <div className="prf">
      <div className="prf-bg">
        <div className="prf-blob a" />
        <div className="prf-blob b" />
        <div className="prf-grid" />
      </div>

      <div className="prf-shell">
        <div className="prf-topbar">
          <a href="/" className="prf-brand">
            <div className="prf-mark"><i className="fa-solid fa-bicycle" /></div>
            <div>
              <div className="prf-brandName">Két Keréken</div>
              <div className="prf-brandSub">{isOwnProfile ? "Profil" : "Nyilvános profil"}</div>
            </div>
          </a>

          <div className="prf-topActions">
            <a href="/terkep" className="prf-btn ghost">
              <i className="fa-solid fa-map" />
              <span>Térkép</span>
            </a>

            {user ? (
              <button className="prf-btn primary" onClick={logout}>
                <i className="fa-solid fa-right-from-bracket" />
                <span>Kijelentkezés</span>
              </button>
            ) : (
              <a href="/login" className="prf-btn primary">
                <i className="fa-solid fa-right-to-bracket" />
                <span>Bejelentkezés</span>
              </a>
            )}
          </div>
        </div>

        {loading && (
          <div className="prf-main">
            <div className="prf-loading">
              <i className="fa-solid fa-spinner fa-spin" />
              <span>Betöltés...</span>
            </div>
          </div>
        )}

        {!loading && profileNotFound && (
          <div className="prf-main">
            <div className="prf-empty">
              <i className="fa-solid fa-user-xmark" />
              <h3>Nincs ilyen profil</h3>
              <p>Ezzel a névvel nem található felhasználói profil.</p>
              <a href="/" className="prf-btn primary">
                <i className="fa-solid fa-house" />
                <span>Vissza a főoldalra</span>
              </a>
            </div>
          </div>
        )}

        {!loading && !profileNotFound && profile && (
          <div className="prf-layout">
            <aside className="prf-sidebar">
              <div className="prf-userCard">
                {profile.profilkep ? (
                  <img
                    src={`http://localhost:3001${profile.profilkep}`}
                    alt=""
                    className="prf-avatarImg"
                  />
                ) : (
                  <div className="prf-avatar">
                    {(profile.username || "U").slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div className="prf-userName">{profile.username || "Felhasználó"}</div>

                {isOwnProfile ? (
                  <button className="prf-editLink" onClick={() => setEditOpen(true)}>
                    Profil szerkesztése
                  </button>
                ) : (
                  <button
                    className={`prf-followBtn ${isFollowing ? "following" : ""}`}
                    onClick={handleToggleFollow}
                    disabled={followLoading}
                  >
                    <i className={`fa-solid ${isFollowing ? "fa-user-check" : "fa-user-plus"}`} />
                    <span>{followLoading ? "Betöltés..." : isFollowing ? "Kikövetés" : "Követés"}</span>
                  </button>
                )}

                <div className="prf-role">
                  <i className="fa-solid fa-shield-halved" />
                  <span>{profile.role === "admin" ? "Admin" : "Felhasználó"}</span>
                </div>

                <div className="prf-joined">
                  <i className="fa-solid fa-calendar-days" />
                  <span>Csatlakozott: {formatJoinDate(profile.letrehozva)}</span>
                </div>

                {profile.bio && <div className="prf-bio">{profile.bio}</div>}
              </div>

              <div className="prf-followStats">
                <button className="prf-followStatCard" onClick={openFollowersList}>
                  <div className="prf-followStatNum">{followersCount}</div>
                  <div className="prf-followStatLabel">követő</div>
                </button>

                <button className="prf-followStatCard" onClick={openFollowingList}>
                  <div className="prf-followStatNum">{followingCount}</div>
                  <div className="prf-followStatLabel">követés</div>
                </button>
              </div>

              <div className="prf-stats">
                <div className="prf-stat">
                  <div className="prf-statNum">{resolvedFavorites.length}</div>
                  <div className="prf-statLabel">kedvenc</div>
                </div>
                <div className="prf-stat">
                  <div className="prf-statNum">{resolvedRatings.length}</div>
                  <div className="prf-statLabel">értékelés</div>
                </div>
                <div className="prf-stat">
                  <div className="prf-statNum">{resolvedImages.length}</div>
                  <div className="prf-statLabel">kép</div>
                </div>
              </div>
            </aside>

            <main className="prf-main">
              <div className="prf-head">
                <div>
                  <div className="prf-badge">
                    <span className="dot" />
                    <span>{isOwnProfile ? "Saját profil" : "Nyilvános profil"}</span>
                  </div>
                  <h1>{isOwnProfile ? "Profilod és aktivitásod" : `${profile.username} profilja`}</h1>
                  <p>
                    {isOwnProfile
                      ? "Itt látod az elmentett elemeket, az értékeléseidet, a feltöltött képeidet és az aktivitásaidat."
                      : "Itt látod a nyilvános kedvenceket, értékeléseket, képeket és aktivitásokat."}
                  </p>
                </div>
              </div>

              <div className="prf-tabs">
                <button className={`prf-tabBtn ${activeTab === "kedvencek" ? "active" : ""}`} onClick={() => setActiveTab("kedvencek")}>Kedvencek</button>
                <button className={`prf-tabBtn ${activeTab === "ertekelesek" ? "active" : ""}`} onClick={() => setActiveTab("ertekelesek")}>Értékelések</button>
                <button className={`prf-tabBtn ${activeTab === "kepek" ? "active" : ""}`} onClick={() => setActiveTab("kepek")}>Képek</button>
                <button className={`prf-tabBtn ${activeTab === "aktivitas" ? "active" : ""}`} onClick={() => setActiveTab("aktivitas")}>Aktivitás feed</button>
              </div>

              {activeTab === "kedvencek" && (
                resolvedFavorites.length === 0 ? (
                  <div className="prf-empty">
                    <i className="fa-solid fa-heart-crack" />
                    <h3>Nincsenek kedvencek</h3>
                    <p>{isOwnProfile ? "Jelölj be elemeket a térképen, és itt megjelennek." : "Ennek a felhasználónak még nincs nyilvános kedvence."}</p>
                  </div>
                ) : (
                  <div className="prf-groups">
                    {Object.entries(grouped).map(([type, items]) => {
                      if (!items.length) return null
                      return (
                        <section key={type} className="prf-section">
                          <div className="prf-sectionHead">
                            <h2>{labelForType(type)}</h2>
                            <span>{items.length} db</span>
                          </div>
                          <div className="prf-cards">
                            {items.map(item => (
                              <div key={item.id} className="prf-card">
                                <div className="prf-cardTop">
                                  <div className="prf-cardType">{labelForType(item.cel_tipus)}</div>
                                  <div className="prf-cardId">#{item.cel_id}</div>
                                </div>
                                <div className="prf-cardTitle">{item.title}</div>
                                {item.description && <div className="prf-cardText">{item.description}</div>}
                                <div className="prf-cardBottom">
                                  <span className="prf-cardMeta">{item.meta || "Mentett elem"}</span>
                                  <a href={routeForType(item.cel_tipus, item.cel_id)} className="prf-linkBtn">
                                    <span>Megnyitás</span>
                                    <i className="fa-solid fa-arrow-right" />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )
                    })}
                  </div>
                )
              )}

              {activeTab === "ertekelesek" && (
                resolvedRatings.length === 0 ? (
                  <div className="prf-empty">
                    <i className="fa-solid fa-star-half-stroke" />
                    <h3>Nincsenek értékelések</h3>
                    <p>{isOwnProfile ? "Ha értékelsz valamit a térképen, itt meg fog jelenni." : "Ennek a felhasználónak még nincs nyilvános értékelése."}</p>
                  </div>
                ) : (
                  <section className="prf-section">
                    <div className="prf-sectionHead">
                      <h2>{isOwnProfile ? "Saját értékelések" : "Értékelések"}</h2>
                      <span>{resolvedRatings.length} db</span>
                    </div>

                    {isOwnProfile && ratingErr && <div className="prf-formMsg err" style={{ marginBottom: 12 }}>{ratingErr}</div>}
                    {isOwnProfile && ratingMsg && <div className="prf-formMsg ok" style={{ marginBottom: 12 }}>{ratingMsg}</div>}

                    <div className="prf-cards">
                      {resolvedRatings.map(e => (
                        <div key={e.id} className="prf-card">
                          <div className="prf-cardTop">
                            <div className="prf-cardType">{labelForType(e.cel_tipus)}</div>
                            {isOwnProfile && <div className={`prf-status prf-status-${e.statusz}`}>{statusLabel(e.statusz)}</div>}
                          </div>

                          {editingRatingId === e.id ? (
                            <>
                              <div className="prf-cardTitle">{e.title}</div>

                              <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 10 }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setEditingPontszam(i)}
                                    style={{
                                      border: "1px solid rgba(255,255,255,.10)",
                                      background: "rgba(255,255,255,.06)",
                                      color: i <= editingPontszam ? "#ffd54a" : "rgba(255,255,255,.45)",
                                      borderRadius: 10,
                                      width: 38,
                                      height: 38,
                                      cursor: "pointer"
                                    }}
                                  >
                                    <i className="fa-solid fa-star" />
                                  </button>
                                ))}
                              </div>

                              <textarea
                                className="prf-textarea"
                                rows={4}
                                value={editingSzoveg}
                                onChange={ev => setEditingSzoveg(ev.target.value)}
                              />

                              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                                <button className="prf-btn primary" onClick={() => handleSaveRating(e.id)}>Mentés</button>
                                <button className="prf-btn ghost" onClick={() => {
                                  setEditingRatingId(null)
                                  setEditingPontszam(0)
                                  setEditingSzoveg("")
                                }}>Mégse</button>
                              </div>

                              <div className="prf-cardText" style={{ marginTop: 10 }}>
                                Módosítás után újra jóváhagyásra vár.
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="prf-cardTitle">{e.title}</div>
                              <div className="prf-cardText">⭐ {e.pontszam} / 5</div>
                              {e.szoveg && <div className="prf-cardText">{e.szoveg}</div>}

                              {isOwnProfile && e.elutasitas_indok && (
                                <div className="prf-formMsg err" style={{ marginTop: 12 }}>
                                  Elutasítás indoka: {e.elutasitas_indok}
                                </div>
                              )}

                              {isOwnProfile && (
                                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                                  <button
                                    className="prf-btn ghost"
                                    onClick={() => {
                                      setEditingRatingId(e.id)
                                      setEditingPontszam(Number(e.pontszam || 0))
                                      setEditingSzoveg(e.szoveg || "")
                                    }}
                                  >
                                    Szerkesztés
                                  </button>

                                  <button
                                    className="prf-btn ghost"
                                    onClick={() => {
                                      setDeleteTargetId(e.id)
                                      setDeleteConfirmOpen(true)
                                    }}
                                  >
                                    Törlés
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )
              )}

              {activeTab === "kepek" && (
                resolvedImages.length === 0 ? (
                  <div className="prf-empty">
                    <i className="fa-regular fa-image" />
                    <h3>Nincsenek képek</h3>
                    <p>{isOwnProfile ? "Ha feltöltesz képet, itt fog megjelenni." : "Ennek a felhasználónak még nincs nyilvános képe."}</p>
                  </div>
                ) : (
                  <section className="prf-section">
                    <div className="prf-sectionHead">
                      <h2>{isOwnProfile ? "Feltöltött képek" : "Képek"}</h2>
                      <span>{resolvedImages.length} db</span>
                    </div>

                    <div className="prf-cards">
                      {resolvedImages.map(k => (
                        <div key={k.id} className="prf-card">
                          <div className="prf-cardTop">
                            <div className="prf-cardType">{labelForType(k.cel_tipus)}</div>
                            {isOwnProfile && <div className={`prf-status prf-status-${k.statusz}`}>{statusLabel(k.statusz)}</div>}
                          </div>

                          <div className="prf-cardTitle">{k.title}</div>

                          <img
                            src={`http://localhost:3001${k.fajl_utvonal}`}
                            alt=""
                            className="prf-image"
                          />

                          {k.leiras && <div className="prf-cardText">{k.leiras}</div>}

                          {isOwnProfile && k.elutasitas_indok && (
                            <div className="prf-formMsg err" style={{ marginTop: 12 }}>
                              Elutasítás indoka: {k.elutasitas_indok}
                            </div>
                          )}

                          <div className="prf-cardBottom">
                            <span className="prf-cardMeta">{k.meta || labelForType(k.cel_tipus)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )
              )}

              {activeTab === "aktivitas" && (
                <section className="prf-section">
                  <div className="prf-sectionHead">
                    <h2>Aktivitás feed</h2>
                    <span>{renderedActivities.length} db</span>
                  </div>

                  {renderedActivities.length === 0 ? (
                    <div className="prf-empty">
                      <i className="fa-solid fa-wave-square" />
                      <h3>Még nincs aktivitás</h3>
                      <p>{isOwnProfile ? "Ha kedvelsz, értékelsz, képet töltesz fel vagy posztolsz, itt fog megjelenni." : "Ennek a felhasználónak még nincs nyilvános aktivitása."}</p>
                    </div>
                  ) : (
                    <div className="prf-activityList">
                      {renderedActivities.map(item => {
                        const isStatusPost = item.tipus === "statusz_poszt"

                        return (
                          <article
                            key={item.id}
                            className={`prf-activityCard ${isStatusPost ? "prf-activityCard-status" : ""}`}
                          >
                            <div className="prf-activityTop">
                              <div className="prf-activityUser">
                                {item.user?.profilkep ? (
                                  <img
                                    src={`http://localhost:3001${item.user.profilkep}`}
                                    alt=""
                                    className="prf-activityAvatarImg"
                                  />
                                ) : (
                                  <div className="prf-activityAvatar">
                                    {(item.user?.username || "U").slice(0, 1).toUpperCase()}
                                  </div>
                                )}

                                <div className="prf-activityUserTexts">
                                  <a href={`/u/${item.user?.username}`} className="prf-activityUsername">
                                    {item.user?.username || "Felhasználó"}
                                  </a>
                                  <div className="prf-activityTime">{formatTime(item.letrehozva)}</div>
                                </div>
                              </div>

                              {!isStatusPost && (
                                <div className={`prf-activityType prf-activity-type-${item.tipus}`}>
                                  <i className={`fa-solid fa-${item.icon}`} />
                                </div>
                              )}
                            </div>

                            {isStatusPost ? (
                              item.szoveg && <div className="prf-activityStatusPostBox">{item.szoveg}</div>
                            ) : (
                              <>
                                {item.activity.title && <div className="prf-activityTitle">{item.activity.title}</div>}
                                {item.activity.body && <div className="prf-activityText">{item.activity.body}</div>}
                              </>
                            )}

                            {(item.cel_tipus && item.cel_id) && !isStatusPost && (
                              <div className="prf-activityBottom">
                                <a href={routeForType(item.cel_tipus, item.cel_id)} className="prf-linkBtn">
                                  <span>Megnyitás</span>
                                  <i className="fa-solid fa-arrow-right" />
                                </a>
                              </div>
                            )}

                            <ReactionBar item={item} onReact={handleReact} />

                            <CommentSection
                              item={item}
                              currentUser={user}
                              onCreateComment={handleCreateComment}
                              onDeleteComment={handleDeleteComment}
                            />
                          </article>
                        )
                      })}
                    </div>
                  )}
                </section>
              )}
            </main>
          </div>
        )}
      </div>

      {isOwnProfile && !profileNotFound && profile && (
        <div className={"prf-modal " + (editOpen ? "open" : "")}>
          <div className="prf-modalOverlay" onClick={() => setEditOpen(false)} />
          <div className="prf-modalCard">
            <div className="prf-modalHead">
              <div className="prf-modalTitle">Profil szerkesztése</div>
              <button className="prf-modalClose" onClick={() => setEditOpen(false)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form className="prf-form" onSubmit={submitProfileEdit}>
              <label className="prf-field">
                <div className="prf-label">Felhasználónév</div>
                <input className="prf-input" value={editName} onChange={e => setEditName(e.target.value)} />
              </label>

              <label className="prf-field">
                <div className="prf-label">Bio</div>
                <textarea className="prf-textarea" rows={5} value={editBio} onChange={e => setEditBio(e.target.value)} />
              </label>

              <label className="prf-field">
                <div className="prf-label">Profilkép</div>
                <input className="prf-file" type="file" accept="image/*" onChange={e => setEditFile(e.target.files?.[0] || null)} />
              </label>

              {saveErr && <div className="prf-formMsg err">{saveErr}</div>}
              {saveMsg && <div className="prf-formMsg ok">{saveMsg}</div>}

              <div className="prf-formActions">
                <button type="button" className="prf-btn ghost" onClick={() => setEditOpen(false)}>Mégse</button>
                <button type="submit" className="prf-btn primary" disabled={saving}>{saving ? "Mentés..." : "Mentés"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmOpen && (
        <div className="prf-modal open">
          <div className="prf-modalOverlay" onClick={() => {
            setDeleteConfirmOpen(false)
            setDeleteTargetId(null)
          }} />

          <div className="prf-modalCard">
            <div className="prf-modalHead">
              <div className="prf-modalTitle">Értékelés törlése</div>
              <button className="prf-modalClose" onClick={() => {
                setDeleteConfirmOpen(false)
                setDeleteTargetId(null)
              }}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div style={{ color: "rgba(255,255,255,.82)", lineHeight: 1.6 }}>
              Biztosan törölni akarod ezt az értékelést?
            </div>

            <div className="prf-formActions" style={{ marginTop: 20 }}>
              <button type="button" className="prf-btn ghost" onClick={() => {
                setDeleteConfirmOpen(false)
                setDeleteTargetId(null)
              }}>
                Mégse
              </button>

              <button type="button" className="prf-btn primary" onClick={() => handleDeleteRating(deleteTargetId)}>
                Igen, törlöm
              </button>
            </div>
          </div>
        </div>
      )}

      {followersOpen && (
        <div className="prf-modal open">
          <div className="prf-modalOverlay" onClick={() => setFollowersOpen(false)} />
          <div className="prf-modalCard prf-followModalCard">
            <div className="prf-modalHead">
              <div className="prf-modalTitle">Követők</div>
              <button className="prf-modalClose" onClick={() => setFollowersOpen(false)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {followListLoading ? (
              <div className="prf-followListState">Betöltés...</div>
            ) : followersList.length === 0 ? (
              <div className="prf-followListState">Még nincs követő.</div>
            ) : (
              <div className="prf-followList">
                {followersList.map(item => (
                  <a key={item.id} href={`/u/${item.username}`} className="prf-followRow">
                    {item.profilkep ? (
                      <img src={`http://localhost:3001${item.profilkep}`} alt="" className="prf-followAvatarImg" />
                    ) : (
                      <div className="prf-followAvatar">
                        {(item.username || "U").slice(0, 1).toUpperCase()}
                      </div>
                    )}

                    <div className="prf-followTexts">
                      <div className="prf-followName">{item.username}</div>
                      {item.bio && <div className="prf-followBio">{item.bio}</div>}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {followingOpen && (
        <div className="prf-modal open">
          <div className="prf-modalOverlay" onClick={() => setFollowingOpen(false)} />
          <div className="prf-modalCard prf-followModalCard">
            <div className="prf-modalHead">
              <div className="prf-modalTitle">Követések</div>
              <button className="prf-modalClose" onClick={() => setFollowingOpen(false)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {followListLoading ? (
              <div className="prf-followListState">Betöltés...</div>
            ) : followingList.length === 0 ? (
              <div className="prf-followListState">Még nem követ senkit.</div>
            ) : (
              <div className="prf-followList">
                {followingList.map(item => (
                  <a key={item.id} href={`/u/${item.username}`} className="prf-followRow">
                    {item.profilkep ? (
                      <img src={`http://localhost:3001${item.profilkep}`} alt="" className="prf-followAvatarImg" />
                    ) : (
                      <div className="prf-followAvatar">
                        {(item.username || "U").slice(0, 1).toUpperCase()}
                      </div>
                    )}

                    <div className="prf-followTexts">
                      <div className="prf-followName">{item.username}</div>
                      {item.bio && <div className="prf-followBio">{item.bio}</div>}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {loginModalOpen && (
        <div className="prf-modal open">
          <div className="prf-modalOverlay" onClick={() => setLoginModalOpen(false)} />
          <div className="prf-modalCard">
            <div className="prf-modalHead">
              <div className="prf-modalTitle">Ehhez be kell jelentkezni</div>
              <button className="prf-modalClose" onClick={() => setLoginModalOpen(false)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div style={{ color: "rgba(255,255,255,.82)", lineHeight: 1.6 }}>
              A követés használatához először jelentkezz be a fiókodba.
            </div>

            <div className="prf-formActions" style={{ marginTop: 20 }}>
              <button type="button" className="prf-btn ghost" onClick={() => setLoginModalOpen(false)}>Mégse</button>
              <a href="/login" className="prf-btn primary">Bejelentkezés</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}