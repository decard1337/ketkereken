import { useEffect, useMemo, useRef, useState } from "react"
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet"
import L from "leaflet"
import { api } from "../lib/api"
import "../styles/admin.css"
import { formatDateForInput } from "../lib/date"

const darkTiles = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"

const RES = [
  { key: "utvonalak", label: "Útvonalak", icon: "fa-route" },
  { key: "esemenyek", label: "Események", icon: "fa-calendar-days" },
  { key: "destinaciok", label: "Desztinációk", icon: "fa-location-dot" },
  { key: "kolcsonzok", label: "Kölcsönzők", icon: "fa-bicycle" },
  { key: "felhasznalok", label: "Felhasználók", icon: "fa-user" },
  { key: "jovahagyasok", label: "Jóváhagyások", icon: "fa-shield-halved" }
]

function emptyFor(resource) {
  if (resource === "utvonalak") {
    return {
      cim: "",
      leiras: "",
      koordinatak: "[]",
      hossz: "",
      nehezseg: "konnyu",
      statusz: "aktiv",
      idotartam: "",
      szintkulonbseg: ""
    }
  }

  if (resource === "esemenyek") {
    return {
      nev: "",
      leiras: "",
      lat: "",
      lng: "",
      datum: "",
      resztvevok: "",
      tipus: "esemeny",
      statusz: "aktiv",
      utvonal_id: ""
    }
  }

  if (resource === "destinaciok") {
    return {
      nev: "",
      leiras: "",
      lat: "",
      lng: "",
      ertekeles: "",
      tipus: "latnivalo",
      statusz: "aktiv"
    }
  }

  if (resource === "kolcsonzok") {
    return {
      nev: "",
      cim: "",
      lat: "",
      lng: "",
      ar: "",
      telefon: "",
      nyitvatartas: "",
      statusz: "aktiv"
    }
  }

  if (resource === "felhasznalok") {
    return {
      email: "",
      felhasznalonev: "",
      rang: "felhasznalo",
      profilkep: "",
      bio: ""
    }
  }

  return {}
}

function markerIcon(fa, active) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:30px;
      height:30px;
      border-radius:12px;
      background:${active ? "linear-gradient(135deg, rgba(139,92,246,.95), rgba(99,102,241,.95))" : "rgba(255,255,255,.08)"};
      border:1px solid ${active ? "rgba(139,92,246,.55)" : "rgba(255,255,255,.12)"};
      display:flex;
      align-items:center;
      justify-content:center;
      backdrop-filter:blur(10px);
      box-shadow:${active ? "0 10px 24px rgba(99,102,241,.35)" : "0 8px 20px rgba(0,0,0,.18)"}
    "><i class="fa-solid ${fa}" style="color:rgba(255,255,255,.96);font-size:13px"></i></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
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
      raf = requestAnimationFrame(() => map.invalidateSize(true))
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

