---
id: teszteles
sidebar_position: 7
title: Tesztelés
---

# Tesztelés

A Kétkeréken projektben a tesztelés célja az volt, hogy a rendszer ne csak funkcionálisan legyen kész, hanem a legfontosabb folyamatok ismételhetően ellenőrizhetők is legyenek. A projektben külön backend és frontend szintű ellenőrzések is megjelentek.

## Backend tesztelés

A backend tesztek a logikai hibák kiszűrésére szolgálnak. Ezek különösen a hitelesítés, a jogosultságkezelés, a célobjektumok normalizálása és néhány kritikus controller működése körül fontosak.

<div className="doc-card-grid">
  <div className="doc-mini-card">
    <h3>Egységtesztek</h3>
    <p>A kisebb logikai egységek önálló viselkedését ellenőrzik.</p>
  </div>
  <div className="doc-mini-card">
    <h3>Middleware ellenőrzések</h3>
    <p>A bejelentkezés és az admin jogosultság helyes hibakódjait validálják.</p>
  </div>
  <div className="doc-mini-card">
    <h3>Controller tesztek</h3>
    <p>A legfontosabb végpontok válaszait és hibakezelését vizsgálják.</p>
  </div>
  <div className="doc-mini-card">
    <h3>Refaktorbiztonság</h3>
    <p>A későbbi módosításoknál kapaszkodót adnak a meglévő működéshez.</p>
  </div>
</div>

<figure className="doc-shot">
  ![Backend tesztek futtatása](/img/ketkereken/tests-terminal.png)
  <figcaption>Automatizált backend tesztfuttatás a terminálban.</figcaption>
</figure>

### Példa futtatás

```bash
cd backend
npm test
```

## Frontend tesztelés – Selenium

A felhasználói felület működésének ellenőrzésére Selenium alapú böngészőtesztek is készültek. Ezek már nem csak egy-egy függvényt vizsgálnak, hanem teljes felhasználói folyamatokat szimulálnak.

Az E2E tesztek tipikus területei:

- authentikáció,
- navigáció,
- profilkezelés,
- feed használat,
- admin felület alapfolyamatai.

<figure className="doc-shot">
  ![Selenium tesztfuttatás](/img/ketkereken/selenium.png)
  <figcaption>A Selenium tesztek végponttól végpontig képesek vizsgálni a felületet.</figcaption>
</figure>

### Példa futtatás

```bash
cd frontend
npm run test:all
```

## Miért fontos a tesztelés ebben a projektben?

A Kétkeréken több összetevőből álló rendszer:

- adatbázisra támaszkodik,
- autentikációt használ,
- közösségi interakciókat kezel,
- és többféle felhasználói jogosultságot különít el.

Egy ilyen környezetben már kisebb módosítások is láncreakciót indíthatnak el, ezért a tesztek nemcsak hibakeresésre, hanem stabilitásmegőrzésre is szolgálnak.

## Összegzés

Bár a tesztlefedettség tovább bővíthető, a projekt jelenlegi ellenőrzései már most is jól mutatják, hogy a fejlesztés során nemcsak a funkciók elkészítése, hanem a működésük visszaellenőrzése is fontos szempont volt.
