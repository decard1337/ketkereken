import { useEffect, useMemo, useState } from "react"
import { Navigate, useParams } from "react-router-dom"
import { api } from "../lib/api"
import { useAuth } from "../lib/auth"
import "../styles/profile.css"

function labelForType(tipus) {
  if (tipus === "utvonalak") return "Útvonalak"
  if (tipus === "destinaciok") return "Desztinációk"
  if (tipus === "esemenyek") return "Események"
  if (tipus === "kolcsonzok") return "Kölcsönzők"
  if (tipus === "blippek") return "Blippek"
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

function routeForType() {
  return "/terkep"
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
  const [adatok, setAdatok] = useState({
    utvonalak: [],
    destinaciok: [],
    esemenyek: [],
    kolcsonzok: [],
    blippek: []
  })

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

  const isOwnProfile = Boolean(user && username && user.username === username)

  useEffect(() => {
    if (!username) return

    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setProfileNotFound(false)
        setProfile(null)
        setKedvencek([])
        setErtekelesek([])
        setKepek([])

        const [utvRes, destRes, eseRes, kolRes, bliRes] = await Promise.all([
          api.utvonalak(),
          api.destinaciok(),
          api.esemenyek(),
          api.kolcsonzok(),
          api.blippek()
        ])

        if (cancelled) return

        setAdatok({
          utvonalak: Array.isArray(utvRes) ? utvRes : [],
          destinaciok: Array.isArray(destRes) ? destRes : [],
          esemenyek: Array.isArray(eseRes) ? eseRes : [],
          kolcsonzok: Array.isArray(kolRes) ? kolRes : [],
          blippek: Array.isArray(bliRes) ? bliRes : []
        })

        if (isOwnProfile && user) {
          const [kedvRes, ertekRes, kepRes] = await Promise.all([
            api.kedvencek(),
            api.sajatErtekelesek(),
            api.sajatKepek()
          ])

          if (cancelled) return

          setProfile(user)
          setKedvencek(Array.isArray(kedvRes) ? kedvRes : [])
          setErtekelesek(Array.isArray(ertekRes) ? ertekRes : [])
          setKepek(Array.isArray(kepRes) ? kepRes : [])
        } else {
          const publicRes = await api.publicProfile(username)

          if (cancelled) return

          setProfile(publicRes?.user || null)
          setKedvencek(Array.isArray(publicRes?.kedvencek) ? publicRes.kedvencek : [])
          setErtekelesek(Array.isArray(publicRes?.ertekelesek) ? publicRes.ertekelesek : [])
          setKepek(Array.isArray(publicRes?.kepek) ? publicRes.kepek : [])
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
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (ready) {
      load()
    }

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
    return kedvencek.map(k => {
      const resolved = resolveItem(k.cel_tipus, k.cel_id)
      return {
        ...k,
        ...resolved
      }
    })
  }, [kedvencek, adatok])

  const resolvedRatings = useMemo(() => {
    return ertekelesek.map(e => {
      const resolved = resolveItem(e.cel_tipus, e.cel_id)
      return {
        ...e,
        ...resolved
      }
    })
  }, [ertekelesek, adatok])

  const resolvedImages = useMemo(() => {
    return kepek.map(k => {
      const resolved = resolveItem(k.cel_tipus, k.cel_id)
      return {
        ...k,
        ...resolved
      }
    })
  }, [kepek, adatok])

  const grouped = useMemo(() => {
    return {
      utvonalak: resolvedFavorites.filter(x => x.cel_tipus === "utvonalak"),
      destinaciok: resolvedFavorites.filter(x => x.cel_tipus === "destinaciok"),
      esemenyek: resolvedFavorites.filter(x => x.cel_tipus === "esemenyek"),
      kolcsonzok: resolvedFavorites.filter(x => x.cel_tipus === "kolcsonzok"),
      blippek: resolvedFavorites.filter(x => x.cel_tipus === "blippek")
    }
  }, [resolvedFavorites])

  const totalFavorites = resolvedFavorites.length

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

            {isOwnProfile && (
              <button className="prf-btn primary" onClick={logout}>
                <i className="fa-solid fa-right-from-bracket" />
                <span>Kijelentkezés</span>
              </button>
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

                {isOwnProfile && (
                  <button className="prf-editLink" onClick={() => setEditOpen(true)}>
                    Profil szerkesztése
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

                {profile.bio && (
                  <div className="prf-bio">
                    {profile.bio}
                  </div>
                )}
              </div>

              <div className="prf-stats">
                <div className="prf-stat">
                  <div className="prf-statNum">{totalFavorites}</div>
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
                  <h1>{isOwnProfile ? "Kedvenceid és aktivitásod" : `${profile.username} profilja`}</h1>
                  <p>
                    {isOwnProfile
                      ? "Itt látod az elmentett elemeket, az értékeléseidet és a feltöltött képeidet."
                      : "Itt látod a nyilvános kedvenceket, értékeléseket és képeket."}
                  </p>
                </div>
              </div>

              {totalFavorites === 0 && resolvedRatings.length === 0 && resolvedImages.length === 0 && (
                <div className="prf-empty">
                  <i className="fa-solid fa-heart-crack" />
                  <h3>Még nincs aktivitás</h3>
                  <p>
                    {isOwnProfile
                      ? "Jelölj be útvonalakat, írj értékelést vagy tölts fel képet a térképen."
                      : "Ennek a felhasználónak még nincs nyilvános aktivitása."}
                  </p>
                  <a href="/terkep" className="prf-btn primary">
                    <i className="fa-solid fa-map" />
                    <span>Térkép megnyitása</span>
                  </a>
                </div>
              )}

              {totalFavorites > 0 && (
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

                              {item.description && (
                                <div className="prf-cardText">{item.description}</div>
                              )}

                              <div className="prf-cardBottom">
                                <span className="prf-cardMeta">{item.meta || "Mentett elem"}</span>
                                <a href={routeForType(item.cel_tipus)} className="prf-linkBtn">
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
              )}

              {resolvedRatings.length > 0 && (
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

                          {isOwnProfile && (
                            <div className={`prf-status prf-status-${e.statusz}`}>
                              {statusLabel(e.statusz)}
                            </div>
                          )}
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
                              <button className="prf-btn primary" onClick={() => handleSaveRating(e.id)}>
                                Mentés
                              </button>
                              <button
                                className="prf-btn ghost"
                                onClick={() => {
                                  setEditingRatingId(null)
                                  setEditingPontszam(0)
                                  setEditingSzoveg("")
                                }}
                              >
                                Mégse
                              </button>
                            </div>

                            <div className="prf-cardText" style={{ marginTop: 10 }}>
                              Módosítás után újra jóváhagyásra vár.
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="prf-cardTitle">{e.title}</div>

                            <div className="prf-cardText">⭐ {e.pontszam} / 5</div>

                            {e.szoveg && (
                              <div className="prf-cardText">{e.szoveg}</div>
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
              )}

              {resolvedImages.length > 0 && (
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

                          {isOwnProfile && (
                            <div className={`prf-status prf-status-${k.statusz}`}>
                              {statusLabel(k.statusz)}
                            </div>
                          )}
                        </div>

                        <div className="prf-cardTitle">{k.title}</div>

                        <img
                          src={`http://localhost:3001${k.fajl_utvonal}`}
                          alt=""
                          className="prf-image"
                        />

                        {k.leiras && (
                          <div className="prf-cardText">{k.leiras}</div>
                        )}

                        <div className="prf-cardBottom">
                          <span className="prf-cardMeta">{k.meta || labelForType(k.cel_tipus)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
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
                <input
                  className="prf-input"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
              </label>

              <label className="prf-field">
                <div className="prf-label">Bio</div>
                <textarea
                  className="prf-textarea"
                  rows={5}
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                />
              </label>

              <label className="prf-field">
                <div className="prf-label">Profilkép</div>
                <input
                  className="prf-file"
                  type="file"
                  accept="image/*"
                  onChange={e => setEditFile(e.target.files?.[0] || null)}
                />
              </label>

              {saveErr && <div className="prf-formMsg err">{saveErr}</div>}
              {saveMsg && <div className="prf-formMsg ok">{saveMsg}</div>}

              <div className="prf-formActions">
                <button type="button" className="prf-btn ghost" onClick={() => setEditOpen(false)}>
                  Mégse
                </button>
                <button type="submit" className="prf-btn primary" disabled={saving}>
                  {saving ? "Mentés..." : "Mentés"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmOpen && (
        <div className="prf-modal open">
          <div
            className="prf-modalOverlay"
            onClick={() => {
              setDeleteConfirmOpen(false)
              setDeleteTargetId(null)
            }}
          />

          <div className="prf-modalCard">
            <div className="prf-modalHead">
              <div className="prf-modalTitle">Értékelés törlése</div>
              <button
                className="prf-modalClose"
                onClick={() => {
                  setDeleteConfirmOpen(false)
                  setDeleteTargetId(null)
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div style={{ color: "rgba(255,255,255,.82)", lineHeight: 1.6 }}>
              Biztosan törölni akarod ezt az értékelést?
            </div>

            <div className="prf-formActions" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="prf-btn ghost"
                onClick={() => {
                  setDeleteConfirmOpen(false)
                  setDeleteTargetId(null)
                }}
              >
                Mégse
              </button>

              <button
                type="button"
                className="prf-btn primary"
                onClick={() => handleDeleteRating(deleteTargetId)}
              >
                Igen, törlöm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}