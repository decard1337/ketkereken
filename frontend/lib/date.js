export function stripIsoTime(value) {
  if (value === null || value === undefined) return ""

  const s = String(value).trim()
  const match = s.match(/^(\d{4}-\d{2}-\d{2})T/)

  if (match) return match[1]
  return s
}

export function formatShortDate(value) {
  const cleaned = stripIsoTime(value)
  return cleaned || "—"
}

export function formatLongHuDate(value) {
  const cleaned = stripIsoTime(value)
  if (!cleaned) return "—"

  const date = new Date(cleaned)
  if (Number.isNaN(date.getTime())) return cleaned

  return date.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
}

export function formatDateForInput(value) {
  const cleaned = stripIsoTime(value)
  return cleaned || ""
}