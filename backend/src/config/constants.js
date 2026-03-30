export const ADMIN_TABLES = {
  utvonalak: ["cim", "leiras", "koordinatak", "hossz", "nehezseg", "statusz", "idotartam", "szintkulonbseg"],
  destinaciok: ["nev", "leiras", "lat", "lng", "ertekeles", "tipus", "statusz"],
  esemenyek: ["nev", "leiras", "lat", "lng", "datum", "resztvevok", "tipus", "statusz", "utvonal_id"],
  kolcsonzok: ["nev", "cim", "lat", "lng", "ar", "telefon", "nyitvatartas", "statusz"],
  felhasznalok: ["email", "felhasznalonev", "rang", "profilkep", "bio"]
}

export const PUBLIKUS_TABLEK = ["utvonalak", "destinaciok", "esemenyek", "kolcsonzok"]

export const CEL_TIPUS_MAP = {
  utvonal: "utvonalak",
  utvonalak: "utvonalak",
  destinacio: "destinaciok",
  destinaciok: "destinaciok",
  esemeny: "esemenyek",
  esemenyek: "esemenyek",
  kolcsonzo: "kolcsonzok",
  kolcsonzok: "kolcsonzok"
}
