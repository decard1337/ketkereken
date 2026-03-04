# KétKeréken 🚲

Egy térképalapú bringás webapp, ahol különböző bringás helyek, események és útvonalak jelennek meg egy interaktív térképen.

Az oldal célja, hogy könnyen át lehessen nézni:

- bringás **útvonalakat**
- **eseményeket**
- érdekes **desztinációkat**
- **kölcsönzőket**
- egyéb **blippeket**

Az adatok egy admin felületen keresztül kezelhetők.

---

# Funkciók

## Térkép
- Leaflet alapú interaktív térkép
- különböző típusú markerek
- popup információk
- útvonalak kirajzolása koordinátalistából

## Blippek
A térképen különböző pontok jelennek meg, például:

- események
- desztinációk
- kölcsönzők
- egyéb bringás pontok

Mindegyik saját ikonnal jelenik meg.

## Útvonalak
Az útvonalak koordinátalistából rajzolódnak ki a térképen.

Formátum: [[lat,lng],[lat,lng],[lat,lng]]


Minél több pont van benne, annál pontosabban követi az utakat.

## Admin panel

Az oldalhoz tartozik egy külön admin felület.

URL: /admin


Funkciók:

- elemek hozzáadása
- szerkesztés
- törlés
- lista nézet
- térképes koordináta kiválasztás

Az admin oldalon egy mini térkép segít a pozíció kiválasztásában.  
A térképen minden marker látható referenciaként.

Markerre kattintva az adott rekord azonnal megnyitható szerkesztésre.

## Jogosultság rendszer

Az alkalmazásban van egy egyszerű login rendszer.

Felhasználó szerepkörök:

- `user`
- `admin`

Admin jogosultság szükséges az admin panel eléréséhez.

A jelszavak hash-elve kerülnek tárolásra az adatbázisban.

A login session cookie alapú és egy ideig cachelve marad.

---

# Tech stack

Frontend:

- React
- Vite
- React Leaflet
- Font Awesome

Backend:

- Node.js
- Express

Adatbázis:

- MySQL

---

# Telepítés (local)

## 1. Adatbázis

Hozz létre egy MySQL adatbázist, majd **importáld a projektben található SQL fájlt**, ami tartalmazza a szükséges táblákat és struktúrát.

---

## 2. Backend
cd backend
npm install


`.env` példa:


PORT=3001
FRONTEND_ORIGIN=http://localhost:5173

JWT_SECRET=random_secret_string
TOKEN_TTL_DAYS=7
AUTH_COOKIE_NAME=kk_token

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=***
DB_NAME=ketkereken


Indítás:


npm run dev


---

## 3. Frontend


npm install
npm run dev


Frontend:

http://localhost:5173


Backend API:

http://localhost:3001


---

# Admin jogosultság

Regisztráció után minden felhasználó `user` role-t kap.

Admin jogosultságot az adatbázisban lehet módosítani.

---

# Projekt struktúra


src/
pages/
MapPage.jsx
Admin.jsx
components/
styles/
lib/
api.js

backend/
server.js


---

# Jegyzetek

- A login cookie alapú JWT-t használ.
- A frontend fetch hívások `credentials: "include"` módban futnak.
- A térképes útvonalak JSON koordinátalistából épülnek fel.

---

# TODO

- jobb route generálás (OSRM / routing engine)
- mobil UI finomítás
- több marker típus
- keresés a térképen
