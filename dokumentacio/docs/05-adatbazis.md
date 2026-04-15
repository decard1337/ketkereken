---
id: frontend
sidebar_position: 5
title: Frontend
---

# Frontend

A frontend **React** és **Vite** környezetben készült. A cél egy olyan vizuálisan egységes, modern és reszponzív felület létrehozása volt, amely egyszerre tud nyitóoldalként, térképes böngészőként és közösségi platformként működni.

## Alkalmazásváz és útvonalkezelés

Az alkalmazás fő váza az `App.jsx` fájlban jelenik meg. Itt történik a route-ok definiálása, a publikus és védett oldalak szétválasztása, valamint az `AuthProvider` bekötése, amely az egész felületen globális bejelentkezési állapotot biztosít.

## Bejelentkezés és regisztráció

A Login és Register oldalak vizuálisan egymásra épülnek. A sötét, lila-kék tónusú felület és a kiemelt action gombok modern karaktert adnak az oldalnak, miközben az űrlapok logikája egyszerűen követhető marad.

<div className="doc-image-row">
  <figure className="doc-shot">
    <img src="/img/ketkereken/login.png" alt="Bejelentkezési oldal" />
    <figcaption>Bejelentkezési képernyő.</figcaption>
  </figure>
  <figure className="doc-shot">
    <img src="/img/ketkereken/register.png" alt="Regisztrációs oldal" />
    <figcaption>Regisztrációs képernyő.</figcaption>
  </figure>
</div>

Sikeres hitelesítés után a rendszer a felhasználót a térképes nézetre irányítja, hibás adatok esetén pedig jól értelmezhető üzenetet jelenít meg.

## Főoldal

A főoldal egyszerre működik bemutatófelületként és gyors előnézetként. A látogató már itt áttekintést kap az útvonalakról, helyekről, eseményekről és kölcsönzőkről, miközben a térképes hangsúly azonnal érzékelteti a projekt alapötletét.

<figure className="doc-shot">
  ![A Kétkeréken főoldala](/img/ketkereken/home.png)
  <figcaption>A kezdőoldal előnézetet ad a teljes rendszerből.</figcaption>
</figure>

## Térképes nézet

A `MapPage` az alkalmazás központi oldala. Itt találkozik egymással a térkép, az oldalsó panel, a rétegválasztó, az alsó vezérlősáv és a részletes adatok megjelenítése.

<figure className="doc-shot">
  ![A Kétkeréken térképes nézete](/img/ketkereken/map.png)
  <figcaption>A térképes felület a rendszer egyik legfontosabb vizuális és funkcionális eleme.</figcaption>
</figure>

A térképes nézet erősségei:

- több adatréteg együttes megjelenítése,
- navigáció konkrét elemre,
- különböző térképtípusok támogatása,
- aktuális helyzet kezelése,
- és kedvencek integrálása bejelentkezett állapotban.

## Részletes panel és közösségi adatok

A kiválasztott objektumokhoz részletes oldalsó panel tartozik. A felhasználó itt olvashatja el a részletes leírást, nézheti meg a kapcsolódó képeket, értékeléseket és használhatja a közösségi műveleteket.

<figure className="doc-shot">
  ![Részletes oldalsó panel](/img/ketkereken/details-panel.png)
  <figcaption>Az oldalsó részletes panel a közösségi funkciók egyik csomópontja.</figcaption>
</figure>

## Profiloldal

A profiloldal egyszerre szolgál saját kezelőfelületként és nyilvános profilnézetként. A felhasználó itt szerkesztheti az adatait, profilképét, bemutatkozását, valamint áttekintheti a feltöltéseit, aktivitásait és kapcsolatait.

<figure className="doc-shot">
  ![Profiloldal](/img/ketkereken/profile.png)
  <figcaption>A profiloldal központi szerepet tölt be a közösségi logikában.</figcaption>
</figure>

## Közösségi feed

A feed oldal a felhasználói aktivitások időrendi összegzését jeleníti meg. A rendszer itt mutatja meg például a kedvencekhez adást, az értékeléseket, a képfeltöltéseket vagy a státuszposztokat.

<figure className="doc-shot">
  ![Közösségi feed](/img/ketkereken/feed.png)
  <figcaption>A feed a közösségi élmény egyik legerősebb eleme.</figcaption>
</figure>

## Támogató komponensek

A nagyobb felületi egységeket több kisebb komponens támogatja, például:

- `LoadingScreen`
- `EmptyState`
- `Onboarding`
- `Sidebar`
- `Panels`
- `LayerPanel`
- `BottomControls`

Ezek csökkentik a kódismétlést és erősítik az egységes vizuális nyelvet.

## Összegzés

A frontend egyik legnagyobb előnye az, hogy ugyanabban a vizuális keretben tudja kezelni a bemutató oldalt, a térképes keresést, a közösségi funkciókat és az adminisztratív folyamatokat is. Ettől a rendszer valóban egységes, nem pedig különálló oldalak laza halmaza.
