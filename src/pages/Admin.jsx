import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "../styles/admin.css";

const darkTiles = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

const RES = [
  { key: "utvonalak", label: "Útvonalak", icon: "fa-route" },
  { key: "esemenyek", label: "Események", icon: "fa-calendar-days" },
  { key: "destinaciok", label: "Desztinációk", icon: "fa-location-dot" },
  { key: "kolcsonzok", label: "Kölcsönzők", icon: "fa-bicycle" },
  { key: "blippek", label: "Blippek", icon: "fa-layer-group" },
  { key: "menu", label: "Menü", icon: "fa-bars" },
];

function emptyFor(resource) {
  if (resource === "utvonalak") return { cim: "", leiras: "", koordinatak: "[]", hossz: "", nehezseg: "konnyu", statusz: "aktiv", idotartam: "", szintkulonbseg: "" };
  if (resource === "esemenyek") return { nev: "", leiras: "", lat: "", lng: "", datum: "", resztvevok: "", tipus: "esemeny", statusz: "aktiv" };
  if (resource === "destinaciok") return { nev: "", leiras: "", lat: "", lng: "", ertekeles: "", tipus: "latnivalo", statusz: "aktiv" };
  if (resource === "kolcsonzok") return { nev: "", cim: "", lat: "", lng: "", ar: "", telefon: "", nyitvatartas: "", statusz: "aktiv" };
  if (resource === "blippek") return { nev: "", leiras: "", lat: "", lng: "", tipus: "altalanos", ikon: "circle", statusz: "aktiv" };
  if (resource === "menu") return { nev: "", link: "", statusz: "aktiv", sorrend: "" };
  return {};
}

function fmt(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0";
  return x.toLocaleString("hu-HU");
}

