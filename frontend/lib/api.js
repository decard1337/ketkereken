const API_BASE = "http://localhost:3001/api"

async function req(path, options = {}) {
  const isFormData = options.body instanceof FormData

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    credentials: "include",
    headers: isFormData
      ? {}
      : {
          "Content-Type": "application/json",
          ...(options.headers || {})
        },
    body: isFormData
      ? options.body
      : options.body
      ? JSON.stringify(options.body)
      : undefined
  })

  let data = null

  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    throw new Error(data?.error || "Hiba történt.")
  }

  return data
}

export const api = {
  me: () => req("/auth/me"),

  login: (email, jelszo) =>
    req("/auth/login", {
      method: "POST",
      body: { email, jelszo }
    }),

  register: (felhasznalonev, email, jelszo) =>
    req("/auth/register", {
      method: "POST",
      body: { felhasznalonev, email, jelszo }
    }),

  logout: () =>
    req("/auth/logout", {
      method: "POST"
    }),

  utvonalak: () => req("/utvonalak"),
  destinaciok: () => req("/destinaciok"),
  esemenyek: () => req("/esemenyek"),
  kolcsonzok: () => req("/kolcsonzok"),

  publicProfile: (username) =>
    req(`/u/${encodeURIComponent(username)}`),

  profilMentese: (username, bio) =>
    req("/profilom", {
      method: "PUT",
      body: { username, bio }
    }),

  profilkepFeltoltes: (file) => {
    const fd = new FormData()
    fd.append("file", file)

    return req("/profilom/profilkep", {
      method: "POST",
      body: fd
    })
  },

  kedvencek: () => req("/kedvencek"),

  toggleKedvenc: (cel_tipus, cel_id) =>
    req("/kedvencek/toggle", {
      method: "POST",
      body: { cel_tipus, cel_id }
    }),

  ertekelesek: (cel_tipus, cel_id) =>
    req(`/ertekelesek/${encodeURIComponent(cel_tipus)}/${encodeURIComponent(cel_id)}`),

  sajatErtekelesek: () => req("/sajat/ertekelesek"),

  kuldErtekeles: (cel_tipus, cel_id, pontszam, szoveg) =>
    req("/ertekelesek", {
      method: "POST",
      body: { cel_tipus, cel_id, pontszam, szoveg }
    }),

  updateSajatErtekeles: (id, pontszam, szoveg) =>
    req(`/ertekelesek/sajat/${id}`, {
      method: "PUT",
      body: { pontszam, szoveg }
    }),

  deleteSajatErtekeles: (id) =>
    req(`/ertekelesek/sajat/${id}`, {
      method: "DELETE"
    }),

  kepek: (cel_tipus, cel_id) =>
    req(`/kepek/${encodeURIComponent(cel_tipus)}/${encodeURIComponent(cel_id)}`),

  sajatKepek: () => req("/sajat/kepek"),

  kuldKep: (cel_tipus, cel_id, file, leiras = "") => {
    const fd = new FormData()
    fd.append("file", file)
    fd.append("cel_tipus", cel_tipus)
    fd.append("cel_id", cel_id)
    fd.append("leiras", leiras)

    return req("/kepek", {
      method: "POST",
      body: fd
    })
  },

  followToggle: (username) =>
    req("/follow/toggle", {
      method: "POST",
      body: { username }
    }),

  followStatus: (username) =>
    req(`/follow/status/${encodeURIComponent(username)}`),

  followers: (username) =>
    req(`/follow/followers/${encodeURIComponent(username)}`),

  following: (username) =>
    req(`/follow/following/${encodeURIComponent(username)}`),

  feed: () => req("/feed"),

  userFeed: (username) =>
    req(`/feed/${encodeURIComponent(username)}`),

  createStatusPost: (szoveg) =>
    req("/feed/statusz", {
      method: "POST",
      body: { szoveg }
    }),

  reactToActivity: (aktivitas_id, reakcio) =>
    req("/feed/react", {
      method: "POST",
      body: { aktivitas_id, reakcio }
    })
}