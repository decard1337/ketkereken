---
id: melleklet
sidebar_position: 9
title: Melléklet
---

# Melléklet

Ebben a részben a projekt technikai hátterét és vizuális összefoglaló elemeit gyűjtöttük össze. A cél nem a teljes forráskód kiváltása, hanem a gyors áttekinthetőség támogatása.

## Legfontosabb backend végpontok

A Kétkeréken API felülete a publikus lekérdezésektől a hitelesítésen és profilkezelésen át a közösségi feedig és az adminisztrációig többféle műveletet fed le.

<figure className="doc-shot">
  ![Backend végpontok áttekintése](/img/ketkereken/backend-endpoints.png)
  <figcaption>A projekt főbb backend végpontjai és útvonalcsoportjai.</figcaption>
</figure>

## Fejlesztési ütemezés

A projekt kivitelezése mérföldkövek mentén történt. Az alábbi ábra a fejlesztési szakaszok időbeli ütemezését mutatja.

<figure className="doc-shot">
  ![Gantt diagram](/img/ketkereken/gantt.png)
  <figcaption>A projekt munkafolyamatai Gantt diagramon.</figcaption>
</figure>

## Gyors API-áttekintés

A dokumentáció alapján a rendszer főbb funkcionális területei a következők:

- **auth** – bejelentkezés, regisztráció, munkamenetkezelés,
- **public** – útvonalak, desztinációk, események, kölcsönzők lekérése,
- **profile** – publikus profil és saját profil frissítése,
- **follow** – követési kapcsolatok kezelése,
- **kepek és értékelések** – közösségi tartalmak létrehozása és lekérdezése,
- **feed** – aktivitások, kommentek, reakciók,
- **admin** – karbantartás, jóváhagyás és moderáció.

## Záró megjegyzés

A melléklet jól kiegészíti a szöveges dokumentációt: gyorsan áttekinthetővé teszi a rendszer felépítését, valamint segít abban, hogy a projekt technikai és szervezési oldala egyetlen helyen is összefoglalható legyen.
