export default function PanelList({ type, items, selected, onSelect }) {
  return (
    <div className="panel-lista">
      {items.map(item => {
        const isActive =
          selected &&
          selected.type === type &&
          String(selected.id) === String(item.id)

        const title = item.cim || item.nev || `#${item.id}`

        let subtitle = item.leiras || ""

        if (!subtitle && type === "kolcsonzo") {
          subtitle = item.cim || ""
        }

        return (
          <div
            key={item.id}
            className={"panel-card" + (isActive ? " active" : "")}
            onClick={() => onSelect?.({ type, id: item.id })}
          >
            <div className="panel-cim">
              {type === "utvonal" && <i className="fas fa-route" />}
              {type === "destinacio" && <i className="fas fa-map-marker-alt" />}
              {type === "esemeny" && <i className="fas fa-calendar-alt" />}
              {type === "kolcsonzo" && <i className="fas fa-bicycle" />}
              <span>{title}</span>

              {type === "utvonal" && item.nehezseg && (
                <span
                  className={
                    "nehezseg-badge " +
                    (item.nehezseg === "könnyű" || item.nehezseg === "konnyu"
                      ? "nehezseg-konnyu"
                      : item.nehezseg === "közepes" || item.nehezseg === "kozepes"
                      ? "nehezseg-kozepes"
                      : "nehezseg-nehez")
                  }
                >
                  {item.nehezseg}
                </span>
              )}
            </div>

            {subtitle && (
              <div className="panel-leiras">{subtitle}</div>
            )}

            <div className="panel-info">
              {type === "utvonal" && item.hossz && <span>{item.hossz} km</span>}
              {type === "utvonal" && item.idotartam && <span>{item.idotartam}</span>}

              {type === "esemeny" && item.datum && <span>{item.datum}</span>}
              {type === "esemeny" && item.resztvevok && <span>{item.resztvevok} fő</span>}

              {type === "kolcsonzo" && item.ar && <span>{item.ar}</span>}
              {type === "kolcsonzo" && item.nyitvatartas && <span>{item.nyitvatartas}</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}