import { useEffect, useMemo, useRef, useState } from "react"
import { Navigate, Link } from "react-router-dom"
import { api } from "../lib/api"
import { useAuth } from "../lib/auth"
import "../styles/feed.css"

const REACTIONS = [
  { key: "heart", emoji: "❤️", label: "Tetszik" },
  { key: "fire", emoji: "🔥", label: "Durva" },
  { key: "clap", emoji: "👏", label: "Szép" },
  { key: "bike", emoji: "🚴", label: "Menő tekerés" },
  { key: "wow", emoji: "😮", label: "Wow" }
]

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

function targetLink(cel_tipus, cel_id) {
  const tipus =
    cel_tipus === "utvonalak"
      ? "utvonal"
      : cel_tipus === "destinaciok"
      ? "destinacio"
      : cel_tipus === "esemenyek"
      ? "esemeny"
      : cel_tipus === "kolcsonzok"
      ? "kolcsonzo"
      : ""

  if (!tipus || !cel_id) return "/terkep"
  return `/terkep?tipus=${encodeURIComponent(tipus)}&id=${encodeURIComponent(cel_id)}`
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
      className="feed-reactionWrap"
      ref={wrapRef}
      onMouseEnter={openPicker}
      onMouseLeave={closePickerDelayed}
    >
      <div
        className={`feed-reactionPicker ${open ? "open" : ""}`}
        onMouseEnter={openPicker}
        onMouseLeave={closePickerDelayed}
      >
        {REACTIONS.map(reaction => (
          <button
            key={reaction.key}
            type="button"
            className={`feed-reactionEmojiBtn ${item.myReaction === reaction.key ? "active" : ""}`}
            title={reaction.label}
            onClick={() => handleReactionClick(reaction.key)}
          >
            <span>{reaction.emoji}</span>
          </button>
        ))}
      </div>

      <div className="feed-reactionBottom">
        <button
          type="button"
          className={`feed-reactionTrigger ${item.myReaction ? "active" : ""}`}
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
          <div className="feed-reactionSummary">
            {reactionEntries.map(reaction => (
              <div
                key={reaction.key}
                className={`feed-reactionCount ${item.myReaction === reaction.key ? "active" : ""}`}
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
    <div className="feed-comments">
      <div className="feed-commentsHead">
        <button
          type="button"
          className="feed-commentsToggle"
          onClick={() => setOpen(v => !v)}
        >
          <i className="fa-regular fa-comment" />
          <span>Kommentek</span>
          <span className="feed-commentsCount">{comments.length}</span>
        </button>
      </div>

      <form className="feed-commentForm" onSubmit={submitComment}>
        <div className="feed-commentInputWrap">
          {currentUser?.profilkep ? (
            <img
              src={`http://localhost:3001${currentUser.profilkep}`}
              alt=""
              className="feed-commentMeImg"
            />
          ) : (
            <div className="feed-commentMeAvatar">
              {(currentUser?.username || "U").slice(0, 1).toUpperCase()}
            </div>
          )}

          <input
            className="feed-commentInput"
            type="text"
            maxLength={400}
            placeholder="Írj kommentet..."
            value={text}
            onChange={e => setText(e.target.value)}
          />

          <button type="submit" className="feed-commentSend" disabled={busy}>
            {busy ? "..." : "Küldés"}
          </button>
        </div>

        {err && <div className="feed-commentError">{err}</div>}
      </form>

      {open && (
        <div className="feed-commentList">
          {comments.length === 0 ? (
            <div className="feed-commentEmpty">Még nincs komment.</div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="feed-commentRow">
                {comment.user?.profilkep ? (
                  <img
                    src={`http://localhost:3001${comment.user.profilkep}`}
                    alt=""
                    className="feed-commentAvatarImg"
                  />
                ) : (
                  <div className="feed-commentAvatar">
                    {(comment.user?.username || "U").slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div className="feed-commentBubble">
                  <div className="feed-commentMeta">
                    <a href={`/u/${comment.user?.username}`} className="feed-commentUsername">
                      {comment.user?.username || "Felhasználó"}
                    </a>
                    <span className="feed-commentTime">{formatTime(comment.letrehozva)}</span>
                  </div>

                  <div className="feed-commentText">{comment.szoveg}</div>
                </div>

                {comment.isOwn && (
                  <button
                    type="button"
                    className="feed-commentDelete"
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

export default function Feed() {
  const { user, ready, logout } = useAuth()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const [statusText, setStatusText] = useState("")
  const [posting, setPosting] = useState(false)
  const [postMsg, setPostMsg] = useState("")
  const [postErr, setPostErr] = useState("")

  useEffect(() => {
    if (!ready || !user) return

    let cancelled = false

    async function loadFeed() {
      try {
        setLoading(true)
        const res = await api.feed()
        if (!cancelled) setItems(Array.isArray(res) ? res : [])
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadFeed()

    return () => {
      cancelled = true
    }
  }, [ready, user])

  async function refreshFeed() {
    const res = await api.feed()
    setItems(Array.isArray(res) ? res : [])
  }

  async function handlePostStatus(e) {
    e.preventDefault()

    const clean = String(statusText || "").trim()
    if (!clean) {
      setPostErr("Írj valamit.")
      return
    }

    try {
      setPosting(true)
      setPostErr("")
      setPostMsg("")
      await api.createStatusPost(clean)
      await refreshFeed()
      setStatusText("")
      setPostMsg("Bejegyzés megosztva.")
    } catch (err) {
      setPostErr(err.message || "Nem sikerült megosztani.")
    } finally {
      setPosting(false)
    }
  }

  async function handleReact(aktivitasId, reakcio) {
    await api.reactToActivity(aktivitasId, reakcio)
    await refreshFeed()
  }

  async function handleCreateComment(aktivitasId, szoveg) {
    await api.createComment(aktivitasId, szoveg)
    await refreshFeed()
  }

  async function handleDeleteComment(commentId) {
    await api.deleteComment(commentId)
    await refreshFeed()
  }

  const renderedItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      activity: getActivityText(item),
      icon: getActivityIcon(item.tipus)
    }))
  }, [items])

  if (!ready) return null
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="feed-page">
      <div className="feed-bg">
        <div className="feed-blob a" />
        <div className="feed-blob b" />
        <div className="feed-grid" />
      </div>

      <div className="feed-shell">
        <div className="feed-topbar">
          <a href="/" className="feed-brand">
            <div className="feed-mark">
              <i className="fa-solid fa-bicycle" />
            </div>
            <div>
              <div className="feed-brandName">Két Keréken</div>
              <div className="feed-brandSub">Közösségi feed</div>
            </div>
          </a>

          <div className="feed-topActions">
            <a href="/terkep" className="feed-btn ghost">
              <i className="fa-solid fa-map" />
              <span>Térkép</span>
            </a>

            <a href={`/u/${user.username}`} className="feed-btn ghost">
              <i className="fa-solid fa-user" />
              <span>Profil</span>
            </a>

            <button className="feed-btn primary" onClick={logout}>
              <i className="fa-solid fa-right-from-bracket" />
              <span>Kijelentkezés</span>
            </button>
          </div>
        </div>

        <div className="feed-layout">
          <aside className="feed-sidebar">
            <div className="feed-userCard">
              {user.profilkep ? (
                <img
                  src={`http://localhost:3001${user.profilkep}`}
                  alt=""
                  className="feed-avatarImg"
                />
              ) : (
                <div className="feed-avatar">
                  {(user.username || "U").slice(0, 1).toUpperCase()}
                </div>
              )}

              <div className="feed-userName">{user.username}</div>
              <div className="feed-userSub">Bringás közösségi feed</div>

              <div className="feed-userLinks">
                <Link to={`/u/${user.username}`} className="feed-miniBtn">
                  Saját profil
                </Link>
                <Link to="/terkep" className="feed-miniBtn">
                  Térkép megnyitása
                </Link>
              </div>
            </div>

            <div className="feed-sideCard">
              <div className="feed-sideTitle">Mit látsz itt?</div>
              <div className="feed-sideText">
                Azoknak a felhasználóknak az aktivitásait látod, akiket követsz,
                valamint a saját bejegyzéseidet és műveleteidet.
              </div>
            </div>
          </aside>

          <main className="feed-main">
            <div className="feed-head">
              <div className="feed-badge">
                <span className="dot" />
                <span>Saját közösségi feed</span>
              </div>

              <h1>Bringás közösségi aktivitások</h1>
              <p>
                Kövesd, mit kedvelnek, értékelnek és osztanak meg azok,
                akiket követsz.
              </p>
            </div>

            <form className="feed-composer" onSubmit={handlePostStatus}>
              <div className="feed-composerTop">
                <div className="feed-composerIcon">
                  <i className="fa-solid fa-pen" />
                </div>
                <div className="feed-composerTitle">Mi jár a fejedben?</div>
              </div>

              <textarea
                className="feed-textarea"
                rows={4}
                maxLength={500}
                placeholder="Írj valamit a mai tekerésről, terveidről vagy bármiről, amit megosztanál..."
                value={statusText}
                onChange={e => setStatusText(e.target.value)}
              />

              <div className="feed-composerBottom">
                <div className="feed-charCount">{statusText.length} / 500</div>

                <button type="submit" className="feed-btn primary" disabled={posting}>
                  <i className="fa-solid fa-paper-plane" />
                  <span>{posting ? "Küldés..." : "Megosztás"}</span>
                </button>
              </div>

              {postErr && <div className="feed-formMsg err">{postErr}</div>}
              {postMsg && <div className="feed-formMsg ok">{postMsg}</div>}
            </form>

            {loading ? (
              <div className="feed-state">
                <i className="fa-solid fa-spinner fa-spin" />
                <span>Feed betöltése...</span>
              </div>
            ) : renderedItems.length === 0 ? (
              <div className="feed-empty">
                <i className="fa-solid fa-seedling" />
                <h3>Még üres a feed</h3>
                <p>
                  Kövess más felhasználókat, vagy írj egy saját bejegyzést,
                  és itt megjelennek az aktivitások.
                </p>
              </div>
            ) : (
              <div className="feed-list">
                {renderedItems.map(item => {
                  const isStatusPost = item.tipus === "statusz_poszt"

                  return (
                    <article
                      key={item.id}
                      className={`feed-card ${isStatusPost ? "feed-card-status" : ""}`}
                    >
                      <div className="feed-cardTop">
                        <div className="feed-cardUser">
                          {item.user?.profilkep ? (
                            <img
                              src={`http://localhost:3001${item.user.profilkep}`}
                              alt=""
                              className="feed-cardAvatarImg"
                            />
                          ) : (
                            <div className="feed-cardAvatar">
                              {(item.user?.username || "U").slice(0, 1).toUpperCase()}
                            </div>
                          )}

                          <div className="feed-cardUserTexts">
                            <Link to={`/u/${item.user?.username}`} className="feed-cardUsername">
                              {item.user?.username || "Felhasználó"}
                            </Link>
                            <div className="feed-cardTime">{formatTime(item.letrehozva)}</div>
                          </div>
                        </div>

                        {!isStatusPost && (
                          <div className={`feed-cardType feed-type-${item.tipus}`}>
                            <i className={`fa-solid fa-${item.icon}`} />
                          </div>
                        )}
                      </div>

                      {isStatusPost ? (
                        item.szoveg && <div className="feed-statusPostBox">{item.szoveg}</div>
                      ) : (
                        <>
                          {item.activity.title && (
                            <div className="feed-cardTitle">{item.activity.title}</div>
                          )}
                          {item.activity.body && (
                            <div className="feed-cardText">{item.activity.body}</div>
                          )}
                        </>
                      )}

                      {(item.cel_tipus && item.cel_id) && !isStatusPost && (
                        <div className="feed-cardBottom">
                          <a
                            href={targetLink(item.cel_tipus, item.cel_id)}
                            className="feed-linkBtn"
                          >
                            <span>Megnyitás a térképen</span>
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
          </main>
        </div>
      </div>
    </div>
  )
}