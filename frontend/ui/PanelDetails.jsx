import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { api } from "../lib/api"
import { useAuth } from "../lib/auth"
<<<<<<< HEAD
import { formatLongHuDate } from "../lib/date"
=======
>>>>>>> d3fda18727ce8b2d98d799fc65d84bbb28bad97f

function getCommunityType(type) {
  if (type === "utvonal") return "utvonalak"
  if (type === "destinacio") return "destinaciok"
  if (type === "esemeny") return "esemenyek"
  if (type === "kolcsonzo") return "kolcsonzok"
  return null
}

function normalizeSelectedType(type) {
  if (type === "utvonal") return "utvonal"
  if (type === "destinacio") return "destinacio"
  if (type === "esemeny") return "esemeny"
  if (type === "kolcsonzo") return "kolcsonzo"
  return ""
}

function formatDate(value) {
<<<<<<< HEAD
  return formatLongHuDate(value)
=======
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
>>>>>>> d3fda18727ce8b2d98d799fc65d84bbb28bad97f
}

function Lightbox({ images, index, onClose, onPrev, onNext }) {
  const active = images[index]
  if (!active) return null

  return createPortal(
    <div className="img-lightbox" onClick={onClose}>
      <div className="img-lightbox-inner" onClick={e => e.stopPropagation()}>
        <button className="img-lightbox-close" type="button" onClick={onClose}>
          <i className="fa-solid fa-xmark" />
        </button>

        {images.length > 1 && (
          <>
            <button className="img-lightbox-nav left" type="button" onClick={onPrev}>
              <i className="fa-solid fa-chevron-left" />
            </button>

            <button className="img-lightbox-nav right" type="button" onClick={onNext}>
              <i className="fa-solid fa-chevron-right" />
            </button>
          </>
        )}

        <img
          src={`http://localhost:3001${active.fajl_utvonal}`}
          alt=""
          className="img-lightbox-image"
        />
      </div>
    </div>,
    document.body
  )
}

