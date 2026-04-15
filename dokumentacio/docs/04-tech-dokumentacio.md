---
id: backend
sidebar_position: 4
title: Backend
---

# Backend

A Kétkeréken backendje **Node.js** környezetben, **Express** keretrendszerrel készült. A szerveroldali rész felel a hitelesítésért, a publikus adatok kiszolgálásáért, a felhasználói műveletekért, valamint az adminisztrációs és moderációs folyamatokért.

## Szerkezeti szemlélet

A mappastruktúra világosan szétválasztja a felelősségi köröket. Bár a klasszikus értelemben vett külön `models` mappa nincs jelen, az alkalmazás felépítése erősen **MVC-közeli** szemléletet követ:

- a **controller** réteg fogadja a kéréseket,
- a **route** réteg rendezi az útvonalakat és middleware-eket,
- a **config** réteg biztosítja a környezeti és adatbázis-beállításokat,
- a **utils** mappa pedig közös logikai segédfüggvényeket tartalmaz.

## Model réteg és adatkezelés

Az adatkezelés parametrizált SQL lekérdezéseken alapul. A kontrollerek a MySQL kapcsolatot a konfigurációs rétegen keresztül érik el. Ez egy közepes méretű projekt esetén jól követhető és hatékony megoldás, ráadásul a segédfüggvények csökkentik a kódismétlést.

## Controller mappa

A controller réteg kezeli a beérkező HTTP kéréseket, ellenőrzi az adatokat, végrehajtja a szükséges SQL műveleteket, majd JSON választ ad vissza.

<div className="doc-image-row">
  <figure className="doc-shot">
    <img src="/img/ketkereken/controller-auth.png" alt="Auth controller kódrészlet" />
    <figcaption>Controller példa – hitelesítési logika.</figcaption>
  </figure>
  <figure className="doc-shot">
    <img src="/img/ketkereken/controller-feed.png" alt="Feed controller kódrészlet" />
    <figcaption>Controller példa – közösségi aktivitáskezelés.</figcaption>
  </figure>
</div>

A legfontosabb kontrollerek:

- `authController` – regisztráció, bejelentkezés, kijelentkezés, aktuális felhasználó,
- `publicController` – publikus törzsadatok kiszolgálása,
- `profileController` – nyilvános profil és saját profil szerkesztése,
- `followController` – követés és követettségi adatok,
- `feedController` – aktivitások, reakciók és kommentek,
- `adminController` – moderáció és admin karbantartás.

## Routes mappa

A route-fájlok logikusan szétválasztják a funkcionális területeket. Minden fontos rész saját útvonalkészletet kapott: authentikáció, publikus tartalmak, profil, kedvencek, értékelések, képek, feed, követések és adminisztráció.

<div className="doc-image-row">
  <figure className="doc-shot">
    <img src="/img/ketkereken/routes-api.png" alt="API route kódrészlet" />
    <figcaption>Route példa – moduláris API felépítés.</figcaption>
  </figure>
  <figure className="doc-shot">
    <img src="/img/ketkereken/routes-feed.png" alt="Feed route kódrészlet" />
    <figcaption>Route példa – feedhez kapcsolódó végpontok.</figcaption>
  </figure>
</div>

## Tests mappa

A backend tesztek külön mappában helyezkednek el. A feltöltött állományok alapján például a kedvencek, a middleware-ek és a célobjektum-kezelés logikája is külön ellenőrzést kapott.

<div className="doc-image-row">
  <figure className="doc-shot">
    <img src="/img/ketkereken/tests-terminal.png" alt="Backend teszt futás terminálban" />
    <figcaption>Tesztfuttatás a backendhez.</figcaption>
  </figure>
  <figure className="doc-shot">
    <img src="/img/ketkereken/auth-tests.png" alt="Auth middleware tesztkód" />
    <figcaption>Példa egységteszt – jogosultsági ellenőrzés.</figcaption>
  </figure>
</div>

## Middleware mappa

A middleware réteg gondoskodik a védett végpontok biztonságáról. Három kulcsfontosságú függvény különíthető el:

- `authRequired` – kötelező bejelentkezés,
- `adminRequired` – admin szerepkör ellenőrzése,
- `authOptional` – opcionális azonosítás publikusabb végpontoknál.

<figure className="doc-shot">
  ![Middleware kódrészlet](/img/ketkereken/middleware-code.png)
  <figcaption>A middleware a JWT tokenek kezelésével védi a rendszer érzékeny pontjait.</figcaption>
</figure>

## Config és Utils mappa

A `config` mappában találhatók az adatbázis-, környezeti és feltöltési beállítások. A `utils` mappa ezzel szemben a közös logikát tömöríti rövid, újrahasznosítható függvényekbe.

<figure className="doc-shot">
  ![Utils kódrészlet](/img/ketkereken/utils-code.png)
  <figcaption>A segédfüggvények egységesítik a közös logikai műveleteket.</figcaption>
</figure>

## App.js és Server.js

Az `app.js` hozza létre az Express alkalmazást, bekapcsolja a CORS-t, a JSON feldolgozást, a cookie-kezelést és az útvonalmodulokat. A `server.js` feladata ezzel szemben az indítás és a portfigyelés.

<div className="doc-image-row">
  <figure className="doc-shot">
    <img src="/img/ketkereken/app-js.png" alt="App.js kódrészlet" />
    <figcaption>Az Express alkalmazás központi összekötő fájlja.</figcaption>
  </figure>
  <figure className="doc-shot">
    <img src="/img/ketkereken/server-js.png" alt="Server.js kódrészlet" />
    <figcaption>A futtatási belépési pont külön fájlban marad.</figcaption>
  </figure>
</div>

A `/health` végpont szerepe különösen hasznos fejlesztés közben, mert az indítófolyamat ebből tudja megállapítani, hogy a backend már fogadja-e a kéréseket.

## Összegzés

A backend legnagyobb erőssége a jól elkülönített felelősségi körökben és az egységes API-szemléletben rejlik. A projekt ezen része stabil alapot ad a publikus lekérdezéseknek, a közösségi műveleteknek és az adminfunkcióknak egyaránt.
