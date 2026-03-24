const BASE = "http://localhost:3001/api"

async function req(path, options = {}) {
  const config = {
    credentials: "include",
    method: options.method || "GET"
  }

  if (options.formData) {
    config.body = options.formData
  } else if (options.body) {
    config.headers = { "Content-Type": "application/json" }
    config.body = JSON.stringify(options.body)
  }

  const res = await fetch(`${BASE}${path}`, config)
  const text = await res.text()

  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!res.ok) {
    throw new Error(data?.error || `API hiba: ${res.status}`)
  }

  return data
}

export const api = {
  menu: () => req("/menu"),
  utvonalak: () => req("/utvonalak"),
  destinaciok: () => req("/destinaciok"),
  esemenyek: () => req("/esemenyek"),
  kolcsonzok: () => req("/kolcsonzok"),
  blippek: () => req("/blippek"),

  register: (email, username, password) =>
    req("/auth/register", { method: "POST", body: { email, username, password } }),

  login: (email, password) =>
    req("/auth/login", { method: "POST", body: { email, password } }),

  logout: () =>
    req("/auth/logout", { method: "POST" }),

  me: () =>
    req("/auth/me"),

  publicProfile: username =>
    req(`/u/${encodeURIComponent(username)}`),

  profilMentese: (username, bio) =>
    req("/profilom", { method: "PUT", body: { username, bio } }),

  profilkepFeltoltes: file => {
    const fd = new FormData()
    fd.append("file", file)
    return req("/profilom/profilkep", { method: "POST", formData: fd })
  },

  adminList: tabla =>
    req(`/admin/${encodeURIComponent(tabla)}`),

  adminCreate: (tabla, body) =>
    req(`/admin/${encodeURIComponent(tabla)}`, { method: "POST", body }),

  adminUpdate: (tabla, id, body) =>
    req(`/admin/${encodeURIComponent(tabla)}/${encodeURIComponent(id)}`, { method: "PUT", body }),

  adminDelete: (tabla, id) =>
    req(`/admin/${encodeURIComponent(tabla)}/${encodeURIComponent(id)}`, { method: "DELETE" }),

  toggleKedvenc: (cel_tipus, cel_id) =>
    req("/kedvencek/toggle", { method: "POST", body: { cel_tipus, cel_id } }),

  kedvencek: () =>
    req("/kedvencek"),

  kedvencStatusz: (cel_tipus, cel_id) =>
    req(`/kedvencek/status?cel_tipus=${encodeURIComponent(cel_tipus)}&cel_id=${encodeURIComponent(cel_id)}`),

  kuldErtekeles: (cel_tipus, cel_id, pontszam, szoveg) =>
    req("/ertekelesek", { method: "POST", body: { cel_tipus, cel_id, pontszam, szoveg } }),

  ertekelesek: (cel_tipus, cel_id) =>
    req(`/ertekelesek?cel_tipus=${encodeURIComponent(cel_tipus)}&cel_id=${encodeURIComponent(cel_id)}`),

  updateSajatErtekeles: (id, pontszam, szoveg) =>
    req(`/sajat/ertekelesek/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: { pontszam, szoveg }
    }),

  deleteSajatErtekeles: id =>
    req(`/sajat/ertekelesek/${encodeURIComponent(id)}`, {
      method: "DELETE"
    }),

  kuldKep: (cel_tipus, cel_id, file, leiras = "") => {
    const fd = new FormData()
    fd.append("cel_tipus", cel_tipus)
    fd.append("cel_id", String(cel_id))
    fd.append("leiras", leiras)
    fd.append("file", file)
    return req("/kepek", { method: "POST", formData: fd })
  },

  kepek: (cel_tipus, cel_id) =>
    req(`/kepek?cel_tipus=${encodeURIComponent(cel_tipus)}&cel_id=${encodeURIComponent(cel_id)}`),

  adminJovahagyando: () =>
    req("/admin/jovahagyando"),

  adminElfogad: (tipus, id) =>
    req("/admin/elfogad", { method: "POST", body: { tipus, id } }),

  adminElutasit: (tipus, id) =>
    req("/admin/elutasit", { method: "POST", body: { tipus, id } }),

  sajatErtekelesek: () =>
    req("/sajat/ertekelesek"),

  sajatKepek: () =>
    req("/sajat/kepek")
}