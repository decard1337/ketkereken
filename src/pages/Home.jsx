import { useEffect, useMemo, useState } from "react"
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet"
import L from "leaflet"
import { api } from "../lib/api"
import "../styles/home.css"
import Onboarding from "../components/Onboarding"

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

  if (kind === "blip") {
    bg = "rgba(139,92,246,.95)"
    icon = "fa-location-crosshairs"
  }

  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;border-radius:12px;background:${bg};border:1px solid rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;box-shadow:0 16px 42px rgba(168,85,247,.25)"><i class="fa-solid ${icon}" style="color:white;font-size:12px"></i></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  })
}

export default function Home() {
  const [routes, setRoutes] = useState([])
  const [places, setPlaces] = useState([])
  const [events, setEvents] = useState([])
  const [rentals, setRentals] = useState([])
  const [blips, setBlips] = useState([])
  const [activeRouteId, setActiveRouteId] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const [r, p, e, k, b] = await Promise.all([
          api.utvonalak(),
          api.destinaciok(),
          api.esemenyek(),
          api.kolcsonzok(),
          api.blippek()
        ])

        setRoutes(Array.isArray(r) ? r : [])
        setPlaces(Array.isArray(p) ? p : [])
        setEvents(Array.isArray(e) ? e : [])
        setRentals(Array.isArray(k) ? k : [])
        setBlips(Array.isArray(b) ? b : [])
      } catch (err) {
        console.error("Homepage load error:", err)
        setRoutes([])
        setPlaces([])
        setEvents([])
        setRentals([])
        setBlips([])
      }
    })()
  }, [])

  const mapCenter = useMemo(() => {
    const anyPlace = places.find(x => Number.isFinite(Number(x.lat)) && Number.isFinite(Number(x.lng)))
    if (anyPlace) return [Number(anyPlace.lat), Number(anyPlace.lng)]

    const anyBlip = blips.find(x => Number.isFinite(Number(x.lat)) && Number.isFinite(Number(x.lng)))
    if (anyBlip) return [Number(anyBlip.lat), Number(anyBlip.lng)]

    return [47.4979, 19.0402]
  }, [places, blips])

  const topRoutes = useMemo(() => routes.slice(0, 6), [routes])
  const topPlaces = useMemo(() => places.slice(0, 6), [places])
  const topEvents = useMemo(() => events.slice(0, 4), [events])
  const topRentals = useMemo(() => rentals.slice(0, 8), [rentals])
  const topBlips = useMemo(() => blips.slice(0, 12), [blips])

  const activeRoute = useMemo(() => {
    if (!activeRouteId) return null
    return routes.find(r => String(r.id) === String(activeRouteId)) || null
  }, [routes, activeRouteId])

  return (
    <div className="hp">
      <Onboarding />

      <div className="hp-bg">
        <div className="hp-blob a" />
        <div className="hp-blob b" />
        <div className="hp-blob c" />
        <div className="hp-grid" />
      </div>

      <header className="hp-header">
        <div className="hp-brand">
          <div className="hp-mark"><i className="fa-solid fa-bicycle" /></div>
          <div className="hp-brandText">
            <div className="hp-name">Két Keréken</div>
            <div className="hp-sub">Budapest</div>
          </div>
        </div>

        <nav className="hp-nav">
          <a href="/map">Térkép</a>
          <a href="/routes">Útvonalak</a>
          <a href="/events">Események</a>
        </nav>

        <div className="hp-ctaRow">
          <a className="hp-btn ghost" href="/login">Bejelentkezés</a>
          <a className="hp-btn primary" href="/map">
            <i className="fa-solid fa-compass" />
            <span>Indulás</span>
          </a>
        </div>
      </header>

      <main className="hp-main">
        <section className="hp-hero">
          <div className="hp-heroLeft">
            <div className="hp-badge">
              <span className="dot" />
              <span>Útvonalak • Események • Helyek</span>
            </div>

            <h1 className="hp-h1">
              Bringázz okosabban.
              <span className="grad"> Fedezz fel</span> mindent egy térképen.
            </h1>

            <p className="hp-lead">
              Minimal, gyors és átlátható felület: útvonalak, kölcsönzők, látnivalók és események – egy helyen.
            </p>

            <div className="hp-actions">
              <a className="hp-btn primary big" href="/map">
                <i className="fa-solid fa-map" />
                <span>Térkép megnyitása</span>
              </a>
              <a className="hp-btn soft big" href="/routes">
                <i className="fa-solid fa-route" />
                <span>Útvonalak</span>
              </a>
            </div>

            <div className="hp-stats">
              <div className="hp-stat">
                <div className="k">{routes.length}</div>
                <div className="v">útvonal</div>
              </div>
              <div className="hp-stat">
                <div className="k">{places.length}</div>
                <div className="v">hely</div>
              </div>
              <div className="hp-stat">
                <div className="k">{events.length}</div>
                <div className="v">esemény</div>
              </div>
              <div className="hp-stat">
                <div className="k">{blips.length}</div>
                <div className="v">blipp</div>
              </div>
            </div>
          </div>

          <div className="hp-heroRight">
            <div className="hp-mapFrame">
              <div className="hp-mapTop">
                <div className="hp-mapPills">
                  <div className="pill on"><i className="fa-solid fa-location-dot" /><span>Helyek</span></div>
                  <div className="pill"><i className="fa-solid fa-route" /><span>Útvonalak</span></div>
                  <div className="pill"><i className="fa-solid fa-calendar-days" /><span>Események</span></div>
                </div>
                <a className="hp-miniLink" href="/map">
                  <span>Teljes térkép</span>
                  <i className="fa-solid fa-arrow-right" />
                </a>
              </div>

              <div className="hp-mapWrap">
                <MapContainer center={mapCenter} zoom={12} zoomControl={false} className="hp-map">
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
                      />
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
                      />
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
                      />
                    )
                  })}

                  {topBlips.slice(0, 12).map(b => {
                    const lat = Number(b.lat)
                    const lng = Number(b.lng)
                    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
                    return (
                      <Marker
                        key={`blip-${b.id}`}
                        position={[lat, lng]}
                        icon={pinIcon("blip")}
                      />
                    )
                  })}

                  {topRoutes.slice(0, 6).map(r => {
                    const coords = parseCoords(r.koordinatak)
                    if (!coords.length) return null

                    const active = String(r.id) === String(activeRouteId)

                    return (
                      <Polyline
                        key={`r-${r.id}`}
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

                <div className="hp-mapGlow" />
              </div>

              <div className="hp-mapBottom">
                <div className="hp-miniCards">
                  <button
                    className={"miniCard " + (!activeRouteId ? "on" : "")}
                    onClick={() => setActiveRouteId(null)}
                  >
                    <div className="t"><i className="fa-solid fa-wand-magic-sparkles" /> Ajánlott</div>
                    <div className="s">Gyors preview</div>
                  </button>

                  {topRoutes.slice(0, 3).map(r => (
                    <button
                      key={r.id}
                      className={"miniCard " + (String(activeRouteId) === String(r.id) ? "on" : "")}
                      onClick={() => setActiveRouteId(r.id)}
                      title={r.cim}
                    >
                      <div className="t"><i className="fa-solid fa-route" /> {r.cim || `#${r.id}`}</div>
                      <div className="s">{r.nehezseg || "—"} • {r.hossz || "—"} km</div>
                    </button>
                  ))}
                </div>

                {activeRoute && (
                  <div className="hp-activeHint">
                    <i className="fa-solid fa-circle-info" />
                    <span>Kijelölve: {activeRoute.cim}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="hp-section">
          <div className="hp-secHead">
            <h2>Miért ez?</h2>
            <p>Letisztult, gyors és térkép-központú. Ugyanaz a vibe, mint az admin felületen.</p>
          </div>

          <div className="hp-features">
            <div className="hp-card">
              <div className="hp-ic"><i className="fa-solid fa-bolt" /></div>
              <div className="hp-cardT">Gyors</div>
              <div className="hp-cardS">Könnyű navigáció, azonnali átláthatóság.</div>
            </div>

            <div className="hp-card">
              <div className="hp-ic"><i className="fa-solid fa-layer-group" /></div>
              <div className="hp-cardT">Rétegek</div>
              <div className="hp-cardS">Helyek, kölcsönzők, események – egy mapen.</div>
            </div>

            <div className="hp-card">
              <div className="hp-ic"><i className="fa-solid fa-route" /></div>
              <div className="hp-cardT">Útvonalak</div>
              <div className="hp-cardS">Kiemelt preview, nehézség és hossz.</div>
            </div>

            <div className="hp-card">
              <div className="hp-ic"><i className="fa-solid fa-shield-halved" /></div>
              <div className="hp-cardT">Admin ready</div>
              <div className="hp-cardS">Szerkeszthető tartalom, role-based rendszerhez passzol.</div>
            </div>
          </div>
        </section>

        <section className="hp-section">
          <div className="hp-secHead">
            <h2>Népszerű helyek</h2>
            <p>Gyors válogatás a legjobb spotokból.</p>
          </div>

          <div className="hp-gridCards">
            {topPlaces.map(p => (
              <div key={p.id} className="hp-card2">
                <div className="hp-card2Top">
                  <div className="tag"><i className="fa-solid fa-location-dot" /> hely</div>
                  <div className="id">#{p.id}</div>
                </div>
                <div className="hp-card2T">{p.nev || `Hely #${p.id}`}</div>
                <div className="hp-card2S">{p.leiras || "—"}</div>
                <div className="hp-card2Foot">
                  <a className="hp-link" href="/map">Megnyitás <i className="fa-solid fa-arrow-right" /></a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="hp-section">
          <div className="hp-secHead">
            <h2>Közelgő események</h2>
            <p>Ami mostanában történik.</p>
          </div>

          <div className="hp-list">
            {topEvents.map(e => (
              <div key={e.id} className="hp-row">
                <div className="left">
                  <div className="ttl"><i className="fa-solid fa-calendar-days" /> {e.nev || `Esemény #${e.id}`}</div>
                  <div className="sub">{e.leiras || "—"}</div>
                </div>
                <div className="right">
                  <div className="pill2">{e.datum || "—"}</div>
                  <a className="hp-btn soft" href="/map"><span>Mutasd</span><i className="fa-solid fa-arrow-right" /></a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="hp-final">
          <div className="hp-finalCard">
            <div className="hp-finalGlow" />
            <div className="hp-finalIn">
              <div className="hp-finalT">Készen állsz?</div>
              <div className="hp-finalS">Nyisd meg a térképet és kezdj el felfedezni. Ugyanaz a minimal dark élmény, lila akcentussal.</div>
              <div className="hp-finalA">
                <a className="hp-btn primary big" href="/map"><i className="fa-solid fa-map" /><span>Térkép</span></a>
                <a className="hp-btn ghost big" href="/admin"><i className="fa-solid fa-shield-halved" /><span>Admin</span></a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="hp-foot">
        <div className="hp-footL">
          <div className="hp-footMark"><i className="fa-solid fa-bicycle" /></div>
          <div>
            <div className="hp-footName">Két Keréken</div>
            <div className="hp-footSub">Minimal map platform</div>
          </div>
        </div>
        <div className="hp-footR">
          <a href="/map">Térkép</a>
          <a href="/routes">Útvonalak</a>
          <a href="/events">Események</a>
          <a href="/admin">Admin</a>
        </div>
      </footer>
    </div>
  )
}