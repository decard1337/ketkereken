const BASE = "http://localhost:3001/api";

async function req(path, { method = "GET", body } = {}) {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  const txt = await r.text();
  let data = null;
  try { data = txt ? JSON.parse(txt) : null; } catch { data = null; }
  if (!r.ok) {
    const msg = data?.error || `API error: ${r.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  menu: () => req("/menu"),
  utvonalak: () => req("/utvonalak"),
  destinaciok: () => req("/destinaciok"),
  esemenyek: () => req("/esemenyek"),
  kolcsonzok: () => req("/kolcsonzok"),
  blippek: () => req("/blippek"),

  register: (email, username, password) => req("/auth/register", { method: "POST", body: { email, username, password } }),
  login: (email, password) => req("/auth/login", { method: "POST", body: { email, password } }),
  logout: () => req("/auth/logout", { method: "POST" }),
  me: () => req("/auth/me"),

  adminList: (resource) => req(`/admin/${encodeURIComponent(resource)}`),
  adminCreate: (resource, body) => req(`/admin/${encodeURIComponent(resource)}`, { method: "POST", body }),
  adminUpdate: (resource, id, body) => req(`/admin/${encodeURIComponent(resource)}/${encodeURIComponent(id)}`, { method: "PUT", body }),
  adminDelete: (resource, id) => req(`/admin/${encodeURIComponent(resource)}/${encodeURIComponent(id)}`, { method: "DELETE" }),
};