export default function PanelDetails({ type, items, selected }) {
  const { user } = useAuth()

  const [kepek, setKepek] = useState([])
  const [kepekIndex, setKepekIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const [ertekelesLista, setErtekelesLista] = useState([])
  const [atlag, setAtlag] = useState(null)
  const [darab, setDarab] = useState(0)

  const [pontszam, setPontszam] = useState(0)
  const [szoveg, setSzoveg] = useState("")
  const [kepFile, setKepFile] = useState(null)
  const [kepLeiras, setKepLeiras] = useState("")

  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [err, setErr] = useState("")

  const selectedItem = useMemo(() => {
    if (!selected) return null
    if (selected.type !== normalizeSelectedType(type)) return null
    return items.find(x => String(x.id) === String(selected.id)) || null
  }, [items, selected, type])

  const communityType = useMemo(() => getCommunityType(type), [type])

  useEffect(() => {
    if (!selectedItem || !communityType) {
      setKepek([])
      setErtekelesLista([])
      setAtlag(null)
      setDarab(0)
      setKepekIndex(0)
      return
    }

    let cancelled = false

    async function loadCommunity() {
      try {
        setLoading(true)
        setErr("")
        setMsg("")

        const [kepekRes, ertekelesRes] = await Promise.all([
          api.kepek(communityType, selectedItem.id),
          api.ertekelesek(communityType, selectedItem.id)
        ])

        if (cancelled) return

        setKepek(Array.isArray(kepekRes) ? kepekRes : [])
        setErtekelesLista(Array.isArray(ertekelesRes?.adatok) ? ertekelesRes.adatok : [])
        setAtlag(ertekelesRes?.atlag ?? null)
        setDarab(Number(ertekelesRes?.darab ?? 0))
        setKepekIndex(0)
      } catch (e) {
        if (cancelled) return
        setErr(e.message || "Betöltési hiba")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadCommunity()

    return () => {
      cancelled = true
    }
  }, [selectedItem, communityType])

  async function handleRatingSubmit() {
    if (!selectedItem || !communityType) return
    if (!pontszam) {
      setErr("Válassz csillagot.")
      return
    }

    try {
      setErr("")
      setMsg("")

      await api.kuldErtekeles(
        communityType,
        selectedItem.id,
        pontszam,
        szoveg
      )

      const ertekelesRes = await api.ertekelesek(communityType, selectedItem.id)

      setErtekelesLista(Array.isArray(ertekelesRes?.adatok) ? ertekelesRes.adatok : [])
      setAtlag(ertekelesRes?.atlag ?? null)
      setDarab(Number(ertekelesRes?.darab ?? 0))
      setPontszam(0)
      setSzoveg("")
      setMsg("Értékelés elküldve. Admin jóváhagyás után jelenik meg.")
    } catch (e) {
      setErr(e.message || "Nem sikerült elküldeni az értékelést.")
    }
  }

  async function handleImageUpload() {
    if (!selectedItem || !communityType) return
    if (!kepFile) {
      setErr("Válassz ki egy képet.")
      return
    }

    try {
      setErr("")
      setMsg("")

      await api.kuldKep(
        communityType,
        selectedItem.id,
        kepFile,
        kepLeiras
      )

      const kepekRes = await api.kepek(communityType, selectedItem.id)

      setKepek(Array.isArray(kepekRes) ? kepekRes : [])
      setKepekIndex(0)
      setKepFile(null)
      setKepLeiras("")
      setMsg("Kép feltöltve. Admin jóváhagyás után jelenik meg.")
    } catch (e) {
      setErr(e.message || "Nem sikerült feltölteni a képet.")
    }
  }

  function renderInfoGrid(item) {
    if (type === "utvonal") {
      return (
        <div className="reszletek-grid">
          <div className="reszletek-item">
            <div className="reszletek-ertek">{item.hossz || "—"} km</div>
            <div className="reszletek-cimke">Hossz</div>
          </div>

          <div className="reszletek-item">
            <div className="reszletek-ertek">{item.nehezseg || "—"}</div>
            <div className="reszletek-cimke">Nehézség</div>
          </div>

          <div className="reszletek-item">
            <div className="reszletek-ertek">{item.idotartam || "—"}</div>
            <div className="reszletek-cimke">Időtartam</div>
          </div>

          <div className="reszletek-item">
            <div className="reszletek-ertek">{item.szintkulonbseg || "—"} m</div>
            <div className="reszletek-cimke">Szintkülönbség</div>
          </div>
        </div>
      )
    }

    if (type === "destinacio") {
      return (
        <div className="reszletek-grid">
          <div className="reszletek-item">
            <div className="reszletek-ertek">{item.tipus || "—"}</div>
            <div className="reszletek-cimke">Típus</div>
          </div>

          <div className="reszletek-item">
            <div className="reszletek-ertek">{item.lat || "—"}</div>
            <div className="reszletek-cimke">Lat</div>
          </div>

          <div className="reszletek-item">
            <div className="reszletek-ertek">{item.lng || "—"}</div>
            <div className="reszletek-cimke">Lng</div>
          </div>
        </div>
      )
    }

    if (type === "esemeny") {
      return (
        <div className="reszletek-grid">
          <div className="reszletek-item">
            <div className="reszletek-ertek">{formatDate(item.datum)}</div>
            <div className="reszletek-cimke">Dátum</div>
          </div>

          <div className="reszletek-item">
            <div className="reszletek-ertek">{item.tipus || "—"}</div>
            <div className="reszletek-cimke">Típus</div>
          </div>

          <div className="reszletek-item">
            <div className="reszletek-ertek">{item.resztvevok || "—"}</div>
            <div className="reszletek-cimke">Résztvevők</div>
          </div>
        </div>
      )
    }

    if (type === "kolcsonzo") {
      return (
        <div className="reszletek-grid">
          <div className="reszletek-item">
            <div className="reszletek-ertek">{item.ar || "—"}</div>
            <div className="reszletek-cimke">Ár</div>
          </div>

          <div className="reszletek-item">
            <div className="reszletek-ertek">{item.telefon || "—"}</div>
            <div className="reszletek-cimke">Telefon</div>
          </div>

          <div className="reszletek-item">
            <div className="reszletek-ertek">{item.nyitvatartas || "—"}</div>
            <div className="reszletek-cimke">Nyitvatartás</div>
          </div>

          <div className="reszletek-item">
            <div className="reszletek-ertek">{item.cim || "—"}</div>
            <div className="reszletek-cimke">Cím</div>
          </div>
        </div>
      )
    }

    return null
  }

  if (!selectedItem) {
    return (
      <div className="panel-reszletek active">
        <h3 className="reszletek-cim">
          <i className="fas fa-circle-info" />
          Válassz ki egy elemet
        </h3>

        <p className="reszletek-leiras">
          Kattints a listában egy elemre, és itt megjelennek a részletek.
        </p>
      </div>
    )
  }

  const title = selectedItem.cim || selectedItem.nev || `#${selectedItem.id}`
  const activeImage = kepek.length ? kepek[kepekIndex] : null

  return (
    <>
      <div className="panel-reszletek active">
        <h3 className="reszletek-cim">
          <i
            className={`fas fa-${
              type === "utvonal"
                ? "route"
                : type === "destinacio"
                ? "map-marker-alt"
                : type === "esemeny"
                ? "calendar-alt"
                : "bicycle"
            }`}
          />
          {title}
        </h3>

        <p className="reszletek-leiras">{selectedItem.leiras || "Nincs leírás."}</p>

        {renderInfoGrid(selectedItem)}

        <div className="community">
          <div className="community-head">
            <div className="community-title">Képek</div>
          </div>

          {activeImage ? (
            <div className="community-gallery">
              <div className="community-mainImageWrap">
                <button
                  type="button"
                  className="community-mainImageBtn"
                  onClick={() => setLightboxOpen(true)}
                >
                  <img
                    src={`http://localhost:3001${activeImage.fajl_utvonal}`}
                    alt=""
                    className="community-mainImage"
                  />
                </button>

                {kepek.length > 1 && (
                  <>
                    <button
                      className="community-nav left"
                      onClick={() => setKepekIndex(p => (p - 1 + kepek.length) % kepek.length)}
                      type="button"
                    >
                      <i className="fas fa-chevron-left" />
                    </button>

                    <button
                      className="community-nav right"
                      onClick={() => setKepekIndex(p => (p + 1) % kepek.length)}
                      type="button"
                    >
                      <i className="fas fa-chevron-right" />
                    </button>
                  </>
                )}
              </div>

              <div className="community-thumbsRow">
                {kepek.map((kep, idx) => (
                  <button
                    key={kep.id}
                    type="button"
                    className={"community-thumb " + (idx === kepekIndex ? "active" : "")}
                    onClick={() => setKepekIndex(idx)}
                  >
                    <img src={`http://localhost:3001${kep.fajl_utvonal}`} alt="" />
                  </button>
                ))}

                {user && (
                  <label className="community-addImage">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setKepFile(e.target.files?.[0] || null)}
                    />
                    <span>+</span>
                  </label>
                )}
              </div>
            </div>
          ) : (
            <div className="community-noImage">
              Jelenleg nincs kép erről a helyről.
            </div>
          )}

          {!activeImage && user && (
            <div className="community-uploadOnly">
              <label className="community-addImage big">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setKepFile(e.target.files?.[0] || null)}
                />
                <span>+</span>
              </label>
            </div>
          )}

          {user && kepFile && (
            <div className="community-uploadPanel">
              <div className="community-subtitle">Kép feltöltése</div>

              <textarea
                className="community-textarea"
                rows={3}
                placeholder="Rövid leírás a képhez..."
                value={kepLeiras}
                onChange={e => setKepLeiras(e.target.value)}
              />

              <button className="community-btn" type="button" onClick={handleImageUpload}>
                Kép feltöltése
              </button>

              <div className="community-note">
                Admin jóváhagyás után jelenik meg.
              </div>
            </div>
          )}

          <div className="community-head second">
            <div className="community-title">Értékelések</div>
            <div className="community-ratingSummary">
              {atlag ? `⭐ ${Number(atlag).toFixed(1)} (${darab})` : "Még nincs értékelés"}
            </div>
          </div>

          {ertekelesLista.length > 0 ? (
            <div className="community-ratingsList">
              {ertekelesLista.map(ertekeles => (
                <div key={ertekeles.id} className="community-ratingItem">
                  <div className="community-ratingTop">
                    <a href={`/u/${ertekeles.username}`} className="community-user">
                      {ertekeles.username}
                    </a>

                    <div className="community-itemStars">
                      {"★".repeat(Number(ertekeles.pontszam || 0))}
                      {"☆".repeat(5 - Number(ertekeles.pontszam || 0))}
                    </div>
                  </div>

                  {ertekeles.szoveg && (
                    <div className="community-ratingText">{ertekeles.szoveg}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="community-noRatings">
              Még nincs értékelés erről az elemről.
            </div>
          )}

          {user ? (
            <div className="community-rateBox">
              <div className="community-subtitle">Írj értékelést</div>

              <div className="community-starPicker">
                {[1, 2, 3, 4, 5].map(i => (
                  <button
                    key={i}
                    type="button"
                    className={"community-starBtn " + (i <= pontszam ? "on" : "")}
                    onClick={() => setPontszam(i)}
                  >
                    <i className="fas fa-star" />
                  </button>
                ))}
              </div>

              <textarea
                className="community-textarea"
                rows={4}
                placeholder="Írj véleményt..."
                value={szoveg}
                onChange={e => setSzoveg(e.target.value)}
              />

              <button className="community-btn" type="button" onClick={handleRatingSubmit}>
                Értékelés beküldése
              </button>

              <div className="community-note">
                Admin jóváhagyás után jelenik meg.
              </div>
            </div>
          ) : (
            <div className="community-loginHint">
              Jelentkezz be, hogy értékelést írj vagy képet tölts fel.
            </div>
          )}

          {loading && <div className="community-state">Betöltés...</div>}
          {err && <div className="community-state error">{err}</div>}
          {msg && <div className="community-state ok">{msg}</div>}
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox
          images={kepek}
          index={kepekIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setKepekIndex(prev => (prev - 1 + kepek.length) % kepek.length)}
          onNext={() => setKepekIndex(prev => (prev + 1) % kepek.length)}
        />
      )}
    </>
  )
}