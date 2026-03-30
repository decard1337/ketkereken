export const menuIcons = {
  kezdooldal: "home",
  utvonalak: "route",
  desztinaciok: "map-marker-alt",
  esemenyek: "calendar-alt",
  "kölcsönzők": "bicycle",
  kolcsonzok: "bicycle",
  kozosseg: "users",
  szervizek: "tools",
  kedvencek: "star",
  profil: "user",
  rolunk: "info-circle",
};

export function iconForMenu(link) {
  return menuIcons[link] ?? "circle";
}