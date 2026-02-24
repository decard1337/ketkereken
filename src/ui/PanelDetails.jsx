import { labelNehezseg, normalizeNehezseg } from "../lib/normalize";

export default function PanelDetails({ type, items, selected }) {
  if (!type) return <div className="panel-reszletek" />;

  const data =
    selected && selected.type === type
      ? items.find(x => String(x.id) === String(selected.id))
      : null;

  return (
    <div className={"panel-reszletek" + (data ? " active" : "")}>
      {!data ? (
        <div style={{ color: "rgba(255,255,255,0.8)" }}>
          Válassz egy elemet a listából…
        </div>
      ) : (
        <>
          {type === "utvonal" && (
            <>
              <div className="reszletek-header">
                <h2 className="reszletek-cim">
                  <i className="fas fa-route" />
                  {data.cim}
                </h2>
                <p className="reszletek-leiras">{data.leiras}</p>
              </div>

              <div className="reszletek-grid">
                <div className="reszletek-item">
                  <div className="reszletek-ertek">{data.hossz}</div>
                  <div className="reszletek-cimke">Hossz</div>
                </div>
                <div className="reszletek-item">
                  <div className="reszletek-ertek">{data.idotartam}</div>
                  <div className="reszletek-cimke">Időtartam</div>
                </div>
                <div className="reszletek-item">
                  <div className="reszletek-ertek">{data.szintkulonbseg}</div>
                  <div className="reszletek-cimke">Szintkülönbség</div>
                </div>
                <div className="reszletek-item">
                  <div
                    className="reszletek-ertek"
                    style={{
                      color:
                        normalizeNehezseg(data.nehezseg) === "konnyu"
                          ? "#34C759"
                          : normalizeNehezseg(data.nehezseg) === "kozepes"
                          ? "#FF9500"
                          : "#FF3B30",
                    }}
                  >
                    {labelNehezseg(data.nehezseg)}
                  </div>
                  <div className="reszletek-cimke">Nehézség</div>
                </div>
              </div>
            </>
          )}

          {type === "destinacio" && (
            <>
              <div className="reszletek-header">
                <h2 className="reszletek-cim">
                  <i className="fas fa-map-marker-alt" />
                  {data.nev}
                </h2>
                <p className="reszletek-leiras">{data.leiras}</p>
              </div>

              <div className="reszletek-grid">
                <div className="reszletek-item">
                  <div className="reszletek-ertek" style={{ color: "#FFD700" }}>
                    {data.ertekeles}
                  </div>
                  <div className="reszletek-cimke">Értékelés</div>
                </div>
                <div className="reszletek-item">
                  <div className="reszletek-ertek">{data.tipus}</div>
                  <div className="reszletek-cimke">Típus</div>
                </div>
              </div>
            </>
          )}

          {type === "esemeny" && (
            <>
              <div className="reszletek-header">
                <h2 className="reszletek-cim">
                  <i className="fas fa-calendar-alt" />
                  {data.nev}
                </h2>
                <p className="reszletek-leiras">{data.leiras}</p>
              </div>

              <div className="reszletek-grid">
                <div className="reszletek-item">
                  <div className="reszletek-ertek">
                    {data.datum ? new Date(data.datum).toLocaleDateString("hu-HU") : ""}
                  </div>
                  <div className="reszletek-cimke">Dátum</div>
                </div>
                <div className="reszletek-item">
                  <div className="reszletek-ertek">{data.resztvevok}</div>
                  <div className="reszletek-cimke">Résztvevők</div>
                </div>
                <div className="reszletek-item">
                  <div className="reszletek-ertek">{data.tipus}</div>
                  <div className="reszletek-cimke">Típus</div>
                </div>
              </div>
            </>
          )}

          {type === "kolcsonzo" && (
            <>
              <div className="reszletek-header">
                <h2 className="reszletek-cim">
                  <i className="fas fa-bicycle" />
                  {data.nev}
                </h2>
                <p className="reszletek-leiras">{data.cim}</p>
              </div>

              <div className="reszletek-grid">
                <div className="reszletek-item">
                  <div className="reszletek-ertek">{data.ar}</div>
                  <div className="reszletek-cimke">Ár (Ft/nap)</div>
                </div>
                <div className="reszletek-item">
                  <div className="reszletek-ertek">{data.telefon}</div>
                  <div className="reszletek-cimke">Telefon</div>
                </div>
                <div className="reszletek-item">
                  <div className="reszletek-ertek">{data.nyitvatartas}</div>
                  <div className="reszletek-cimke">Nyitvatartás</div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}