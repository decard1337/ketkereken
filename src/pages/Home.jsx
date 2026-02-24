import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light fixed-top home-navbar">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <i className="fas fa-bicycle me-2" />
            Két Keréken
          </Link>

          <div className="ms-auto">
            <Link className="btn btn-warning text-white" to="/terkep">
              <i className="fas fa-map-marked-alt me-2" />
              Térkép
            </Link>
          </div>
        </div>
      </nav>

      <header className="home-hero">
        <div className="container">
          <h1 className="home-hero-title">Fedezd fel a várost két keréken</h1>
          <p className="home-hero-subtitle">
            Útvonalak, desztinációk, események, kölcsönzők – mind egy helyen.
          </p>
          <Link to="/terkep" className="btn btn-warning btn-lg text-white">
            <i className="fas fa-map-marked-alt me-2" />
            Térkép megnyitása
          </Link>
        </div>
      </header>

      <section className="container home-section">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card p-4 shadow-sm h-100">
              <div className="display-6 mb-2 text-success">
                <i className="fas fa-route" />
              </div>
              <h4>Útvonalak</h4>
              <p className="text-muted mb-0">
                Városi túrák, hegyi útvonalak, kedvenc körök.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-4 shadow-sm h-100">
              <div className="display-6 mb-2 text-warning">
                <i className="fas fa-map-marked-alt" />
              </div>
              <h4>Térkép</h4>
              <p className="text-muted mb-3">
                Interaktív térkép rétegekkel, kereséssel, markerekkel.
              </p>
              <Link to="/terkep" className="btn btn-success">
                Térkép
              </Link>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-4 shadow-sm h-100">
              <div className="display-6 mb-2 text-primary">
                <i className="fas fa-bicycle" />
              </div>
              <h4>Kölcsönzők</h4>
              <p className="text-muted mb-0">
                Gyorsan megtalálod a közeledben lévő kölcsönzőket.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="container">
          <div className="small opacity-75">© 2026 Két Keréken</div>
        </div>
      </footer>
    </div>
  );
}