function markerIcon({ bg, fg, fa }) {
  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;border-radius:12px;background:${bg};border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;box-shadow:0 16px 36px rgba(0,0,0,.35)"><i class="fa-solid ${fa}" style="font-size:13px;color:${fg}"></i></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

const iconByType = {
  blippek: { bg: "rgba(255,255,255,.10)", fg: "rgba(255,255,255,.92)", fa: "fa-layer-group" },
  esemenyek: { bg: "rgba(126,87,255,.18)", fg: "rgba(255,255,255,.92)", fa: "fa-calendar-days" },
  destinaciok: { bg: "rgba(0,122,255,.18)", fg: "rgba(255,255,255,.92)", fa: "fa-location-dot" },
  kolcsonzok: { bg: "rgba(16,185,129,.16)", fg: "rgba(255,255,255,.92)", fa: "fa-bicycle" },
};

export default function Admin() {
  const [resource, setResource] = useState("utvonalak");
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState(emptyFor("utvonalak"));
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [query, setQuery] = useState("");
  const [pendingPick, setPendingPick] = useState(null);
  const [refs, setRefs] = useState({ blippek: [], esemenyek: [], destinaciok: [], kolcsonzok: [] });
  const loadSeq = useRef(0);

  const resMeta = useMemo(() => RES.find((r) => r.key === resource) || RES[0], [resource]);
  const titleKey = resource === "utvonalak" ? "cim" : "nev";
  const hasLatLng = resource !== "utvonalak" && resource !== "menu";

  async function load(resKey = resource) {
    const seq = ++loadSeq.current;
    setErr("");
    setOk("");
    try {
      const r = await api.adminList(resKey);
      if (seq !== loadSeq.current) return;
      setItems(r);
      setCounts((p) => ({ ...p, [resKey]: r.length }));
      if (pendingPick && pendingPick.resource === resKey) {
        setSelectedId(pendingPick.id);
        setEditorOpen(true);
        setPendingPick(null);
      } else {
        setSelectedId(null);
        setForm(emptyFor(resKey));
        setEditorOpen(false);
      }
    } catch (e) {
      if (seq !== loadSeq.current) return;
      setErr(e.message);
    }
  }

  async function refreshAllCounts() {
    try {
      const keys = RES.map((r) => r.key);
      const results = await Promise.allSettled(keys.map((k) => api.adminList(k)));
      const next = {};
      keys.forEach((k, i) => {
        const r = results[i];
        next[k] = r.status === "fulfilled" ? (Array.isArray(r.value) ? r.value.length : 0) : 0;
      });
      setCounts(next);
    } catch {
      setCounts({});
    }
  }

  async function refreshRefs() {
    try {
      const [b, e, d, k] = await Promise.all([
        api.adminList("blippek"),
        api.adminList("esemenyek"),
        api.adminList("destinaciok"),
        api.adminList("kolcsonzok"),
      ]);
      setRefs({
        blippek: Array.isArray(b) ? b : [],
        esemenyek: Array.isArray(e) ? e : [],
        destinaciok: Array.isArray(d) ? d : [],
        kolcsonzok: Array.isArray(k) ? k : [],
      });
    } catch {
      setRefs({ blippek: [], esemenyek: [], destinaciok: [], kolcsonzok: [] });
    }
  }

  useEffect(() => {
    refreshAllCounts();
    refreshRefs();
  }, []);

  useEffect(() => {
    setQuery("");
    load(resource);
  }, [resource]);

  const selectedItem = useMemo(
    () => items.find((x) => String(x.id) === String(selectedId)) || null,
    [items, selectedId]
  );

  useEffect(() => {
    if (!selectedItem) return;
    setForm({ ...selectedItem });
  }, [selectedItem]);

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const a = String(it.id ?? "").toLowerCase();
      const b = String(it[titleKey] ?? "").toLowerCase();
      const c = String(it.leiras ?? it.cim ?? "").toLowerCase();
      return a.includes(q) || b.includes(q) || c.includes(q);
    });
  }, [items, query, titleKey]);

  const routeLine = useMemo(() => {
    if (resource !== "utvonalak") return null;
    try {
      const arr = JSON.parse(form.koordinatak || "[]");
      if (!Array.isArray(arr) || arr.length < 2) return null;
      return arr;
    } catch {
      return null;
    }
  }, [resource, form.koordinatak]);

  const mapCenter = useMemo(() => {
    if (resource === "utvonalak" && routeLine?.length) return routeLine[0];
    const lat = Number(form.lat);
    const lng = Number(form.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
    const any = refs.destinaciok?.[0];
    if (any && Number.isFinite(Number(any.lat)) && Number.isFinite(Number(any.lng))) return [Number(any.lat), Number(any.lng)];
    return [47.4979, 19.0402];
  }, [resource, routeLine, form.lat, form.lng, refs.destinaciok]);

  const mapMarkers = useMemo(() => {
    const out = [];
    for (const k of ["blippek", "esemenyek", "destinaciok", "kolcsonzok"]) {
      const arr = refs[k] || [];
      for (const x of arr) {
        const lat = Number(x.lat);
        const lng = Number(x.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
        out.push({ resource: k, id: x.id, lat, lng });
      }
    }
    return out;
  }, [refs]);

  async function save() {
    setErr("");
    setOk("");
    try {
      if (selectedId) {
        const upd = await api.adminUpdate(resource, selectedId, form);
        setItems((p) => p.map((x) => (String(x.id) === String(selectedId) ? upd : x)));
        setOk("Mentve");
      } else {
        const created = await api.adminCreate(resource, form);
        setItems((p) => [...p, created]);
        setSelectedId(created.id);
        setEditorOpen(true);
        setOk("Létrehozva");
      }
      setCounts((p) => ({ ...p, [resource]: (items.length || 0) + (selectedId ? 0 : 1) }));
      refreshAllCounts();
      refreshRefs();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function del() {
    if (!selectedId) return;
    setErr("");
    setOk("");
    try {
      await api.adminDelete(resource, selectedId);
      setItems((p) => p.filter((x) => String(x.id) !== String(selectedId)));
      setSelectedId(null);
      setForm(emptyFor(resource));
      setEditorOpen(false);
      setOk("Törölve");
      refreshAllCounts();
      refreshRefs();
    } catch (e) {
      setErr(e.message);
    }
  }

  function openNew() {
    setSelectedId(null);
    setForm(emptyFor(resource));
    setErr("");
    setOk("");
    setEditorOpen(true);
  }

  function openEdit(id) {
    setSelectedId(id);
    setErr("");
    setOk("");
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setSelectedId(null);
    setForm(emptyFor(resource));
    setErr("");
    setOk("");
  }

  function onMarkerJump(r, id) {
    if (r === resource) {
      setSelectedId(id);
      setEditorOpen(true);
      return;
    }
    setPendingPick({ resource: r, id });
    setResource(r);
  }

  return (
    <div className="adm">
      <div className="adm-bg" />

      <div className="adm-shell">
        <div className="adm-topbar">
          <div className="adm-brand">
            <div className="adm-mark">
              <i className="fa-solid fa-shield-halved" />
            </div>
            <div className="adm-brandtext">
              <div className="adm-title">Admin panel</div>
              <div className="adm-sub">Kezelés: {resMeta.label}</div>
            </div>
          </div>

          <div className="adm-actions">
            <button className="adm-btn" onClick={() => { load(resource); refreshAllCounts(); refreshRefs(); }}>
              <i className="fa-solid fa-rotate" />
              <span>Frissít</span>
            </button>
          </div>
        </div>

        <div className="adm-main v2">
          <div className="adm-side">
            <div className="adm-card">
              <div className="adm-card-head">
                <div className="adm-card-title">
                  <i className="fa-solid fa-sliders" />
                  <span>Tábla</span>
                </div>
              </div>

              <div className="adm-nav">
                {RES.map((r) => (
                  <button
                    key={r.key}
                    className={"adm-navitem " + (resource === r.key ? "active" : "")}
                    onClick={() => { setPendingPick(null); setResource(r.key); }}
                  >
                    <span className="ani">
                      <i className={"fa-solid " + r.icon} />
                    </span>
                    <span className="ant">{r.label}</span>
                    <span className="anc">{fmt(counts[r.key] ?? 0)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="adm-card mapmini">
              <div className="adm-card-head">
                <div className="adm-card-title">
                  <i className="fa-solid fa-map" />
                  <span>Referenciák</span>
                </div>
                <div className="adm-badge">{fmt(mapMarkers.length)}</div>
              </div>

              <div className="adm-mapmini">
                <MapContainer center={mapCenter} zoom={12} zoomControl={false} style={{ height: "100%", width: "100%" }}>
                  <TileLayer url={darkTiles} />
                  {mapMarkers.map((m) => {
                    const cfg = iconByType[m.resource] || iconByType.blippek;
                    return (
                      <Marker
                        key={`${m.resource}-${m.id}`}
                        position={[m.lat, m.lng]}
                        icon={markerIcon(cfg)}
                        eventHandlers={{ click: () => onMarkerJump(m.resource, m.id) }}
                      />
                    );
                  })}
                  {routeLine && <Polyline positions={routeLine} pathOptions={{ weight: 5, opacity: 0.9 }} />}
                </MapContainer>
              </div>
            </div>
          </div>

          <div className={"adm-work " + (editorOpen ? "shift" : "")}>
            <div className="adm-card listcard">
              <div className="adm-card-head">
                <div className="adm-card-title">
                  <i className="fa-solid fa-list" />
                  <span>Lista</span>
                </div>
                <div className="adm-badge">{fmt(filtered.length)}</div>
              </div>

              <div className="adm-listtools">
                <input
                  className="adm-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Keresés (ID / név / cím / leírás)"
                />
              </div>

              <div className="adm-list">
                {filtered.map((it) => (
                  <button
                    key={it.id}
                    className={"adm-row " + (String(it.id) === String(selectedId) ? "active" : "")}
                    onClick={() => openEdit(it.id)}
                  >
                    <div className="ar-top">
                      <div className="ar-title">{it[titleKey] ?? `#${it.id}`}</div>
                      <div className={"ar-chip " + (String(it.statusz || "").toLowerCase() === "aktiv" ? "on" : "off")}>
                        {String(it.statusz || "").toLowerCase() === "aktiv" ? "aktív" : "inaktív"}
                      </div>
                    </div>
                    <div className="ar-sub">ID: {it.id}</div>
                  </button>
                ))}

                <button className="adm-row newrow" onClick={openNew}>
                  <div className="ar-top">
                    <div className="ar-title">
                      <i className="fa-solid fa-plus" style={{ marginRight: 10 }} />
                      Új hozzáadása
                    </div>
                    <div className="ar-chip on">create</div>
                  </div>
                  <div className="ar-sub">Üres űrlap megnyitása</div>
                </button>
              </div>
            </div>

            <div className={"adm-card editcard " + (editorOpen ? "open" : "")}>
              <div className="adm-card-head">
                <div className="adm-card-title">
                  <i className="fa-solid fa-pen-to-square" />
                  <span>{selectedId ? `Szerkesztés #${selectedId}` : "Új elem"}</span>
                </div>

                <div className="adm-head-actions">
                  <button className="adm-mini" onClick={closeEditor}>
                    <i className="fa-solid fa-xmark" />
                  </button>
                  <button className="adm-btn danger" onClick={del} disabled={!selectedId}>
                    <i className="fa-solid fa-trash" />
                    <span>Törlés</span>
                  </button>
                  <button className="adm-btn primary" onClick={save}>
                    <i className="fa-solid fa-floppy-disk" />
                    <span>Mentés</span>
                  </button>
                </div>
              </div>

              {err && <div className="adm-msg err">{err}</div>}
              {ok && <div className="adm-msg ok">{ok}</div>}

              <div className="adm-form v2">
                {Object.keys(form).map((k) => (
                  <label key={k} className={"adm-field " + (k === "koordinatak" ? "wide" : "")}>
                    <div className="adm-label">{k}</div>
                    {k === "koordinatak" ? (
                      <textarea className="adm-area" value={form[k] ?? ""} onChange={(e) => setField(k, e.target.value)} rows={7} />
                    ) : (
                      <input className="adm-input2" value={form[k] ?? ""} onChange={(e) => setField(k, e.target.value)} />
                    )}
                  </label>
                ))}
              </div>

              <div className="adm-editmap">
                <div className="aem-head">
                  <div className="aem-title">
                    <i className="fa-solid fa-location-crosshairs" />
                    <span>Térkép</span>
                  </div>
                  <div className="aem-sub">
                    {hasLatLng ? "kattints a térképre (lat/lng)" : (resource === "utvonalak" ? "útvonal preview" : "nincs pozíció mező")}
                  </div>
                </div>

                <div className="aem-map">
                  <MapContainer
                    center={mapCenter}
                    zoom={12}
                    zoomControl={false}
                    style={{ height: "100%", width: "100%" }}
                    whenCreated={(map) => {
                      map.on("click", (e) => {
                        if (!hasLatLng) return;
                        setField("lat", String(e.latlng.lat));
                        setField("lng", String(e.latlng.lng));
                      });
                    }}
                  >
                    <TileLayer url={darkTiles} />
                    {mapMarkers.map((m) => {
                      const cfg = iconByType[m.resource] || iconByType.blippek;
                      return (
                        <Marker
                          key={`edit-${m.resource}-${m.id}`}
                          position={[m.lat, m.lng]}
                          icon={markerIcon(cfg)}
                          eventHandlers={{ click: () => onMarkerJump(m.resource, m.id) }}
                        />
                      );
                    })}
                    {hasLatLng && Number(form.lat) && Number(form.lng) && (
                      <Marker
                        position={[Number(form.lat), Number(form.lng)]}
                        icon={markerIcon({ bg: "rgba(16,185,129,.22)", fg: "rgba(255,255,255,.95)", fa: "fa-location-dot" })}
                      />
                    )}
                    {routeLine && <Polyline positions={routeLine} pathOptions={{ weight: 5, opacity: 0.9 }} />}
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="adm-foot">
          <div className="adm-footcard">
            <div className="af-ico"><i className="fa-solid fa-circle-info" /></div>
            <div className="af-text">
              <div className="af-title">Útvonal</div>
              <div className="af-sub">Koordináták formátum: [[lat,lng],[lat,lng],...]</div>
            </div>
          </div>
          <div className="adm-footcard">
            <div className="af-ico"><i className="fa-solid fa-mouse-pointer" /></div>
            <div className="af-text">
              <div className="af-title">Marker</div>
              <div className="af-sub">Kattints markerre: azonnal megnyitja a szerkesztőt</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}