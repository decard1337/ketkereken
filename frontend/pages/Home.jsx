import { useEffect, useMemo, useState } from "react"
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet"
import L from "leaflet"
import { api } from "../lib/api"
import { useAuth } from "../lib/auth"
import "../styles/home.css"
import Onboarding from "../components/Onboarding"
import { formatShortDate } from "../lib/date"

const tiles = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"

function parseCoords(v) {
  try {
    const arr = JSON.parse(v || "[]")
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function pinIcon(kind = "pin") {
  let bg = "rgba(167,139,250,.95)"
  let icon = "fa-location-dot"

  if (kind === "event") {
    bg = "rgba(168,85,247,.95)"
    icon = "fa-calendar-days"
  }

  if (kind === "route") {
    bg = "rgba(99,102,241,.95)"
    icon = "fa-route"
  }

  if (kind === "rent") {
    bg = "rgba(59,130,246,.95)"
    icon = "fa-bicycle"
  }

  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;border-radius:12px;background:${bg};border:1px solid rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;box-shadow:0 16px 42px rgba(168,85,247,.25)"><i class="fa-solid ${icon}" style="color:white;font-size:12px"></i></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  })
}

function firstUpper(text) {
  const t = String(text || "").trim()
  if (!t) return "—"
  return t.charAt(0).toUpperCase() + t.slice(1)
}

function detailLink(type, id) {
  return `/terkep?tipus=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`
}

export default function Home() {
  const { user, logout } = useAuth()

  const [routes, setRoutes] = useState([])
  const [places, setPlaces] = useState([])
  const [events, setEvents] = useState([])
  const [rentals, setRentals] = useState([])
  const [activeRouteId, setActiveRouteId] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const [r, p, e, k] = await Promise.all([
          api.utvonalak(),
          api.destinaciok(),
          api.esemenyek(),
          api.kolcsonzok()
        ])

        setRoutes(Array.isArray(r) ? r : [])
        setPlaces(Array.isArray(p) ? p : [])
        setEvents(Array.isArray(e) ? e : [])
        setRentals(Array.isArray(k) ? k : [])
      } catch (err) {
        console.error("Homepage load error:", err)
        setRoutes([])
        setPlaces([])
        setEvents([])
        setRentals([])
      }
    })()
  }, [])

  const mapCenter = useMemo(() => {
    const anyPlace = places.find(x => Number.isFinite(Number(x.lat)) && Number.isFinite(Number(x.lng)))
    if (anyPlace) return [Number(anyPlace.lat), Number(anyPlace.lng)]

    const anyEvent = events.find(x => Number.isFinite(Number(x.lat)) && Number.isFinite(Number(x.lng)))
    if (anyEvent) return [Number(anyEvent.lat), Number(anyEvent.lng)]

    const anyRental = rentals.find(x => Number.isFinite(Number(x.lat)) && Number.isFinite(Number(x.lng)))
    if (anyRental) return [Number(anyRental.lat), Number(anyRental.lng)]

    return [47.4979, 19.0402]
  }, [places, events, rentals])

  const topRoutes = useMemo(() => routes.slice(0, 6), [routes])
  const topPlaces = useMemo(() => places.slice(0, 6), [places])
  const topEvents = useMemo(() => events.slice(0, 4), [events])
  const topRentals = useMemo(() => rentals.slice(0, 8), [rentals])

  const activeRoute = useMemo(() => {
    if (!activeRouteId) return null
    return routes.find(r => String(r.id) === String(activeRouteId)) || null
  }, [routes, activeRouteId])

  return (
    <div className="ketkereken-home">
      <Onboarding />

      <div className="ketkereken-home-bg">
        <div className="ketkereken-home-blob ketkereken-home-blob-a" />
        <div className="ketkereken-home-blob ketkereken-home-blob-b" />
        <div className="ketkereken-home-blob ketkereken-home-blob-c" />
        <div className="ketkereken-home-grid" />
      </div>

      <header className="ketkereken-header">
        <div className="ketkereken-brand">
          <div className="ketkereken-brand-mark">
            <i className="fa-solid fa-bicycle" />
          </div>

          <div className="ketkereken-brand-text">
            <div className="ketkereken-brand-name">Két Keréken</div>
            <div className="ketkereken-brand-subtitle">Kerékpáros felfedezés országszerte</div>
          </div>
        </div>

        <div className="ketkereken-header-actions">
          {user ? (
            <button
              type="button"
              className="ketkereken-button ketkereken-button-primary"
              onClick={logout}
            >
              <i className="fa-solid fa-right-from-bracket" />
              <span>Kijelentkezés</span>
            </button>
          ) : (
            <a className="ketkereken-button ketkereken-button-primary" href="/login">
              <i className="fa-solid fa-right-to-bracket" />
              <span>Bejelentkezés</span>
            </a>
          )}
        </div>
      </header>

      <main className="ketkereken-main">
        <section className="ketkereken-hero">
          <div className="ketkereken-hero-left">
            <div className="ketkereken-badge">
              <span className="ketkereken-badge-dot" />
              <span>Útvonalak • Események • Helyek • Kölcsönzők</span>
            </div>

            <h1 className="ketkereken-title">
              Fedezd fel az ország
              <span className="ketkereken-title-gradient"> kerékpáros lehetőségeit</span> egy helyen.
            </h1>

            <p className="ketkereken-lead">
              Találj útvonalakat, látnivalókat, eseményeket és kölcsönzőket egy modern,
              átlátható térképes felületen, bárhol is indulnál útnak.
            </p>

            <div className="ketkereken-hero-actions">
              <a className="ketkereken-button ketkereken-button-primary ketkereken-button-large" href="/terkep">
                <i className="fa-solid fa-map" />
                <span>Térkép megnyitása</span>
              </a>
            </div>

            <div className="ketkereken-stats">
              <div className="ketkereken-stat-card">
                <div className="ketkereken-stat-number">{routes.length}</div>
                <div className="ketkereken-stat-label">Útvonal</div>
              </div>

              <div className="ketkereken-stat-card">
                <div className="ketkereken-stat-number">{places.length}</div>
                <div className="ketkereken-stat-label">Hely</div>
              </div>

              <div className="ketkereken-stat-card">
                <div className="ketkereken-stat-number">{events.length}</div>
                <div className="ketkereken-stat-label">Esemény</div>
              </div>

              <div className="ketkereken-stat-card">
                <div className="ketkereken-stat-number">{rentals.length}</div>
                <div className="ketkereken-stat-label">Kölcsönző</div>
              </div>
            </div>
          </div>

          <div className="ketkereken-hero-right">
            <div className="ketkereken-map-card">
              <div className="ketkereken-map-card-top">
                <a className="ketkereken-mini-link" href="/terkep">
                  <span>Teljes térkép</span>
                  <i className="fa-solid fa-arrow-right" />
                </a>
              </div>

              <div className="ketkereken-map-wrap">
                <MapContainer center={mapCenter} zoom={12} zoomControl={false} className="ketkereken-mini-map">
                  <TileLayer url={tiles} />

                  {topPlaces.slice(0, 10).map(p => {
                    const lat = Number(p.lat)
                    const lng = Number(p.lng)
                    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

                    return (
                      <Marker
                        key={`place-${p.id}`}
                        position={[lat, lng]}
                        icon={pinIcon("pin")}
                      >
                        <Popup>{p.nev || `Hely #${p.id}`}</Popup>
                      </Marker>
                    )
                  })}

                  {topEvents.slice(0, 6).map(e => {
                    const lat = Number(e.lat)
                    const lng = Number(e.lng)
                    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

                    return (
                      <Marker
                        key={`event-${e.id}`}
                        position={[lat, lng]}
                        icon={pinIcon("event")}
                      >
                        <Popup>{e.nev || `Esemény #${e.id}`}</Popup>
                      </Marker>
                    )
                  })}

                  {topRentals.slice(0, 8).map(k => {
                    const lat = Number(k.lat)
                    const lng = Number(k.lng)
                    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

                    return (
                      <Marker
                        key={`rent-${k.id}`}
                        position={[lat, lng]}
                        icon={pinIcon("rent")}
                      >
                        <Popup>{k.nev || `Kölcsönző #${k.id}`}</Popup>
                      </Marker>
                    )
                  })}

                  {topRoutes.slice(0, 6).map(r => {
                    const coords = parseCoords(r.koordinatak)
                    if (!coords.length) return null

                    const active = String(r.id) === String(activeRouteId)

                    return (
                      <Polyline
                        key={`route-${r.id}`}
                        positions={coords}
                        pathOptions={{
                          weight: active ? 6 : 4,
                          opacity: active ? 0.95 : 0.25,
                          color: active ? "#a855f7" : "#6b7280"
                        }}
                      />
                    )
                  })}
                </MapContainer>

                <div className="ketkereken-map-glow" />
              </div>

              <div className="ketkereken-map-bottom">
                <div className="ketkereken-route-preview-list">
                  <button
                    className={
                      "ketkereken-route-preview-card " +
                      (!activeRouteId ? "ketkereken-route-preview-card-active" : "")
                    }
                    onClick={() => setActiveRouteId(null)}
                  >
                    <div className="ketkereken-route-preview-title">
                      <i className="fa-solid fa-wand-magic-sparkles" /> Ajánlott
                    </div>
                    <div className="ketkereken-route-preview-subtitle">Gyors áttekintés</div>
                  </button>

                  {topRoutes.slice(0, 3).map(r => (
                    <button
                      key={r.id}
                      className={
                        "ketkereken-route-preview-card " +
                        (String(activeRouteId) === String(r.id)
                          ? "ketkereken-route-preview-card-active"
                          : "")
                      }
                      onClick={() => setActiveRouteId(r.id)}
                      title={r.cim}
                    >
                      <div className="ketkereken-route-preview-title">
                        <i className="fa-solid fa-route" /> {r.cim || `#${r.id}`}
                      </div>
                      <div className="ketkereken-route-preview-subtitle">
                        {firstUpper(r.nehezseg)} • {r.hossz || "—"} km
                      </div>
                    </button>
                  ))}
                </div>

                {activeRoute && (
                  <div className="ketkereken-active-route-info">
                    <i className="fa-solid fa-circle-info" />
                    <span>Kijelölve: {activeRoute.cim}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="ketkereken-section">
          <div className="ketkereken-section-head">
            <h2>Miért hasznos?</h2>
            <p>
              Az oldal azért készült, hogy gyorsan és egyszerűen segítsen megtalálni
              a legjobb bringás lehetőségeket országszerte.
            </p>
          </div>

          <div className="ketkereken-feature-grid">
            <div className="ketkereken-info-card">
              <div className="ketkereken-info-icon"><i className="fa-solid fa-bolt" /></div>
              <div className="ketkereken-info-title">Gyors áttekintés</div>
              <div className="ketkereken-info-text">
                Néhány kattintással böngészheted a kerékpáros útvonalakat és helyeket.
              </div>
            </div>

            <div className="ketkereken-info-card">
              <div className="ketkereken-info-icon"><i className="fa-solid fa-layer-group" /></div>
              <div className="ketkereken-info-title">Minden egy helyen</div>
              <div className="ketkereken-info-text">
                Látnivalók, kölcsönzők, események és útvonalak ugyanazon a térképen.
              </div>
            </div>

            <div className="ketkereken-info-card">
              <div className="ketkereken-info-icon"><i className="fa-solid fa-route" /></div>
              <div className="ketkereken-info-title">Egyszerű tervezés</div>
              <div className="ketkereken-info-text">
                Gyorsan összehasonlíthatod az útvonalak hosszát, nehézségét és jellegét.
              </div>
            </div>

            <div className="ketkereken-info-card">
              <div className="ketkereken-info-icon"><i className="fa-solid fa-compass" /></div>
              <div className="ketkereken-info-title">Felfedezés bárhol</div>
              <div className="ketkereken-info-text">
                Nemcsak egy városra, hanem országos használatra készült bringás platform.
              </div>
            </div>
          </div>
        </section>

        <section className="ketkereken-section">
          <div className="ketkereken-section-head">
            <h2>Kiemelt helyek</h2>
            <p>Válogatás népszerű megállókból és érdekes pontokból.</p>
          </div>

          <div className="ketkereken-card-grid">
            {topPlaces.map(p => (
              <div key={p.id} className="ketkereken-content-card">
                <div className="ketkereken-content-card-top">
                  <div className="ketkereken-tag">
                    <i className="fa-solid fa-location-dot" /> Hely
                  </div>
                  <div className="ketkereken-card-id">#{p.id}</div>
                </div>

                <div className="ketkereken-content-card-title">{p.nev || `Hely #${p.id}`}</div>
                <div className="ketkereken-content-card-text">{p.leiras || "—"}</div>

                <div className="ketkereken-content-card-footer">
                  <a className="ketkereken-inline-link" href={detailLink("destinacio", p.id)}>
                    Megnyitás <i className="fa-solid fa-arrow-right" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="ketkereken-section">
          <div className="ketkereken-section-head">
            <h2>Közelgő események</h2>
            <p>Bringás programok és események, amelyeket érdemes figyelni.</p>
          </div>

          <div className="ketkereken-event-list">
            {topEvents.map(e => (
              <div key={e.id} className="ketkereken-event-row">
                <div className="ketkereken-event-row-left">
                  <div className="ketkereken-event-row-title">
                    <i className="fa-solid fa-calendar-days" /> {e.nev || `Esemény #${e.id}`}
                  </div>
                  <div className="ketkereken-event-row-text">{e.leiras || "—"}</div>
                </div>

                <div className="ketkereken-event-row-right">
                  <div className="ketkereken-date-pill">{formatShortDate(e.datum)}</div>
                  <a className="ketkereken-button ketkereken-button-soft" href={detailLink("esemeny", e.id)}>
                    <span>Mutasd</span>
                    <i className="fa-solid fa-arrow-right" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="ketkereken-final-section">
          <div className="ketkereken-final-card">
            <div className="ketkereken-final-glow" />
            <div className="ketkereken-final-content">
              <div className="ketkereken-final-title">Indulhat a felfedezés?</div>
              <div className="ketkereken-final-text">
                Nyisd meg a térképet, fedezz fel új útvonalakat, és találd meg a következő
                bringás célpontodat bárhol az országban.
              </div>

              <div className="ketkereken-final-actions">
                <a className="ketkereken-button ketkereken-button-primary ketkereken-button-large" href="/terkep">
                  <i className="fa-solid fa-map" />
                  <span>Térkép</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="ketkereken-footer">
        <div className="ketkereken-footer-left">
          <div className="ketkereken-footer-mark">
            <i className="fa-solid fa-bicycle" />
          </div>

          <div>
            <div className="ketkereken-footer-name">Két Keréken</div>
            <div className="ketkereken-footer-subtitle">
              Kerékpáros útvonalak, helyek és események egy platformon
            </div>
          </div>
        </div>

        <div className="ketkereken-footer-right">
          <a href="/terkep">Térkép</a>
          {user ? (
            <button
              type="button"
              className="ketkereken-button ketkereken-button-ghost"
              onClick={logout}
            >
              Kijelentkezés
            </button>
          ) : (
            <a href="/login">Bejelentkezés</a>
          )}
        </div>
      </footer>
    </div>
  )
}