function getDifficultyClass(value) {
  const v = String(value || "").toLowerCase()

  if (v === "könnyű" || v === "konnyu") return "nehezseg-konnyu"
  if (v === "közepes" || v === "kozepes") return "nehezseg-kozepes"
  return "nehezseg-nehez"
}

function getTypeIcon(type) {
  if (type === "utvonal") return "route"
  if (type === "destinacio") return "map-marker-alt"
  if (type === "esemeny") return "calendar-alt"
  if (type === "kolcsonzo") return "bicycle"
  return "circle"
}

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
          <button
            key={item.id}
            className={"panel-card" + (isActive ? " active" : "")}
            onClick={() => onSelect?.({ type, id: item.id })}
            type="button"
          >
            <div className="panel-cim">
              <i className={`fas fa-${getTypeIcon(type)}`} />
              <span>{title}</span>

              {type === "utvonal" && item.nehezseg && (
                <span className={"nehezseg-badge " + getDifficultyClass(item.nehezseg)}>
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
          </button>
        )
      })}
    </div>
  )
}