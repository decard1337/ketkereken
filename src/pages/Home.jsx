import { Link } from "react-router-dom";
import "../styles/home.css";

const features = [
  {
    icon: "fa-solid fa-layer-group",
    title: "Rétegek",
    desc: "Kapcsold a kategóriákat, és csak azt látod, ami kell.",
  },
  {
    icon: "fa-solid fa-list",
    title: "Lista + részletek",
    desc: "Gyors keresés, kattintás, azonnali paneles infó.",
  },
  {
    icon: "fa-solid fa-location-dot",
    title: "Pontok",
    desc: "Pihenők, látnivalók és hasznos helyek egy helyen.",
  },
  {
    icon: "fa-solid fa-route",
    title: "Útvonalak",
    desc: "Átlátható útvonalnézet, fókusz a lényegen.",
  },
  {
    icon: "fa-solid fa-magnifying-glass",
    title: "Szűrés",
    desc: "Találd meg gyorsan a neked releváns pontokat.",
  },
  {
    icon: "fa-solid fa-bolt",
    title: "Gyors UI",
    desc: "Reszponzív, modern felület – nem akad, nem zavar be.",
  },
];

export default function Home() {
  return (
    <div className="home home-v3">
      <div className="home-bg">
        <div className="home-aurora" />
        <div className="home-blob home-blob-1" />
        <div className="home-blob home-blob-2" />
        <div className="home-noise" />
      </div>

      <header className="home-topbar blur-bg">
        <div className="home-brand">
          <div className="home-mark" aria-hidden="true">
            <i className="fa-solid fa-bicycle" />
          </div>
          <div className="home-title">
            <div className="home-logo">Két Keréken</div>
            <div className="home-sub">Térképes bringás helyek és útvonalak</div>
          </div>
        </div>

        <div className="home-actions-top">
          <a className="home-navlink" href="#features">
            Funkciók
          </a>
          <a className="home-navlink" href="#how">
            Használat
          </a>
          <Link to="/terkep" className="home-map-btn">
            Térkép
          </Link>
        </div>
      </header>

      <main className="home-main">
        <section className="hero">
          <div className="hero-left">
            <div className="hero-pill blur-bg">
              <i className="fa-solid fa-circle-info" />
              <span>Egységes UI a térkép stílusával</span>
            </div>

            <h1 className="hero-title">
              Minden, ami kell egy jó bringatúrához —{" "}
              <span className="hero-accent">egy térképen</span>.
            </h1>

            <p className="hero-text">
              Nézz pontokat, rétegeket, részleteket. Tervezéshez gyors,
              használathoz letisztult.
            </p>

            <div className="hero-buttons">
              <Link to="/terkep" className="btn-primary">
                <i className="fa-solid fa-map" />
                <span>Térkép megnyitása</span>
              </Link>

              <a href="#features" className="btn-ghost blur-bg">
                <i className="fa-solid fa-grid-2" />
                <span>Funkciók</span>
              </a>
            </div>

            <div className="hero-metrics">
              <div className="metric blur-bg">
                <div className="m-top">
                  <i className="fa-solid fa-gauge-high" />
                  <span>Gyors</span>
                </div>
                <div className="m-sub">Vite + React</div>
              </div>

              <div className="metric blur-bg">
                <div className="m-top">
                  <i className="fa-solid fa-panels-stay-open" />
                  <span>Paneles</span>
                </div>
                <div className="m-sub">lista + részletek</div>
              </div>

              <div className="metric blur-bg">
                <div className="m-top">
                  <i className="fa-solid fa-layer-group" />
                  <span>Rétegek</span>
                </div>
                <div className="m-sub">átlátható nézet</div>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="preview blur-strong">
              <div className="preview-bar">
                <div className="preview-left">
                  <div className="dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="preview-name">Előnézet</div>
                </div>

                <div className="preview-right">
                  <div className="chip blur-bg">
                    <i className="fa-solid fa-layer-group" />
                    <span>Rétegek</span>
                  </div>
                  <div className="chip blur-bg">
                    <i className="fa-solid fa-sliders" />
                    <span>Szűrő</span>
                  </div>
                </div>
              </div>

              <div className="map-mock" aria-hidden="true">
                <div className="mock-grid" />
                <div className="mock-route" />
                <div className="pin p1">
                  <i className="fa-solid fa-location-dot" />
                </div>
                <div className="pin p2">
                  <i className="fa-solid fa-location-dot" />
                </div>
                <div className="pin p3">
                  <i className="fa-solid fa-location-dot" />
                </div>

                <div className="mock-panel blur-bg">
                  <div className="mp-row">
                    <i className="fa-solid fa-list" />
                    <div className="mp-col">
                      <div className="mp-title">Helyszínek</div>
                      <div className="mp-sub">kattintás → részletek</div>
                    </div>
                    <div className="mp-badge">12</div>
                  </div>

                  <div className="mp-row">
                    <i className="fa-solid fa-route" />
                    <div className="mp-col">
                      <div className="mp-title">Útvonalak</div>
                      <div className="mp-sub">fókusz + kiemelés</div>
                    </div>
                    <div className="mp-badge">4</div>
                  </div>
                </div>

                <div className="mock-tooltip blur-bg">
                  <div className="tt-title">Pihenőhely</div>
                  <div className="tt-sub">pad • víz • árnyék</div>
                </div>
              </div>

              <div className="preview-footer">
                <div className="pf-left">
                  <div className="pf-k">Kiválasztva</div>
                  <div className="pf-v">Balaton-felvidék</div>
                </div>
                <Link to="/terkep" className="pf-btn">
                  Megnyitás <i className="fa-solid fa-arrow-right" />
                </Link>
              </div>
            </div>

            <div className="side-mini">
              <div className="mini-card blur-bg">
                <i className="fa-solid fa-compass" />
                <div>
                  <div className="mini-title">Gyors navigáció</div>
                  <div className="mini-sub">panel + rétegkezelés</div>
                </div>
              </div>

              <div className="mini-card blur-bg">
                <i className="fa-solid fa-shield-halved" />
                <div>
                  <div className="mini-title">Letisztult</div>
                  <div className="mini-sub">kevesebb zaj, több infó</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="section">
          <div className="section-head">
            <h2>Funkciók</h2>
            <p>Olyan, mint a térképoldal: gyors, paneles, jól olvasható.</p>
          </div>

          <div className="feature-grid">
            {features.map((f) => (
              <div className="feature-card blur-bg" key={f.title}>
                <div className="f-ico">
                  <i className={f.icon} />
                </div>
                <div className="f-title">{f.title}</div>
                <div className="f-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="section">
          <div className="section-head">
            <h2>Használat</h2>
            <p>3 lépés, ugyanaz a logika mint a map oldalon.</p>
          </div>

          <div className="steps">
            <div className="step blur-bg">
              <div className="step-n">1</div>
              <div className="step-body">
                <div className="step-title">
                  <i className="fa-solid fa-map" /> Térkép megnyitása
                </div>
                <div className="step-sub">Menj a térkép oldalra és indulhat.</div>
              </div>
            </div>

            <div className="step blur-bg">
              <div className="step-n">2</div>
              <div className="step-body">
                <div className="step-title">
                  <i className="fa-solid fa-layer-group" /> Rétegek választása
                </div>
                <div className="step-sub">
                  Kapcsold be a kategóriákat / pontokat.
                </div>
              </div>
            </div>

            <div className="step blur-bg">
              <div className="step-n">3</div>
              <div className="step-body">
                <div className="step-title">
                  <i className="fa-solid fa-circle-info" /> Részletek panel
                </div>
                <div className="step-sub">
                  Kattintás → gyors infó → döntés.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta blur-strong">
          <div>
            <h2>Mehet a túra?</h2>
            <p>Nyisd meg a térképet, és válogass a helyek között.</p>
          </div>
          <div className="cta-actions">
            <Link to="/terkep" className="btn-primary">
              <i className="fa-solid fa-map" />
              <span>Irány a térkép</span>
            </Link>
          </div>
        </section>

        <footer className="footer">
          <div>© {new Date().getFullYear()} Két Keréken</div>
          <div className="footer-pills">
            <span className="pill blur-bg">
              <i className="fa-brands fa-react" /> React
            </span>
            <span className="pill blur-bg">
              <i className="fa-solid fa-bolt" /> Vite
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}