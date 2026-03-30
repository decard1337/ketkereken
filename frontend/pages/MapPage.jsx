import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
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

function normalizeType(type) {
  const t = String(type || "").trim().toLowerCase()

  if (t === "utvonal" || t === "utvonalak") {
    return { panel: "utvonalak", selectedType: "utvonal" }
  }

  if (t === "destinacio" || t === "destinaciok") {
    return { panel: "destinaciok", selectedType: "destinacio" }
  }

  if (t === "esemeny" || t === "esemenyek") {
    return { panel: "esemenyek", selectedType: "esemeny" }
  }

  if (t === "kolcsonzo" || t === "kolcsonzok") {
    return { panel: "kolcsonzok", selectedType: "kolcsonzo" }
  }

  return null
}

function getCelTipusFromSelectedType(type) {
  if (type === "utvonal") return "utvonalak"
  if (type === "destinacio") return "destinaciok"
  if (type === "esemeny") return "esemenyek"
  if (type === "kolcsonzo") return "kolcsonzok"
  return ""
}

export default function MapPage() {
  const [searchParams] = useSearchParams()

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

  const [kedvencek, setKedvencek] = useState([])
  const [kedvencLoadingId, setKedvencLoadingId] = useState("")

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)

        const [u, d, e, k, kedv] = await Promise.all([
          api.utvonalak(),
          api.destinaciok(),
          api.esemenyek(),
          api.kolcsonzok(),
          api.kedvencek().catch(() => [])
        ])

        if (cancelled) return

        const uData = Array.isArray(u) ? u : []
        const dData = Array.isArray(d) ? d : []
        const eData = Array.isArray(e) ? e : []
        const kData = Array.isArray(k) ? k : []

        setUtvonalak(uData)
        setDestinaciok(dData)
        setEsemenyek(eData)
        setKolcsonzok(kData)
        setKedvencek(Array.isArray(kedv) ? kedv : [])

        const tipus = searchParams.get("tipus")
        const id = searchParams.get("id")

        if (tipus && id) {
          const normalized = normalizeType(tipus)

          if (normalized) {
            let source = []

            if (normalized.panel === "utvonalak") source = uData
            if (normalized.panel === "destinaciok") source = dData
            if (normalized.panel === "esemenyek") source = eData
            if (normalized.panel === "kolcsonzok") source = kData

            const exists = source.some(item => String(item.id) === String(id))

            if (exists) {
              setActivePanel(normalized.panel)
              setSelected({
                type: normalized.selectedType,
                id: String(id)
              })
              setSidebarOpen(false)
              setLayerPanelOpen(false)
            }
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [searchParams])

  useEffect(() => {
    if (locRequestTick === 0) return
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      pos => setMyPos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [locRequestTick])

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
    setSelected({ type, id: String(id) })
    setSidebarOpen(false)
    setLayerPanelOpen(false)
  }

  function isKedvenc(cel_tipus, cel_id) {
    return kedvencek.some(
      k => String(k.cel_tipus) === String(cel_tipus) && String(k.cel_id) === String(cel_id)
    )
  }

  async function handleToggleKedvenc(cel_tipus, cel_id) {
    const key = `${cel_tipus}-${cel_id}`

    try {
      setKedvencLoadingId(key)
      await api.toggleKedvenc(cel_tipus, cel_id)

      setKedvencek(prev => {
        const exists = prev.some(
          k => String(k.cel_tipus) === String(cel_tipus) && String(k.cel_id) === String(cel_id)
        )

        if (exists) {
          return prev.filter(
            k => !(String(k.cel_tipus) === String(cel_tipus) && String(k.cel_id) === String(cel_id))
          )
        }

        return [
          ...prev,
          {
            cel_tipus,
            cel_id
          }
        ]
      })
    } catch (err) {
      console.error("Kedvenc váltási hiba:", err)
    } finally {
      setKedvencLoadingId("")
    }
  }

  const mapPoints = useMemo(() => {
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
          isKedvenc={isKedvenc}
          onToggleKedvenc={handleToggleKedvenc}
          kedvencLoadingId={kedvencLoadingId}
          getCelTipusFromSelectedType={getCelTipusFromSelectedType}
        />

        <div id="header">
          <div id="floating-title" className="map-floating-title">
            <div className="map-floating-mark">
              <i className="fas fa-bicycle" />
            </div>

            <div className="map-floating-texts">
              <span className="map-floating-name">Két Keréken</span>
              <span className="map-floating-sub">Térkép</span>
            </div>
          </div>
        </div>

        <Sidebar
          open={sidebarOpen}
          menu={menu}
          onClose={() => setSidebarOpen(false)}
          onOpen={() => setSidebarOpen(true)}
          onMenuClick={openPanelByMenu}
        />

        <LayerPanel
          open={layerPanelOpen}
          layerType={layerType}
          onChange={value => {
            setLayerType(value)
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
        isKedvenc={isKedvenc}
        onToggleKedvenc={handleToggleKedvenc}
        kedvencLoadingId={kedvencLoadingId}
        getCelTipusFromSelectedType={getCelTipusFromSelectedType}
      />
    </div>
  )
}