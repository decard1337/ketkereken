export function normalizeNehezseg(v) {
  const s = (v ?? "").toString().toLowerCase().trim();
  if (s === "könnyű" || s === "konnyu") return "konnyu";
  if (s === "közepes" || s === "kozepes") return "kozepes";
  if (s === "nehéz" || s === "nehez") return "nehez";
  return "ismeretlen";
}

export function labelNehezseg(v) {
  const n = normalizeNehezseg(v);
  if (n === "konnyu") return "Könnyű";
  if (n === "kozepes") return "Közepes";
  if (n === "nehez") return "Nehéz";
  return "Ismeretlen";
}