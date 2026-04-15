import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const cards = [
  {
    title: 'Bevezetés',
    description: 'A projekt célja, alapötlete, célcsoportja és a közösségi szemlélet bemutatása.',
    to: '/bevezetes',
  },
  {
    title: 'Rendszer indítása',
    description: 'A Két Keréken indítása, leállítása és az adatbázis automatikus mentése.',
    to: '/rendszer-inditas',
  },
  {
    title: 'Adatbázis',
    description: 'Az adatmodell, a táblák szerepe és az ER-modell áttekintése.',
    to: '/adatbazis',
  },
  {
    title: 'Backend',
    description: 'Express alapú MVC-szerű szerkezet, route-ok, controllerek, middleware-ek és utils.',
    to: '/backend',
  },
  {
    title: 'Frontend',
    description: 'React + Vite felépítés, oldalak, térképes nézet, profil, feed és admin felület.',
    to: '/frontend',
  },
  {
    title: 'Admin felület',
    description: 'Karbantartási, moderációs és szerkesztési funkciók áttekintése.',
    to: '/admin-felulet',
  },
  {
    title: 'Tesztelés',
    description: 'Backend tesztek, Selenium alapú frontend tesztek és ellenőrzési szempontok.',
    to: '/teszteles',
  },
  {
    title: 'Melléklet',
    description: 'Ábrák, végpontok, projektstruktúra és további kiegészítő anyagok.',
    to: '/melleklet',
  },
];

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroGlowA} />
      <div className={styles.heroGlowB} />

      <div className={styles.heroInner}>
        <div className={styles.heroLeft}>
          <div className={styles.kicker}>Két Keréken · Projekt-dokumentáció</div>
          <h1 className={styles.title}>Két Keréken</h1>
          <p className={styles.subtitle}>
            Kerékpáros közösségi webalkalmazás dokumentációja. Frontend, backend,
            adatbázis, adminisztráció és tesztelés egy helyen.
          </p>

          <div className={styles.actions}>
            <Link className={styles.primaryBtn} to={useBaseUrl('/bevezetes')}>
              Dokumentáció megnyitása
            </Link>
            <Link className={styles.secondaryBtn} to={useBaseUrl('/melleklet')}>
              Melléklet
            </Link>
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.previewCard}>
            <div className={styles.previewTop}>
              <div className={styles.previewDot} />
              <span>Dokumentációs áttekintés</span>
            </div>

            <div className={styles.previewBody}>
              <div className={styles.previewRow}>
                <span>Frontend</span>
                <strong>React + Vite</strong>
              </div>
              <div className={styles.previewRow}>
                <span>Backend</span>
                <strong>Node.js + Express</strong>
              </div>
              <div className={styles.previewRow}>
                <span>Adatbázis</span>
                <strong>MySQL</strong>
              </div>
              <div className={styles.previewRow}>
                <span>Térképes nézet</span>
                <strong>React Leaflet</strong>
              </div>
              <div className={styles.previewRow}>
                <span>Tesztek</span>
                <strong>Jest + Selenium</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DocCard({ title, description, to }) {
  return (
    <Link className={styles.cardLink} to={useBaseUrl(to)}>
      <article className={styles.card}>
        <div className={styles.cardAccent} />
        <h2>{title}</h2>
        <p>{description}</p>
      </article>
    </Link>
  );
}

export default function Home() {
  return (
    <Layout title="Két Keréken" description="A Két Keréken projekt dokumentációs oldala">
      <main className={styles.page}>
        <div className={styles.shell}>
          <Hero />

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <div>
                <div className={styles.sectionKicker}>Fejezetek</div>
                <h2 className={styles.sectionTitle}>A dokumentáció fő részei</h2>
              </div>
            </div>

            <div className={styles.grid}>
              {cards.map((card) => (
                <DocCard key={card.title} {...card} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}