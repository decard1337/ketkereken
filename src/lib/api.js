const BASE = "http://localhost:3001/api";

async function get(resource) {
  const r = await fetch(`${BASE}/${encodeURIComponent(resource)}`);
  if (!r.ok) throw new Error(`API error: ${r.status}`);
  return r.json();
}

export const api = {
  menu: () => get("menu"),
  utvonalak: () => get("utvonalak"),
  destinaciok: () => get("destinaciok"),
  esemenyek: () => get("esemenyek"),
  kolcsonzok: () => get("kolcsonzok"),
  blippek: () => get("blippek"),
};