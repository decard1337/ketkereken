import { normalizeNehezseg, labelNehezseg } from "../lib/normalize";

export default function PanelList({ type, items, selected, onSelect }) {
  if (!type) return <div className="panel-lista" />;

  return (
    <div className="panel-lista">
      {items?.length ? items.map((item) => {
        const active = selected && selected.type === type && String(selected.id) === String(item.id);

        if (type === "utvonal") {
          const n = normalizeNehezseg(item.nehezseg);
          const badgeClass = n === "konnyu" ? "nehezseg-konnyu" : n === "kozepes" ? "nehezseg-kozepes" : "nehezseg-nehez";

          return (
            <div
              key={item.id}
              className={"panel-card" + (active ? " active" : "")}
              onClick={() => onSelect?.({ type, id: item.id })}
            >
              <div className="panel-cim">
                <i className="fas fa-route" />
                {item.cim}
                <span className={`nehezseg-badge ${badgeClass}`}>
                  {labelNehezseg(item.nehezseg)}
                </span>
              </div>
              <div className="panel-leiras">{item.leiras}</div>
              <div className="panel-info">
                <div className="info-item">
                  <i className="fas fa-road" /> {item.hossz}
                </div>
                <div className="info-item">
                  <i className="fas fa-clock" /> {item.idotartam}
                </div>
              </div>
            </div>
          );
        }

        if (type === "destinacio") {
          return (
            <div
              key={item.id}
              className={"panel-card" + (active ? " active" : "")}
              onClick={() => onSelect?.({ type, id: item.id })}
            >
              <div className="panel-cim">
                <i className="fas fa-map-marker-alt" />
                {item.nev}
              </div>
              <div className="panel-leiras">{item.leiras}</div>
              <div className="panel-info">
                <div className="info-item"><i className="fas fa-star" /> {item.ertekeles}/5</div>
                <div className="info-item"><i className="fas fa-tag" /> {item.tipus}</div>
              </div>
            </div>
          );
        }

        if (type === "esemeny") {
          const d = item.datum ? new Date(item.datum).toLocaleDateString("hu-HU") : "";
          return (
            <div
              key={item.id}
              className={"panel-card" + (active ? " active" : "")}
              onClick={() => onSelect?.({ type, id: item.id })}
            >
              <div className="panel-cim">
                <i className="fas fa-calendar-alt" />
                {item.nev}
              </div>
              <div className="panel-leiras">{item.leiras}</div>
              <div className="panel-info">
                <div className="info-item"><i className="fas fa-clock" /> {d}</div>
                <div className="info-item"><i className="fas fa-users" /> {item.resztvevok} résztvevő</div>
              </div>
            </div>
          );
        }

        // kolcsonzo
        return (
          <div
            key={item.id}
            className={"panel-card" + (active ? " active" : "")}
            onClick={() => onSelect?.({ type, id: item.id })}
          >
            <div className="panel-cim">
              <i className="fas fa-bicycle" />
              {item.nev}
            </div>
            <div className="panel-leiras">{item.cim}</div>
            <div className="panel-info">
              <div className="info-item"><i className="fas fa-euro-sign" /> {item.ar} Ft/nap</div>
              <div className="info-item"><i className="fas fa-phone" /> {item.telefon}</div>
            </div>
          </div>
        );
      }) : (
        <div style={{ color: "white", textAlign: "center", padding: 20, opacity: 0.8 }}>
          <p>Nincs elérhető adat</p>
        </div>
      )}
    </div>
  );
}