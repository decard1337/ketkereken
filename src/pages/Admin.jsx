import { useEffect, useMemo, useRef, useState } from "react"
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet"
import L from "leaflet"
import { api } from "../lib/api"
import "../styles/admin.css"

const darkTiles = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"

const RES = [
  { key: "utvonalak", label: "Útvonalak", icon: "fa-route" },
  { key: "esemenyek", label: "Események", icon: "fa-calendar-days" },
  { key: "destinaciok", label: "Desztinációk", icon: "fa-location-dot" },
  { key: "kolcsonzok", label: "Kölcsönzők", icon: "fa-bicycle" },
  { key: "blippek", label: "Blippek", icon: "fa-layer-group" },
  { key: "menu", label: "Menü", icon: "fa-bars" },
  { key: "users", label: "Users", icon: "fa-user" }
]

function emptyFor(resource) {
  if (resource === "utvonalak") return { cim: "", leiras: "", koordinatak: "[]", hossz: "", nehezseg: "konnyu", statusz: "aktiv", idotartam: "", szintkulonbseg: "" }
  if (resource === "esemenyek") return { nev: "", leiras: "", lat: "", lng: "", datum: "", resztvevok: "", tipus: "esemeny", statusz: "aktiv" }
  if (resource === "destinaciok") return { nev: "", leiras: "", lat: "", lng: "", ertekeles: "", tipus: "latnivalo", statusz: "aktiv" }
  if (resource === "kolcsonzok") return { nev: "", cim: "", lat: "", lng: "", ar: "", telefon: "", nyitvatartas: "", statusz: "aktiv" }
  if (resource === "blippek") return { nev: "", leiras: "", lat: "", lng: "", tipus: "altalanos", ikon: "circle", statusz: "aktiv" }
  if (resource === "menu") return { nev: "", link: "", statusz: "aktiv", sorrend: "" }
  if (resource === "users") return { username: "", email: "", role: "user" }
  return {}
}

function markerIcon(fa, active) {
  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;border-radius:12px;background:${active ? "rgba(0,122,255,.90)" : "rgba(255,255,255,.10)"};border:1px solid ${active ? "rgba(0,122,255,.90)" : "rgba(255,255,255,.16)"};display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px)"><i class="fa-solid ${fa}" style="color:rgba(255,255,255,.92);font-size:13px"></i></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  })
}

function parseRouteCoords(v) {
  try {
    const arr = JSON.parse(v || "[]")
    if (!Array.isArray(arr) || arr.length < 2) return null
    return arr
  } catch {
    return null
  }
}

function MapAutoResize({ targetRef }) {
  const map = useMap()

  useEffect(() => {
    const el = targetRef?.current
    if (!el) return

    let raf = 0

    const run = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        map.invalidateSize(true)
      })
    }

    run()

    const ro = new ResizeObserver(() => run())
    ro.observe(el)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [map, targetRef])

  return null
}

