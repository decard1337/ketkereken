import { useEffect, useMemo } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl } from "react-leaflet"
import L from "leaflet"
import "leaflet-ant-path"
import CommunityPanel from "../components/CommunityPanel"

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
        map.fitBounds(bounds, { padding: [30, 30] })
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
      color: "#007AFF",
      weight: 4,
      opacity: 0.6,
      dashArray: [10, 20],
      pulseColor: "#FFFFFF"
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
  if (tipus === "blipp") return "blippek"
  return null
}

export default function MapView({ layerType, points, utvonalak, selected, myPos, onSelect, onOpenDetails, onMapClick }) {
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

  const selectedRoute = useMemo(() => {
    if (!selected || selected.type !== "utvonal") return null
    return utvonalak.find(x => String(x.id) === String(selected.id)) || null
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
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
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

        {points.map(p => {
          const communityType = getCommunityType(p.tipus)

          return (
            <Marker
              key={`${p.tipus}-${p.id}`}
              position={[p.lat, p.lng]}
              icon={makeIcon(p.ikon)}
              eventHandlers={{
                click: () => onSelect?.({ type: p.tipus, id: p.id })
              }}
            >
              <Popup maxWidth={430}>
                <div style={{ minWidth: 270 }}>
                  <h3 style={{ margin: "0 0 8px 0", color: "#007AFF" }}>
                    {p.nev}
                  </h3>

                  <p style={{ margin: 0, color: "#666" }}>
                    {p.leiras}
                  </p>

                  <div
                    style={{
                      marginTop: 8,
                      padding: 8,
                      background: "#f0f0f0",
                      borderRadius: 8,
                      fontSize: 12
                    }}
                  >
                    <i className={`fas fa-${p.ikon}`} /> {p.tipus}
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <button
                      onClick={() => onOpenDetails?.(p.tipus, p.id)}
                      style={{
                        width: "100%",
                        border: 0,
                        borderRadius: 10,
                        padding: "10px 12px",
                        background: "#007AFF",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 600
                      }}
                    >
                      További infó
                    </button>
                  </div>

                  {communityType && (
                    <CommunityPanel tipus={communityType} id={p.id} />
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}

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
              pathOptions={{ color: "#007AFF", weight: 6, opacity: 0.8 }}
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

      {selectedRoute && (
        <div
          style={{
            position: "absolute",
            left: 20,
            bottom: 20,
            zIndex: 800,
            width: 380,
            maxWidth: "calc(100% - 40px)",
            background: "rgba(18,22,30,.96)",
            border: "1px solid rgba(255,255,255,.10)",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 20px 60px rgba(0,0,0,.35)",
            color: "#fff",
            backdropFilter: "blur(12px)"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                {selectedRoute.cim}
              </div>

              <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>
                {selectedRoute.leiras}
              </div>
            </div>

            <button
              onClick={() => onSelect?.(null)}
              style={{
                border: 0,
                background: "transparent",
                color: "rgba(255,255,255,.7)",
                cursor: "pointer",
                fontSize: 16
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginTop: 10
            }}
          >
            {selectedRoute.hossz && (
              <span
                style={{
                  fontSize: 12,
                  padding: "6px 8px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,.08)"
                }}
              >
                {selectedRoute.hossz} km
              </span>
            )}

            {selectedRoute.nehezseg && (
              <span
                style={{
                  fontSize: 12,
                  padding: "6px 8px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,.08)"
                }}
              >
                {selectedRoute.nehezseg}
              </span>
            )}

            {selectedRoute.idotartam && (
              <span
                style={{
                  fontSize: 12,
                  padding: "6px 8px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,.08)"
                }}
              >
                {selectedRoute.idotartam}
              </span>
            )}
          </div>

          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => onOpenDetails?.("utvonal", selectedRoute.id)}
              style={{
                width: "100%",
                border: 0,
                borderRadius: 10,
                padding: "10px 12px",
                background: "#007AFF",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              További infó
            </button>
          </div>

          <CommunityPanel tipus="utvonalak" id={selectedRoute.id} />
        </div>
      )}
    </div>
  )
}