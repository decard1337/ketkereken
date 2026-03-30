import { useEffect, useMemo, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl } from "react-leaflet"
import L from "leaflet"
import "leaflet-ant-path"
import { api } from "../lib/api"

const tileUrls = {
  standard: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  terrain: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
}

function FlyToSelected({ selected, points, utvonalak, myPos }) {
  const map = useMap()

  useEffect(() => {
    if (!selected) return

    if (selected.type === "utvonal") {
      const u = utvonalak.find(x => String(x.id) === String(selected.id))
      if (!u?.koordinatak) return

      try {
        const coords = JSON.parse(u.koordinatak)
        const bounds = L.latLngBounds(coords)
        map.fitBounds(bounds, { padding: [40, 40] })
      } catch {}

      return
    }

    if (selected.type === "me") {
      if (myPos) map.setView(myPos, 16)
      return
    }

    const p = points.find(x => x.tipus === selected.type && String(x.id) === String(selected.id))
    if (p?.lat && p?.lng) {
      map.setView([p.lat, p.lng], 16)
    }
  }, [selected, points, utvonalak, map, myPos])

  return null
}

function AntPath({ coords }) {
  const map = useMap()

  useEffect(() => {
    if (!coords?.length) return

    const ant = L.polyline.antPath(coords, {
      color: "#8b5cf6",
      weight: 5,
      opacity: 0.65,
      dashArray: [10, 20],
      pulseColor: "#ffffff"
    }).addTo(map)

    return () => {
      map.removeLayer(ant)
    }
  }, [coords, map])

  return null
}

function getCommunityType(tipus) {
  if (tipus === "utvonal") return "utvonalak"
  if (tipus === "destinacio") return "destinaciok"
  if (tipus === "esemeny") return "esemenyek"
  if (tipus === "kolcsonzo") return "kolcsonzok"
  return null
}