function ApprovalCard({ type, item, onAccept, onReject, rejectDraft, setRejectDraft }) {
  const [showReject, setShowReject] = useState(false)

  const title =
    type === "ertekeles"
      ? "Értékelés"
      : "Kép"

  const itemTitle = item.cel_title || `${item.cel_tipus} #${item.cel_id}`

  return (
    <div className="adm3-approvalCard">
      <div className="adm3-approvalTop">
        <div>
          <div className="adm3-approvalTitle">
            {item.username || item.felhasznalonev || "Ismeretlen felhasználó"} {title.toLowerCase()}
          </div>

          <div className="adm3-approvalMeta">
            <span>{type === "ertekeles" ? "Értékelés" : "Kép"}</span>
            <span>{itemTitle}</span>
            <a
              className="adm3-profileLink"
              href={`/u/${item.username || item.felhasznalonev}`}
              target="_blank"
              rel="noreferrer"
            >
              Profil megnyitása
            </a>
          </div>
        </div>

        <div className="adm3-approvalActions">
          <button className="adm3-btn success" onClick={() => onAccept(type, item.id)}>
            <i className="fa-solid fa-check" />
            <span>Elfogad</span>
          </button>

          <button
            className="adm3-btn danger"
            onClick={() => setShowReject(v => !v)}
          >
            <i className="fa-solid fa-xmark" />
            <span>Elutasít</span>
          </button>
        </div>
      </div>

      {type === "ertekeles" && (
        <div className="adm3-approvalBody">
          <div className="adm3-ratingLine">
            {"★".repeat(Number(item.pontszam || 0))}
            {"☆".repeat(5 - Number(item.pontszam || 0))}
          </div>
          {item.szoveg && <div className="adm3-approvalText">{item.szoveg}</div>}
        </div>
      )}

      {type === "kep" && (
        <div className="adm3-approvalBody">
          <img
            className="adm3-approvalImage"
            src={`http://localhost:3001${item.fajl_utvonal}`}
            alt=""
          />
          {item.leiras && <div className="adm3-approvalText">{item.leiras}</div>}
        </div>
      )}

      {showReject && (
        <div className="adm3-rejectBox">
          <textarea
            className="adm3-area"
            rows={3}
            placeholder="Elutasítás indoka..."
            value={rejectDraft}
            onChange={e => setRejectDraft(e.target.value)}
          />

          <div className="adm3-rejectActions">
            <button
              className="adm3-btn danger"
              onClick={() => {
                onReject(type, item.id, rejectDraft)
                setShowReject(false)
              }}
            >
              <i className="fa-solid fa-paper-plane" />
              <span>Elutasítás mentése</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
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
  const [approvals, setApprovals] = useState({ ertekelesek: [], kepek: [] })
  const [loadingApprovals, setLoadingApprovals] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [userProfileImageFile, setUserProfileImageFile] = useState(null)
  const [rejectDrafts, setRejectDrafts] = useState({})

  const mapRef = useRef(null)
  const mapWrapRef = useRef(null)

  const resMeta = useMemo(() => RES.find(r => r.key === resource) || RES[0], [resource])

  const titleKey = useMemo(() => {
    if (resource === "utvonalak") return "cim"
    if (resource === "felhasznalok") return "felhasznalonev"
    return "nev"
  }, [resource])

  const hasLatLng = useMemo(
    () => !["utvonalak", "felhasznalok", "jovahagyasok"].includes(resource),
    [resource]
  )

  async function loadOne(key) {
    if (key === "jovahagyasok") {
      setLoadingApprovals(true)
      try {
        const res = await api.adminJovahagyando()
        setApprovals({
          ertekelesek: res?.ertekelesek || [],
          kepek: res?.kepek || []
        })
      } finally {
        setLoadingApprovals(false)
      }
      return []
    }

    const items = await api.adminList(key)
    setData(prev => ({ ...prev, [key]: items }))
    return items
  }

  async function loadAll() {
    const keys = RES.filter(r => r.key !== "jovahagyasok").map(r => r.key)
    const results = await Promise.allSettled(keys.map(k => api.adminList(k)))
    const out = {}

    keys.forEach((k, i) => {
      out[k] = results[i].status === "fulfilled" ? (results[i].value || []) : []
    })

    setData(out)

    try {
      const pending = await api.adminJovahagyando()
      setApprovals({
        ertekelesek: pending?.ertekelesek || [],
        kepek: pending?.kepek || []
      })
    } catch {
      setApprovals({ ertekelesek: [], kepek: [] })
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    setQuery("")
    setSelectedId(null)
    setForm(emptyFor(resource))
    setEditorOpen(false)
    setPickMode(false)
    setErr("")
    setOk("")
    setNewPassword("")
    setUserProfileImageFile(null)

    loadOne(resource).catch(() => {})
  }, [resource])

  const listItems = useMemo(() => {
    if (resource === "jovahagyasok") return []
    return data[resource] || []
  }, [data, resource])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return listItems

    return listItems.filter(it => {
      const a = String(it.id ?? "").toLowerCase()
      const b = String(it[titleKey] ?? "").toLowerCase()
      const c = String(
        it.email ??
          it.leiras ??
          it.cim ??
          it.bio ??
          it.telefon ??
          ""
      ).toLowerCase()

      return a.includes(q) || b.includes(q) || c.includes(q)
    })
  }, [listItems, query, titleKey])

  const allMarkers = useMemo(() => {
    const out = []

    for (const r of RES) {
      if (["felhasznalok", "jovahagyasok"].includes(r.key)) continue

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
    if (resource === "jovahagyasok") return
    setSelectedId(null)
    setForm(emptyFor(resource))
    setEditorOpen(true)
    setPickMode(hasLatLng)
    setErr("")
    setOk("")
    setNewPassword("")
    setUserProfileImageFile(null)
  }

  function openEdit(resKey, item) {
    if (resKey === "jovahagyasok") return
    setErr("")
    setOk("")
    setPickMode(false)
    setSelectedId(item?.id ?? null)
    setForm(item ? { ...item } : emptyFor(resKey))
    setEditorOpen(true)
    setNewPassword("")
    setUserProfileImageFile(null)
    requestAnimationFrame(() => requestAnimationFrame(() => zoomToItem(resKey, item)))
  }

  function closeEditor() {
    setEditorOpen(false)
    setPickMode(false)
    setSelectedId(null)
    setForm(emptyFor(resource))
    setErr("")
    setOk("")
    setNewPassword("")
    setUserProfileImageFile(null)
  }

  function setField(k, v) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function save() {
    if (resource === "jovahagyasok") return

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
    if (!selectedId || resource === "jovahagyasok") return

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
      else if (Number.isFinite(lat) && Number.isFinite(lng) && mapRef.current) {
        setSelectedId(id)
        setEditorOpen(true)
        requestAnimationFrame(() => mapRef.current.flyTo([lat, lng], 15, { animate: true }))
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

  async function handleAccept(type, id) {
    try {
      await api.adminElfogad(type, id)
      await loadOne("jovahagyasok")
    } catch (e) {
      setErr(e.message || "Elfogadási hiba")
    }
  }

  async function handleReject(type, id, indok) {
    try {
      await api.adminElutasit(type, id, indok)
      setRejectDrafts(prev => ({ ...prev, [`${type}-${id}`]: "" }))
      await loadOne("jovahagyasok")
    } catch (e) {
      setErr(e.message || "Elutasítási hiba")
    }
  }

  async function handleResetPassword() {
    if (!selectedId || !newPassword.trim()) return
    try {
      await api.adminResetPassword(selectedId, newPassword.trim())
      setOk("Új jelszó beállítva")
      setNewPassword("")
    } catch (e) {
      setErr(e.message || "Jelszó módosítási hiba")
    }
  }

  async function handleUserProfileImageUpload() {
    if (!selectedId || !userProfileImageFile) return
    try {
      const updated = await api.adminUploadUserProfileImage(selectedId, userProfileImageFile)
      setForm(prev => ({ ...prev, profilkep: updated?.profilkep || prev.profilkep }))
      setOk("Profilkép frissítve")
      setUserProfileImageFile(null)
      await loadOne("felhasznalok")
    } catch (e) {
      setErr(e.message || "Profilkép mentési hiba")
    }
  }

  const approvalsCount = (approvals.ertekelesek?.length || 0) + (approvals.kepek?.length || 0)

  return (
    <div className={"adm3 " + (editorOpen ? "editing" : "")}>
      <aside className={"adm3-sidebar " + (editorOpen ? "hide" : "")}>
        <div className="adm3-brand">
          <div className="adm3-logo">
            <i className="fa-solid fa-shield-halved" />
          </div>
        </div>

        <div className="adm3-nav">
          {RES.map(r => (
            <button
              key={r.key}
              className={"adm3-navbtn " + (resource === r.key ? "active" : "")}
              onClick={() => {
                setPendingPick(null)
                setResource(r.key)
              }}
              title={r.label}
            >
              <i className={"fa-solid " + r.icon} />
              {r.key === "jovahagyasok" && approvalsCount > 0 && (
                <span className="adm3-badge">{approvalsCount}</span>
              )}
            </button>
          ))}
        </div>
      </aside>

      <section className={"adm3-list " + (editorOpen ? "hide" : "")}>
        <div className="adm3-listhead">
          <div>
            <div className="adm3-title">{resMeta.label}</div>
            <div className="adm3-subtitle">
              {resource === "jovahagyasok"
                ? "Beküldött értékelések és képek kezelése"
                : "Elemek kezelése, szerkesztése és létrehozása"}
            </div>
          </div>

          {resource !== "jovahagyasok" && (
            <button className="adm3-iconbtn" onClick={openNew} title="Új">
              <i className="fa-solid fa-plus" />
            </button>
          )}
        </div>

        {resource !== "jovahagyasok" ? (
          <>
            <div className="adm3-search">
              <input
                className="adm3-input"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Keresés..."
              />
              <button className="adm3-iconbtn" onClick={() => setQuery("")} title="Törlés">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="adm3-items">
              {filtered.map(it => (
                <button
                  key={it.id}
                  className={"adm3-item " + (String(it.id) === String(selectedId) ? "active" : "")}
                  onClick={() => openEdit(resource, it)}
                >
                  <div className="adm3-itemtitle">
                    {resource === "felhasznalok"
                      ? (it.felhasznalonev || it.email || `#${it.id}`)
                      : (it[titleKey] ?? `#${it.id}`)}
                  </div>

                  <div className="adm3-itemsub">
                    {resource === "felhasznalok"
                      ? (it.email || `ID: ${it.id}`)
                      : `ID: ${it.id}`}
                  </div>
                </button>
              ))}

              <button className="adm3-item adm3-new" onClick={openNew}>
                <div className="adm3-itemtitle">
                  <i className="fa-solid fa-plus" style={{ marginRight: 10 }} />
                  Új hozzáadása
                </div>
              </button>
            </div>
          </>
        ) : (
          <div className="adm3-approvalsWrap">
            {loadingApprovals && <div className="adm3-infoBox">Betöltés...</div>}

            {!loadingApprovals && approvalsCount === 0 && (
              <div className="adm3-infoBox">Nincs jóváhagyásra váró elem.</div>
            )}

            {!!approvals.ertekelesek?.length && (
              <div className="adm3-approvalSection">
                <div className="adm3-sectionTitle">Értékelések</div>
                <div className="adm3-approvalGrid">
                  {approvals.ertekelesek.map(item => (
                    <ApprovalCard
                      key={`ertekeles-${item.id}`}
                      type="ertekeles"
                      item={item}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      rejectDraft={rejectDrafts[`ertekeles-${item.id}`] || ""}
                      setRejectDraft={value =>
                        setRejectDrafts(prev => ({ ...prev, [`ertekeles-${item.id}`]: value }))
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {!!approvals.kepek?.length && (
              <div className="adm3-approvalSection">
                <div className="adm3-sectionTitle">Képek</div>
                <div className="adm3-approvalGrid">
                  {approvals.kepek.map(item => (
                    <ApprovalCard
                      key={`kep-${item.id}`}
                      type="kep"
                      item={item}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      rejectDraft={rejectDrafts[`kep-${item.id}`] || ""}
                      setRejectDraft={value =>
                        setRejectDrafts(prev => ({ ...prev, [`kep-${item.id}`]: value }))
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="adm3-mapwrap" ref={mapWrapRef}>
        <MapContainer
          center={[47.4979, 19.0402]}
          zoom={12}
          zoomControl={false}
          className="adm3-map"
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
            const draggable =
              m.resource === resource &&
              editorOpen &&
              hasLatLng &&
              String(m.id) === String(selectedId)

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
                      if (mapRef.current) {
                        mapRef.current.flyTo([ll.lat, ll.lng], mapRef.current.getZoom(), { animate: true })
                      }
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
                  color: active ? "#8b5cf6" : "#6b7280"
                }}
              />
            )
          })}
        </MapContainer>

        {resource !== "jovahagyasok" && (
          <div className={"adm3-modal " + (editorOpen ? "open" : "")}>
            <div className="adm3-modalOverlay" onClick={closeEditor} />

            <div className="adm3-modalCard">
              <div className="adm3-editorhead">
                <div>
                  <div className="adm3-editortitle">
                    {selectedId ? `Szerkesztés #${selectedId}` : "Új elem"}
                  </div>
                  <div className="adm3-editorsub">
                    {resMeta.label}
                  </div>
                </div>

                <div className="adm3-editoractions">
                  {hasLatLng && (
                    <button
                      className={"adm3-chip " + (pickMode ? "on" : "")}
                      onClick={() => setPickMode(p => !p)}
                      title="Kattints a térképre lat/lng-hez"
                    >
                      <i className="fa-solid fa-location-crosshairs" />
                      <span>Pick</span>
                    </button>
                  )}

                  <button className="adm3-iconbtn" onClick={closeEditor} title="Bezár">
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
              </div>

              {err && <div className="adm3-msg err">{err}</div>}
              {ok && <div className="adm3-msg ok">{ok}</div>}

              <div className="adm3-form adm3-formModal">
                {Object.keys(form).map(k => (
                  <label key={k} className={"adm3-field " + (k === "koordinatak" || k === "bio" ? "wide" : "")}>
                    <div className="adm3-label">{k}</div>

                    {k === "koordinatak" ? (
                      <textarea
                        className="adm3-area"
                        value={form[k] ?? ""}
                        onChange={e => setField(k, e.target.value)}
                        rows={7}
                      />
                    ) : k === "bio" ? (
                      <textarea
                        className="adm3-area"
                        value={form[k] ?? ""}
                        onChange={e => setField(k, e.target.value)}
                        rows={5}
                      />
                    ) : k === "datum" ? (
                      <input
                        type="date"
                        className="adm3-input2"
                        value={formatDateForInput(form[k])}
                        onChange={e => setField(k, e.target.value)}
                      />
                    ) : (
                      <input
                        className="adm3-input2"
                        value={form[k] ?? ""}
                        onChange={e => setField(k, e.target.value)}
                      />
                    )}
                  </label>
                ))}

                {resource === "felhasznalok" && (
                  <>
                    <div className="adm3-field wide">
                      <div className="adm3-label">Jelenlegi profilkép</div>
                      <div className="adm3-userPreview">
                        {form.profilkep ? (
                          <img
                            className="adm3-userPreviewImg"
                            src={`http://localhost:3001${form.profilkep}`}
                            alt=""
                          />
                        ) : (
                          <div className="adm3-userPreviewEmpty">Nincs profilkép</div>
                        )}
                      </div>
                    </div>

                    <div className="adm3-field wide">
                      <div className="adm3-label">Új profilkép feltöltése</div>
                      <input
                        className="adm3-input2"
                        type="file"
                        accept="image/*"
                        onChange={e => setUserProfileImageFile(e.target.files?.[0] || null)}
                      />
                      <div style={{ marginTop: 10 }}>
                        <button
                          className="adm3-btn"
                          type="button"
                          onClick={handleUserProfileImageUpload}
                          disabled={!selectedId || !userProfileImageFile}
                        >
                          <i className="fa-solid fa-image" />
                          <span>Profilkép frissítése</span>
                        </button>
                      </div>
                    </div>

                    <div className="adm3-field wide">
                      <div className="adm3-label">Új jelszó</div>
                      <input
                        className="adm3-input2"
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Adj meg új jelszót..."
                      />
                      <div style={{ marginTop: 10 }}>
                        <button
                          className="adm3-btn"
                          type="button"
                          onClick={handleResetPassword}
                          disabled={!selectedId || !newPassword.trim()}
                        >
                          <i className="fa-solid fa-key" />
                          <span>Jelszó módosítása</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="adm3-bottom">
                <button className="adm3-btn danger" onClick={del} disabled={!selectedId}>
                  <i className="fa-solid fa-trash" />
                  <span>Törlés</span>
                </button>

                <button className="adm3-btn primary" onClick={save}>
                  <i className="fa-solid fa-floppy-disk" />
                  <span>Mentés</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}