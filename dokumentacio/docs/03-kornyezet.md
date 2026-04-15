---
id: adatbazis
sidebar_position: 3
title: Adatbázis
---

# Adatbázis

A Kétkeréken projekt adatbázisa **MySQL** alapokon működik. Az adatmodell összesen **12 táblából** áll, amelyek együtt kezelik a felhasználói fiókokat, a publikus tartalmakat, a közösségi műveleteket és a feedhez kapcsolódó aktivitásokat.

## Az adatmodell logikája

Az adatbázis tervezésekor fontos cél volt, hogy a publikus tartalmak – például az útvonalak, események, desztinációk és kölcsönzők – jól elkülönüljenek a felhasználói interakcióktól. Ennek köszönhetően a rendszer egyszerre támogatja a nyilvános böngészést és a regisztrált felhasználókhoz kötött közösségi funkciókat.

<div className="doc-card-grid">
  <div className="doc-mini-card">
    <h3>Törzsadatok</h3>
    <p>Felhasználók, útvonalak, desztinációk, események és kölcsönzők.</p>
  </div>
  <div className="doc-mini-card">
    <h3>Közösségi adatok</h3>
    <p>Kedvencek, értékelések, képek és követések.</p>
  </div>
  <div className="doc-mini-card">
    <h3>Feed adatok</h3>
    <p>Aktivitások, kommentek és reakciók.</p>
  </div>
  <div className="doc-mini-card">
    <h3>Moderáció</h3>
    <p>Státuszmezők és admin ellenőrzési mezők gondoskodnak a jóváhagyásról.</p>
  </div>
</div>

## Főbb táblák és szerepük

| Tábla | Szerep | Fontos mezők | Kapcsolatok |
| --- | --- | --- | --- |
| `felhasznalok` | Regisztrált felhasználók alapadatai | `email`, `felhasznalonev`, `jelszo_hash`, `rang`, `profilkep`, `bio` | Kedvencekhez, értékelésekhez, képekhez, követésekhez és aktivitásokhoz kapcsolódik |
| `utvonalak` | Kerékpáros útvonalak törzsadatai | `cim`, `leiras`, `koordinatak`, `hossz`, `nehezseg`, `idotartam` | Események, értékelések, képek és kedvencek célpontja lehet |
| `destinaciok` | Látnivalók, pihenőpontok, helyszínek | `nev`, `leiras`, `lat`, `lng`, `ertekeles`, `tipus` | Értékelések, képek és kedvencek célpontja lehet |
| `esemenyek` | Kerékpáros események és túrák | `nev`, `datum`, `resztvevok`, `tipus`, `utvonal_id` | Kapcsolódhat útvonalhoz, közösségi tartalmakhoz |
| `kolcsonzok` | Kerékpárkölcsönzők és szolgáltatók | `nev`, `cim`, `lat`, `lng`, `ar`, `telefon`, `nyitvatartas` | Értékelhető, képpel bővíthető és kedvencekhez adható |
| `kedvencek` | Mentett elemek | `felhasznalo_id`, `cel_tipus`, `cel_id` | Felhasználók és a négy fő tartalomtípus között képez kapcsolatot |
| `ertekelesek` | Pontszámos és szöveges vélemények | `pontszam`, `szoveg`, `statusz`, `ellenorizte_admin` | Felhasználóhoz és célobjektumhoz kötött, moderációval |
| `kepek` | Felhasználói képfeltöltések | `fajl_utvonal`, `leiras`, `statusz`, `ellenorizte_admin` | Felhasználóhoz és célobjektumhoz kapcsolódik |
| `kovetesek` | Felhasználók közötti követés | `koveto_id`, `kovetett_id`, `letrehozva` | A profil- és feed logika egyik alapja |
| `aktivitasok` | A közösségi feed bejegyzései | `tipus`, `cel_tipus`, `cel_id`, `szoveg`, `extra_json` | Kommentek és reakciók kapcsolódnak hozzá |
| `aktivitas_kommentek` | Hozzászólások aktivitásokhoz | `aktivitas_id`, `felhasznalo_id`, `szoveg` | Az aktivitásokhoz és a felhasználókhoz kötődik |
| `aktivitas_reakciok` | Reakciók aktivitásokra | `aktivitas_id`, `felhasznalo_id`, `reakcio` | A feed interakcióit tárolja |

<figure className="doc-shot">
  ![A Kétkeréken adatbázisának táblái](/img/ketkereken/db-tablak.png)
  <figcaption>A publikus, közösségi és feedhez tartozó adatok a phpMyAdmin felületén áttekinthetők.</figcaption>
</figure>

## ER modell

Az ER-diagram szemlélteti, hogy a rendszer középpontjában a felhasználók állnak. A legtöbb interakció – követés, kedvencek, képek, értékelések és aktivitások – egy konkrét felhasználóhoz kötődik, miközben a publikus tartalomtáblák egységes célobjektum-logikán keresztül használhatók.

<figure className="doc-shot">
  ![A Kétkeréken ER diagramja](/img/ketkereken/er-diagram.png)
  <figcaption>ER diagram – a felhasználói, tartalmi és közösségi kapcsolatok áttekintése.</figcaption>
</figure>

## Fontos tervezési döntések

### Egységes célobjektum-kezelés
A kedvencek, értékelések és képek ugyanarra a mintára kezelik a célpontot: `cel_tipus` és `cel_id` mezőkkel. Ez a megközelítés leegyszerűsíti a backend ellenőrzéseit és a frontend API-használatot is.

### Moderációs státuszok
A képek és az értékelések admin jóváhagyáshoz kötöttek. Így a közösségi tartalom nem jelenik meg azonnal ellenőrzés nélkül.

### Koordináták szöveges tárolása
Az útvonalak koordinátái JSON-szerű szövegként tárolhatók, amelyet a frontend térképes komponensei közvetlenül fel tudnak dolgozni.

## Összegzés

Az adatbázis nem elszigetelt rekordokat tárol, hanem egymásra épülő funkcionális egységeket. Ez a struktúra jól támogatja a projekt jelenlegi funkcióit, és megfelelő alapot ad a későbbi bővítéshez is.