function PopupPreview({
  item,
  onOpenDetails,
  isKedvenc,
  onToggleKedvenc,
  kedvencLoadingId,
  getCelTipusFromSelectedType
}) {
  const [kepek, setKepek] = useState([])
  const [kepIndex, setKepIndex] = useState(0)
  const [atlag, setAtlag] = useState(null)
  const [darab, setDarab] = useState(0)
  const [loading, setLoading] = useState(true)

  const communityType = getCommunityType(item.tipus)
  const celTipus = getCelTipusFromSelectedType?.(item.tipus)
  const kedvenc = isKedvenc?.(celTipus, item.id)
  const favLoading = kedvencLoadingId === `${celTipus}-${item.id}`

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!communityType || !item?.id) return

      try {
        setLoading(true)

        const [kepekRes, ertekelesRes] = await Promise.all([
          api.kepek(communityType, item.id),
          api.ertekelesek(communityType, item.id)
        ])

        if (cancelled) return

        setKepek(Array.isArray(kepekRes) ? kepekRes : [])
        setKepIndex(0)
        setAtlag(ertekelesRes?.atlag ?? null)
        setDarab(Number(ertekelesRes?.darab ?? 0))
      } catch {
        if (cancelled) return
        setKepek([])
        setAtlag(null)
        setDarab(0)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [communityType, item])

  function renderStars(value) {
    const num = Number(value)

    if (!Number.isFinite(num) || num <= 0) {
      return (
        <div className="gm-stars muted">
          <i className="fa-solid fa-star" />
          <span>Nincs még értékelés</span>
        </div>
      )
    }

    const rounded = Math.round(num)

    return (
      <div className="gm-stars">
        <span className="gm-rating-number">{num.toFixed(1)}</span>

        <div className="gm-star-icons">
          {[1, 2, 3, 4, 5].map(i => (
            <i
              key={i}
              className="fa-solid fa-star"
              style={{ opacity: i <= rounded ? 1 : 0.28 }}
            />
          ))}
        </div>

        <span className="gm-rating-count">({darab})</span>
      </div>
    )
  }

  const activeImage = kepek.length ? kepek[kepIndex] : null

  return (
    <div className="gm-popup">
      <div className="gm-popup-media">
        {kepek.length > 1 && !loading && (
          <button
            type="button"
            className="gm-popup-nav left"
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              setKepIndex(prev => (prev - 1 + kepek.length) % kepek.length)
            }}
          >
            <i className="fa-solid fa-chevron-left" />
          </button>
        )}

        <div className="gm-popup-imageFrame">
          {!loading && activeImage && (
            <div className="gm-popup-imageBtn">
              <img
                src={`http://localhost:3001${activeImage.fajl_utvonal}`}
                alt={item.nev}
                className="gm-popup-image"
              />
            </div>
          )}

          {!loading && !activeImage && (
            <div className="gm-popup-placeholder">
              <i className="fa-regular fa-image" />
              <span>Jelenleg nincs kép</span>
            </div>
          )}

          {loading && (
            <div className="gm-popup-placeholder">
              <i className="fa-solid fa-spinner fa-spin" />
              <span>Betöltés...</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className={"gm-popup-favBtn" + (kedvenc ? " active" : "")}
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            onToggleKedvenc?.(celTipus, item.id)
          }}
          title={kedvenc ? "Kedvencekből törlés" : "Kedvencekhez adás"}
          disabled={favLoading}
        >
          <i className={kedvenc ? "fa-solid fa-heart" : "fa-regular fa-heart"} />
        </button>

        {kepek.length > 1 && !loading && (
          <button
            type="button"
            className="gm-popup-nav right"
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              setKepIndex(prev => (prev + 1) % kepek.length)
            }}
          >
            <i className="fa-solid fa-chevron-right" />
          </button>
        )}
      </div>

      <div className="gm-popup-body">
        <div className="gm-popup-title">{item.nev}</div>

        {item.leiras && (
          <div className="gm-popup-subtitle">{item.leiras}</div>
        )}

        <div className="gm-popup-rating">
          {renderStars(atlag)}
        </div>

        <div className="gm-popup-footer">
          <button
            className="gm-popup-btn"
            onClick={() => onOpenDetails?.(item.tipus, item.id)}
          >
            További infók
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MapView({
  layerType,
  points,
  utvonalak,
  selected,
  myPos,
  onSelect,
  onOpenDetails,
  onMapClick,
  isKedvenc,
  onToggleKedvenc,
  kedvencLoadingId,
  getCelTipusFromSelectedType
}) {
  const selectedRouteCoords = useMemo(() => {
    if (!selected || selected.type !== "utvonal") return null

    const u = utvonalak.find(x => String(x.id) === String(selected.id))
    if (!u?.koordinatak) return null

    try {
      return JSON.parse(u.koordinatak)
    } catch {
      return null
    }
  }, [selected, utvonalak])

  const makeIcon = ikon =>
    L.divIcon({
      className: "custom-marker-wrap",
      html: `<div class="custom-marker"><i class="fas fa-${ikon}"></i></div>`,
      iconSize: [45, 45],
      iconAnchor: [22, 22]
    })

  const myPosIcon = L.divIcon({
    className: "location-marker-wrap",
    html: `<div class="location-marker"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })

  return (
    <div className="map-stage">
      <MapContainer
        center={[47.4979, 19.0402]}
        zoom={13}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
        eventHandlers={{
          click: () => onMapClick?.()
        }}
      >
        <ZoomControl position="topright" />
        <TileLayer url={tileUrls[layerType] ?? tileUrls.standard} maxZoom={20} />

        {points.map(p => (
          <Marker
            key={`${p.tipus}-${p.id}`}
            position={[p.lat, p.lng]}
            icon={makeIcon(p.ikon)}
            eventHandlers={{
              click: () => onSelect?.({ type: p.tipus, id: p.id })
            }}
          >
            <Popup maxWidth={360} className="gm-popup-wrap" closeButton>
              <PopupPreview
                item={p}
                onOpenDetails={onOpenDetails}
                isKedvenc={isKedvenc}
                onToggleKedvenc={onToggleKedvenc}
                kedvencLoadingId={kedvencLoadingId}
                getCelTipusFromSelectedType={getCelTipusFromSelectedType}
              />
            </Popup>
          </Marker>
        ))}

        {myPos && (
          <Marker
            position={myPos}
            icon={myPosIcon}
            eventHandlers={{
              click: () => onSelect?.({ type: "me", id: "me" })
            }}
          >
            <Popup>Saját helyzet</Popup>
          </Marker>
        )}

        {selectedRouteCoords && (
          <>
            <Polyline
              positions={selectedRouteCoords}
              pathOptions={{ color: "#8b5cf6", weight: 6, opacity: 0.86 }}
            />
            <AntPath coords={selectedRouteCoords} />
          </>
        )}

        <FlyToSelected
          selected={selected}
          points={points}
          utvonalak={utvonalak}
          myPos={myPos}
        />
      </MapContainer>
    </div>
  )
}