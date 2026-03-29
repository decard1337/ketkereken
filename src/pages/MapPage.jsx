import { useEffect, useMemo, useState } from "react"
import { api } from "../lib/api"

import Splash from "../ui/Splash"
import Sidebar from "../ui/Sidebar"
import BottomControls from "../ui/BottomControls"
import LayerPanel from "../ui/LayerPanel"
import Panels from "../ui/Panels"
import MapView from "../ui/MapView"

const STATIC_MENU = [
  { id: 1, nev: "Útvonalak", link: "utvonalak", ikon: "route" },
  { id: 2, nev: "Desztinációk", link: "destinaciok", ikon: "map-marker-alt" },
  { id: 3, nev: "Események", link: "esemenyek", ikon: "calendar-alt" },
  { id: 4, nev: "Kölcsönzők", link: "kolcsonzok", ikon: "bicycle" }
]

export default function MapPage() {
  const [loading, setLoading] = useState(true)

  const [menu] = useState(STATIC_MENU)
  const [utvonalak, setUtvonalak] = useState([])
  const [destinaciok, setDestinaciok] = useState([])
  const [esemenyek, setEsemenyek] = useState([])
  const [kolcsonzok, setKolcsonzok] = useState([])

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [layerPanelOpen, setLayerPanelOpen] = useState(false)

  const [activePanel, setActivePanel] = useState(null)
  const [selected, setSelected] = useState(null)

  const [layerType, setLayerType] = useState("standard")
  const [myPos, setMyPos] = useState(null)
  const [locRequestTick, setLocRequestTick] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)

        const [u, d, e, k] = await Promise.all([
          api.utvonalak(),
          api.destinaciok(),
          api.esemenyek(),
          api.kolcsonzok()
        ])

        if (cancelled) return

        setUtvonalak(Array.isArray(u) ? u : [])
        setDestinaciok(Array.isArray(d) ? d : [])
        setEsemenyek(Array.isArray(e) ? e : [])
        setKolcsonzok(Array.isArray(k) ? k : [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  function openPanelByMenu(link) {
    const mapping = {
      utvonalak: "utvonalak",
      desztinaciok: "destinaciok",
      destinaciok: "destinaciok",
      esemenyek: "esemenyek",
      "kölcsönzők": "kolcsonzok",
      kolcsonzok: "kolcsonzok"
    }

    const p = mapping[String(link || "").toLowerCase()]
    if (!p) return

    setActivePanel(p)
    setSelected(null)
    setSidebarOpen(false)
    setLayerPanelOpen(false)
  }

  function panelFromType(type) {
    if (type === "utvonal") return "utvonalak"
    if (type === "destinacio") return "destinaciok"
    if (type === "esemeny") return "esemenyek"
    if (type === "kolcsonzo") return "kolcsonzok"
    return null
  }

  function handleOpenDetails(type, id) {
    const panel = panelFromType(type)
    if (!panel) return

    setActivePanel(panel)
    setSelected({ type, id })
    setSidebarOpen(false)
    setLayerPanelOpen(false)
  }

  useEffect(() => {
    if (locRequestTick === 0) return
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      pos => setMyPos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [locRequestTick])

  const mapPoints = useMemo(() => {
    const d = destinaciok.map(x => ({
      id: x.id,
      tipus: "destinacio",
      nev: x.nev,
      leiras: x.leiras,
      lat: Number(x.lat),
      lng: Number(x.lng),
      ikon: "map-marker-alt",
      extra: { ertekeles: x.ertekeles, tipus: x.tipus }
    }))

    const e = esemenyek.map(x => ({
      id: x.id,
      tipus: "esemeny",
      nev: x.nev,
      leiras: x.leiras,
      lat: Number(x.lat),
      lng: Number(x.lng),
      ikon: "calendar-alt",
      extra: { datum: x.datum, resztvevok: x.resztvevok, tipus: x.tipus }
    }))

    const k = kolcsonzok.map(x => ({
      id: x.id,
      tipus: "kolcsonzo",
      nev: x.nev,
      leiras: x.cim,
      lat: Number(x.lat),
      lng: Number(x.lng),
      ikon: "bicycle",
      extra: { ar: x.ar, telefon: x.telefon, nyitvatartas: x.nyitvatartas }
    }))

    return [...d, ...e, ...k]
  }, [destinaciok, esemenyek, kolcsonzok])

  return (
    <div id="app" className="map-page-theme">
      {loading && <Splash />}

      <div id="map-container">
        <div className="map-page-bg">
          <div className="map-page-blob a" />
          <div className="map-page-blob b" />
          <div className="map-page-grid" />
        </div>

        <MapView
          layerType={layerType}
          points={mapPoints}
          utvonalak={utvonalak}
          selected={selected}
          myPos={myPos}
          onSelect={setSelected}
          onOpenDetails={handleOpenDetails}
          onMapClick={() => {
            setLayerPanelOpen(false)
          }}
        />

        <div id="header">
          <div id="floating-title" className="map-floating-title">
            <div className="map-floating-mark">
              <i className="fas fa-bicycle" />
            </div>
            <div className="map-floating-texts">
              <span className="map-floating-name">Két Keréken</span>
              <span className="map-floating-sub">Budapest</span>
            </div>
          </div>
        </div>

        <Sidebar
          open={sidebarOpen}
          menu={menu}
          onClose={() => setSidebarOpen(false)}
          onOpen={() => setSidebarOpen(true)}
          onMenuClick={link => openPanelByMenu(link)}
        />

        <LayerPanel
          open={layerPanelOpen}
          layerType={layerType}
          onChange={v => {
            setLayerType(v)
            setLayerPanelOpen(false)
          }}
        />

        <BottomControls
          onMenu={() => {
            setSidebarOpen(true)
            setLayerPanelOpen(false)
          }}
          onLayers={() => {
            setLayerPanelOpen(v => !v)
            setSidebarOpen(false)
          }}
          onLocation={() => setLocRequestTick(t => t + 1)}
          layersActive={layerPanelOpen}
        />
      </div>

      <Panels
        activePanel={activePanel}
        onClose={() => {
          setActivePanel(null)
          setSelected(null)
        }}
        onBackToList={() => {
          setSelected(null)
        }}
        utvonalak={utvonalak}
        destinaciok={destinaciok}
        esemenyek={esemenyek}
        kolcsonzok={kolcsonzok}
        selected={selected}
        onSelect={setSelected}
      />
    </div>
  )
}