---
id: bevezetes
sidebar_position: 1
title: Bevezetés
---

# Kétkeréken – projektáttekintés

A **Kétkeréken** egy kerékpározáshoz kapcsolódó, közösségi szemléletű webalkalmazás. A projekt célja egy olyan modern, felhasználóbarát platform létrehozása volt, amely nemcsak a bringázás technikai oldalát támogatja, hanem a közösségépítésre, az aktív életmód népszerűsítésére és a fenntartható közlekedés támogatására is hangsúlyt helyez.

<div className="doc-card-grid">
  <div className="doc-mini-card">
    <h3>Projektcél</h3>
    <p>Az útvonalak, helyszínek, események és kölcsönzők térképes bemutatása egy közösségi funkciókkal bővített rendszerben.</p>
  </div>
  <div className="doc-mini-card">
    <h3>Célcsoport</h3>
    <p>Nemcsak sportolók, hanem hétvégi túrázók, családok és mindennapi kerékpárhasználók is.</p>
  </div>
  <div className="doc-mini-card">
    <h3>Fő érték</h3>
    <p>A platform egyszerre nyújt böngészhető tartalmat, közösségi interakciót és adminisztratív karbantarthatóságot.</p>
  </div>
  <div className="doc-mini-card">
    <h3>Technológiai alap</h3>
    <p>React + Vite frontend, Express alapú backend, MySQL adatbázis és Docker környezet.</p>
  </div>
</div>

## Miért ezt a témát választottuk?

A témaválasztás során fontos szempont volt, hogy olyan területet dolgozzunk fel, amely személyesen is közel áll hozzánk. Mindketten rendszeresen használjuk a kerékpárt sportolásra, közlekedésre és szabadidős tevékenységre is. Úgy gondoltuk, hogy a kerékpározás nem csupán közlekedési forma, hanem olyan életmód, amely pozitívan hat az egészségre, a környezetre és a közösségi kapcsolatokra is.

## A projekt alapgondolata

A Kétkeréken ötlete abból a felismerésből született, hogy a létező kerékpáros alkalmazások jelentős része elsősorban a komolyabban sportoló, versenyző szemléletű felhasználókat célozza. Sok megoldás túl összetett, nehezen átlátható, vagy nem nyújt valódi közösségi élményt azok számára, akik egyszerűen csak túraötleteket, helyeket vagy programokat keresnek.

A mi célunk ezzel szemben egy olyan rendszer volt, amely:

- egyszerűen használható,
- vizuálisan modern,
- mobilon és asztali gépen is áttekinthető,
- és közösségi funkciókkal motiválja a felhasználókat.

## Fő funkcionális pillérek

### 1. Térképes böngészés
A nyilvános tartalmak – útvonalak, desztinációk, események és kölcsönzők – egységes, térképes logika mentén jelennek meg.

### 2. Közösségi interakció
A felhasználók profilt kezelhetnek, képeket tölthetnek fel, értékeléseket írhatnak, kedvencekhez adhatnak elemeket, és követhetik egymást.

### 3. Moderáció és adminisztráció
Az admin felület gondoskodik az adatok karbantartásáról, a jóváhagyandó képek és értékelések kezeléséről, valamint az erőforrások szerkesztéséről.

## Fejlesztési szemlélet

A projekt tervezésekor fontos szempont volt a **későbbi bővíthetőség**. Tudatosan olyan struktúrát alakítottunk ki, amely mellett új modulok, útvonalak, szűrők, vagy akár részletesebb útvonaltervezési funkciók is később könnyen kapcsolhatók a rendszerhez.

<figure className="doc-shot">
  ![A Kétkeréken fejlesztési ütemezésének Gantt diagramja](/img/ketkereken/gantt.png)
  <figcaption>Fejlesztési ütemterv – a projekt főbb szakaszai Gantt diagramon.</figcaption>
</figure>

## Rövid összegzés

A Kétkeréken nem pusztán egy kötelező projektfeladatként készült, hanem olyan kezdeményezésként, amely a kerékpározás népszerűsítését, a közösségi kapcsolatok erősítését és a modern webfejlesztési megoldások gyakorlati alkalmazását egyszerre jeleníti meg.
