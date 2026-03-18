import { useEffect, useMemo, useState } from "react"
import { api } from "../lib/api"

import Splash from "../ui/Splash"
import Sidebar from "../ui/Sidebar"
import BottomControls from "../ui/BottomControls"
import LayerPanel from "../ui/LayerPanel"
import Panels from "../ui/Panels"
import MapView from "../ui/MapView"

export default function MapPage() {
  const [loading, setLoading] = useState(true)

  const [menu, setMenu] = useState([])
  const [utvonalak, setUtvonalak] = useState([])
  const [destinaciok, setDestinaciok] = useState([])
  const [esemenyek, setEsemenyek] = useState([])
  const [kolcsonzok, setKolcsonzok] = useState([])
  const [blippek, setBlippek] = useState([])

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

        const [m, u, d, e, k, b] = await Promise.all([
          api.menu(),
          api.utvonalak(),
          api.destinaciok(),
          api.esemenyek(),
          api.kolcsonzok(),
          api.blippek()
        ])

        if (cancelled) return

        setMenu(m || [])
        setUtvonalak(u || [])
        setDestinaciok(d || [])
        setEsemenyek(e || [])
        setKolcsonzok(k || [])
        setBlippek(b || [])
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
      esemenyek: "esemenyek",
      "kölcsönzők": "kolcsonzok",
      kolcsonzok: "kolcsonzok"
    }

    const panel = mapping[link]
    if (!panel) return

    setActivePanel(panel)
    setSelected(null)
    setSidebarOpen(false)
  }

  function openDetailsFromMap(type, id) {
    const mapping = {
      utvonal: "utvonalak",
      destinacio: "destinaciok",
      esemeny: "esemenyek",
      kolcsonzo: "kolcsonzok",
      blipp: "blippek"
    }

    const panel = mapping[type]
    if (!panel) return

    setSelected({ type, id })
    setActivePanel(panel)
    setSidebarOpen(false)
    setLayerPanelOpen(false)
  }

  useEffect(() => {
    if (locRequestTick === 0) return
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      pos => {
        setMyPos([pos.coords.latitude, pos.coords.longitude])
      },
      () => {},
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }, [locRequestTick])

  const mapPoints = useMemo(() => {
    const b = blippek.map(x => ({
      id: x.id,
      tipus: "blipp",
      nev: x.nev,
      leiras: x.leiras,
      lat: Number(x.lat),
      lng: Number(x.lng),
      ikon: x.ikon || "circle",
      extra: {
        kategoriatipus: x.tipus
      }
    }))

    const d = destinaciok.map(x => ({
      id: x.id,
      tipus: "destinacio",
      nev: x.nev,
      leiras: x.leiras,
      lat: Number(x.lat),
      lng: Number(x.lng),
      ikon: "map-marker-alt",
      extra: {
        ertekeles: x.ertekeles,
        tipus: x.tipus
      }
    }))

    const e = esemenyek.map(x => ({
      id: x.id,
      tipus: "esemeny",
      nev: x.nev,
      leiras: x.leiras,
      lat: Number(x.lat),
      lng: Number(x.lng),
      ikon: "calendar-alt",
      extra: {
        datum: x.datum,
        resztvevok: x.resztvevok,
        tipus: x.tipus
      }
    }))

    const k = kolcsonzok.map(x => ({
      id: x.id,
      tipus: "kolcsonzo",
      nev: x.nev,
      leiras: x.cim,
      lat: Number(x.lat),
      lng: Number(x.lng),
      ikon: "bicycle",
      extra: {
        ar: x.ar,
        telefon: x.telefon,
        nyitvatartas: x.nyitvatartas
      }
    }))

    return [...b, ...d, ...e, ...k]
  }, [blippek, destinaciok, esemenyek, kolcsonzok])

  const mapHasPanel = Boolean(activePanel)

  return (
    <div id="app">
      {loading && <Splash />}

      <div id="map-container" className={mapHasPanel ? "with-panel" : ""}>
        <MapView
          layerType={layerType}
          points={mapPoints}
          utvonalak={utvonalak}
          selected={selected}
          myPos={myPos}
          onSelect={setSelected}
          onOpenDetails={openDetailsFromMap}
          onMapClick={() => {
            setLayerPanelOpen(false)
          }}
        />

        <div id="header">
          <div id="floating-title">
            <i className="fas fa-bicycle" />
            Két keréken
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
          search=""
          onSearch={() => {}}
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