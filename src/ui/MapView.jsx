import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet-ant-path";

const tileUrls = {
  standard: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  terrain: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
};

function FlyToSelected({ selected, points, utvonalak, myPos }) {
  const map = useMap();

  useEffect(() => {
    if (!selected) return;

    if (selected.type === "utvonal") {
      const u = utvonalak.find(x => String(x.id) === String(selected.id));
      if (!u?.koordinatak) return;
      try {
        const coords = JSON.parse(u.koordinatak);
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [30, 30] });
      } catch {}
      return;
    }

    if (selected.type === "me") {
      if (myPos) map.setView(myPos, 16);
      return;
    }

    const p = points.find(x => x.tipus === selected.type && String(x.id) === String(selected.id));
    if (p?.lat && p?.lng) {
      map.setView([p.lat, p.lng], 16);
    }
  }, [selected, points, utvonalak, map, myPos]);

  return null;
}

function AntPath({ coords }) {
  const map = useMap();

  useEffect(() => {
    if (!coords?.length) return;
    const ant = L.polyline.antPath(coords, {
      color: "#007AFF",
      weight: 4,
      opacity: 0.6,
      dashArray: [10, 20],
      pulseColor: "#FFFFFF",
    }).addTo(map);

    return () => map.removeLayer(ant);
  }, [coords, map]);

  return null;
}

export default function MapView({ layerType, points, utvonalak, selected, myPos, onSelect, onMapClick }) {
  const selectedRouteCoords = useMemo(() => {
    if (!selected || selected.type !== "utvonal") return null;
    const u = utvonalak.find(x => String(x.id) === String(selected.id));
    if (!u?.koordinatak) return null;
    try { return JSON.parse(u.koordinatak); } catch { return null; }
  }, [selected, utvonalak]);

  const makeIcon = (ikon) =>
    L.divIcon({
      className: "custom-marker-wrap",
      html: `<div class="custom-marker"><i class="fas fa-${ikon}"></i></div>`,
      iconSize: [45, 45],
      iconAnchor: [22, 22],
    });

  const myPosIcon =
    L.divIcon({
      className: "location-marker-wrap",
      html: `<div class="location-marker"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

  return (
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

      {/* markerek */}
      {points.map((p) => (
        <Marker
          key={`${p.tipus}-${p.id}`}
          position={[p.lat, p.lng]}
          icon={makeIcon(p.ikon)}
          eventHandlers={{
            click: () => onSelect?.({ type: p.tipus, id: p.id }),
          }}
        >
          <Popup>
            <div style={{ minWidth: 220 }}>
              <h3 style={{ margin: "0 0 8px 0", color: "#007AFF" }}>{p.nev}</h3>
              <p style={{ margin: 0, color: "#666" }}>{p.leiras}</p>
              <div style={{ marginTop: 8, padding: 8, background: "#f0f0f0", borderRadius: 8, fontSize: 12 }}>
                <i className={`fas fa-${p.ikon}`} /> {p.tipus}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* saját helyzet */}
      {myPos && (
        <Marker
          position={myPos}
          icon={myPosIcon}
          eventHandlers={{ click: () => onSelect?.({ type: "me", id: "me" }) }}
        >
          <Popup>Saját helyzet</Popup>
        </Marker>
      )}

      {/* útvonal */}
      {selectedRouteCoords && (
        <>
          <Polyline positions={selectedRouteCoords} pathOptions={{ color: "#007AFF", weight: 6, opacity: 0.8 }} />
          <AntPath coords={selectedRouteCoords} />
        </>
      )}

      <FlyToSelected selected={selected} points={points} utvonalak={utvonalak} myPos={myPos} />
    </MapContainer>
  );
}