export default function Admin() {
  const [resource, setResource] = useState("utvonalak")
  const [data, setData] = useState({})
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(emptyFor("utvonalak"))
  const [query, setQuery] = useState("")
  const [editorOpen, setEditorOpen] = useState(false)
  const [pickMode, setPickMode] = useState(false)
  const [err, setErr] = useState("")
  const [ok, setOk] = useState("")
  const [pendingPick, setPendingPick] = useState(null)

  const mapRef = useRef(null)
  const mapWrapRef = useRef(null)

  const resMeta = useMemo(() => RES.find(r => r.key === resource) || RES[0], [resource])

  const titleKey = useMemo(() => {
    if (resource === "utvonalak") return "cim"
    if (resource === "users") return "username"
    return "nev"
  }, [resource])

  const hasLatLng = useMemo(() => resource !== "utvonalak" && resource !== "menu" && resource !== "users", [resource])

  async function loadOne(key) {
    const items = await api.adminList(key)
    setData(p => ({ ...p, [key]: items }))
    return items
  }

  async function loadAll() {
    const keys = RES.map(r => r.key)
    const results = await Promise.allSettled(keys.map(k => api.adminList(k)))
    const out = {}
    keys.forEach((k, i) => {
      out[k] = results[i].status === "fulfilled" ? (results[i].value || []) : []
    })
    setData(out)
  }

  useEffect(() => { loadAll() }, [])

  useEffect(() => {
    setQuery("")
    setSelectedId(null)
    setForm(emptyFor(resource))
    setEditorOpen(false)
    setPickMode(false)
    setErr("")
    setOk("")
    loadOne(resource).catch(() => {})
  }, [resource])

  const listItems = useMemo(() => data[resource] || [], [data, resource])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return listItems
    return listItems.filter(it => {
      const a = String(it.id ?? "").toLowerCase()
      const b = String(it[titleKey] ?? "").toLowerCase()
      const c = String(it.email ?? it.leiras ?? it.cim ?? "").toLowerCase()
      return a.includes(q) || b.includes(q) || c.includes(q)
    })
  }, [listItems, query, titleKey])

  const allMarkers = useMemo(() => {
    const out = []
    for (const r of RES) {
      const items = data[r.key] || []
      for (const it of items) {
        const lat = Number(it.lat)
        const lng = Number(it.lng)
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
        out.push({ resource: r.key, id: it.id, lat, lng })
      }
    }
    return out
  }, [data])

  const allRoutes = useMemo(() => data.utvonalak || [], [data])

  function zoomToItem(resKey, item) {
    if (!mapRef.current || !item) return

    if (resKey === "utvonalak") {
      const coords = parseRouteCoords(item.koordinatak)
      if (!coords) return
      const b = L.latLngBounds(coords.map(p => L.latLng(p[0], p[1])))
      mapRef.current.fitBounds(b, { padding: [60, 60], animate: true })
      return
    }

    const lat = Number(item.lat)
    const lng = Number(item.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
    mapRef.current.flyTo([lat, lng], 15, { animate: true })
  }

  function openNew() {
    setSelectedId(null)
    setForm(emptyFor(resource))
    setEditorOpen(true)
    setPickMode(hasLatLng)
    setErr("")
    setOk("")
  }

  function openEdit(resKey, item) {
    setErr("")
    setOk("")
    setPickMode(false)
    setSelectedId(item?.id ?? null)
    setForm(item ? { ...item } : emptyFor(resKey))
    setEditorOpen(true)
    requestAnimationFrame(() => requestAnimationFrame(() => zoomToItem(resKey, item)))
  }

  function closeEditor() {
    setEditorOpen(false)
    setPickMode(false)
    setSelectedId(null)
    setForm(emptyFor(resource))
    setErr("")
    setOk("")
  }

  function setField(k, v) {
    setForm(p => ({ ...p, [k]: v }))
  }

  async function save() {
    setErr("")
    setOk("")
    try {
      if (selectedId) {
        await api.adminUpdate(resource, selectedId, form)
        setOk("Mentve")
      } else {
        const created = await api.adminCreate(resource, form)
        setSelectedId(created.id)
        setOk("Létrehozva")
      }
      await loadOne(resource)
      await loadAll()
      setPickMode(false)
    } catch (e) {
      setErr(e.message || "Hiba")
    }
  }

  async function del() {
    if (!selectedId) return
    setErr("")
    setOk("")
    try {
      await api.adminDelete(resource, selectedId)
      setOk("Törölve")
      setSelectedId(null)
      setForm(emptyFor(resource))
      setEditorOpen(false)
      setPickMode(false)
      await loadOne(resource)
      await loadAll()
    } catch (e) {
      setErr(e.message || "Hiba")
    }
  }

  function jumpTo(resourceKey, id, lat, lng) {
    if (resourceKey === resource) {
      const item = (data[resourceKey] || []).find(x => String(x.id) === String(id))
      if (item) openEdit(resourceKey, item)
      else {
        setSelectedId(id)
        setEditorOpen(true)
        if (Number.isFinite(lat) && Number.isFinite(lng) && mapRef.current) {
          requestAnimationFrame(() => mapRef.current.flyTo([lat, lng], 15, { animate: true }))
        }
      }
      return
    }
    setPendingPick({ resource: resourceKey, id, lat, lng })
    setResource(resourceKey)
  }

  useEffect(() => {
    if (!pendingPick) return
    const arr = data[pendingPick.resource] || []
    const item = arr.find(x => String(x.id) === String(pendingPick.id))
    if (item) {
      openEdit(pendingPick.resource, item)
      setPendingPick(null)
      return
    }
    if (mapRef.current && Number.isFinite(pendingPick.lat) && Number.isFinite(pendingPick.lng)) {
      requestAnimationFrame(() => mapRef.current.flyTo([pendingPick.lat, pendingPick.lng], 15, { animate: true }))
      setEditorOpen(true)
    }
  }, [data, pendingPick])

  function onMapClick(e) {
    if (!editorOpen) return
    if (!hasLatLng) return
    if (!pickMode) return
    setField("lat", String(e.latlng.lat))
    setField("lng", String(e.latlng.lng))
  }

  return (
    <div className={"adm2 " + (editorOpen ? "editing" : "")}>
      <div className={"adm2-sidebar " + (editorOpen ? "hide" : "")}>
        <div className="adm2-brand">
          <div className="adm2-logo"><i className="fa-solid fa-shield-halved" /></div>
        </div>

        <div className="adm2-nav">
          {RES.map(r => (
            <button
              key={r.key}
              className={"adm2-navbtn " + (resource === r.key ? "active" : "")}
              onClick={() => { setPendingPick(null); setResource(r.key) }}
              title={r.label}
            >
              <i className={"fa-solid " + r.icon} />
            </button>
          ))}
        </div>
      </div>

      <div className={"adm2-list " + (editorOpen ? "hide" : "")}>
        <div className="adm2-listhead">
          <div className="adm2-title">{resMeta.label}</div>
          <button className="adm2-iconbtn" onClick={openNew} title="Új">
            <i className="fa-solid fa-plus" />
          </button>
        </div>

        <div className="adm2-search">
          <input
            className="adm2-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Keresés..."
          />
          <button className="adm2-iconbtn" onClick={() => setQuery("")} title="Törlés">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="adm2-items">
          {filtered.map(it => (
            <button
              key={it.id}
              className={"adm2-item " + (String(it.id) === String(selectedId) ? "active" : "")}
              onClick={() => openEdit(resource, it)}
            >
              <div className="adm2-itemtitle">
                {resource === "users" ? (it.username || it.email || `#${it.id}`) : (it[titleKey] ?? `#${it.id}`)}
              </div>
              <div className="adm2-itemsub">
                {resource === "users" ? (it.email || `ID: ${it.id}`) : `ID: ${it.id}`}
              </div>
            </button>
          ))}

          <button className="adm2-item adm2-new" onClick={openNew}>
            <div className="adm2-itemtitle"><i className="fa-solid fa-plus" style={{ marginRight: 10 }} /> Új hozzáadása</div>
            <div className="adm2-itemsub">Üres űrlap</div>
          </button>
        </div>
      </div>

      <div className="adm2-mapwrap" ref={mapWrapRef}>
        <MapContainer
          center={[47.4979, 19.0402]}
          zoom={12}
          zoomControl={false}
          className="adm2-map"
          whenCreated={m => {
            mapRef.current = m
            m.on("click", onMapClick)
          }}
        >
          <MapAutoResize targetRef={mapWrapRef} />
          <TileLayer url={darkTiles} />

          {allMarkers.map(m => {
            const meta = RES.find(r => r.key === m.resource)
            const fa = meta?.icon || "fa-location-dot"
            const active = m.resource === resource && String(m.id) === String(selectedId)
            const draggable = m.resource === resource && editorOpen && hasLatLng && String(m.id) === String(selectedId)

            const item = (data[m.resource] || []).find(x => String(x.id) === String(m.id))
            if (!item) return null

            return (
              <Marker
                key={`${m.resource}-${m.id}`}
                position={[m.lat, m.lng]}
                icon={markerIcon(fa, active)}
                draggable={draggable}
                eventHandlers={{
                  click: () => jumpTo(m.resource, m.id, m.lat, m.lng),
                  dragend: e => {
                    const ll = e.target.getLatLng()
                    setField("lat", String(ll.lat))
                    setField("lng", String(ll.lng))
                    requestAnimationFrame(() => requestAnimationFrame(() => {
                      if (mapRef.current) mapRef.current.flyTo([ll.lat, ll.lng], mapRef.current.getZoom(), { animate: true })
                    }))
                  }
                }}
              />
            )
          })}

          {allRoutes.map(r => {
            const coords = parseRouteCoords(r.koordinatak)
            if (!coords) return null
            const active = resource === "utvonalak" && String(r.id) === String(selectedId)
            return (
              <Polyline
                key={`r-${r.id}`}
                positions={coords}
                pathOptions={{
                  weight: active ? 6 : 4,
                  opacity: active ? 1 : 0.25,
                  color: active ? "#007aff" : "#6b7280"
                }}
              />
            )
          })}
        </MapContainer>

        <div className={"adm2-modal " + (editorOpen ? "open" : "")}>
          <div className="adm2-modalOverlay" onClick={closeEditor} />
          <div className="adm2-modalCard">
            <div className="adm2-editorhead">
              <div className="adm2-editortitle">
                {selectedId ? `Szerkesztés #${selectedId}` : "Új elem"}
              </div>

              <div className="adm2-editoractions">
                {hasLatLng && (
                  <button
                    className={"adm2-chip " + (pickMode ? "on" : "")}
                    onClick={() => setPickMode(p => !p)}
                    title="Kattints a térképre lat/lng-hez"
                  >
                    <i className="fa-solid fa-location-crosshairs" />
                    <span>Pick</span>
                  </button>
                )}

                <button className="adm2-iconbtn" onClick={closeEditor} title="Bezár">
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
            </div>

            {err && <div className="adm2-msg err">{err}</div>}
            {ok && <div className="adm2-msg ok">{ok}</div>}

            <div className="adm2-form adm2-formModal">
              {Object.keys(form).map(k => (
                <label key={k} className={"adm2-field " + (k === "koordinatak" ? "wide" : "")}>
                  <div className="adm2-label">{k}</div>
                  {k === "koordinatak" ? (
                    <textarea className="adm2-area" value={form[k] ?? ""} onChange={e => setField(k, e.target.value)} rows={7} />
                  ) : (
                    <input className="adm2-input2" value={form[k] ?? ""} onChange={e => setField(k, e.target.value)} />
                  )}
                </label>
              ))}
            </div>

            <div className="adm2-bottom">
              <button className="adm2-btn danger" onClick={del} disabled={!selectedId}>
                <i className="fa-solid fa-trash" />
                <span>Törlés</span>
              </button>
              <button className="adm2-btn primary" onClick={save}>
                <i className="fa-solid fa-floppy-disk" />
                <span>Mentés</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}