<<<<<<< HEAD
import { formatShortDate } from "../lib/date"

=======
>>>>>>> d3fda18727ce8b2d98d799fc65d84bbb28bad97f
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
  if (type === "kedvencek") return "heart"
  return "circle"
}

export default function PanelList({
  type,
  items,
  selected,
  onSelect,
  isKedvenc,
  onToggleKedvenc,
  kedvencLoadingId,
  getCelTipusFromSelectedType
}) {
  return (
    <div className="panel-lista">
      {items.map(item => {
        const realType = type === "kedvencek" ? item.__type : type

        const isActive =
          selected &&
          selected.type === realType &&
          String(selected.id) === String(item.id)

        const title = item.cim || item.nev || `#${item.id}`

        let subtitle = item.leiras || ""
        if (!subtitle && realType === "kolcsonzo") {
          subtitle = item.cim || ""
        }

        const celTipus = getCelTipusFromSelectedType(realType)
        const kedvenc = isKedvenc?.(celTipus, item.id)
        const favLoading = kedvencLoadingId === `${celTipus}-${item.id}`

        return (
          <button
            key={`${realType}-${item.id}`}
            className={"panel-card panel-card-favLayout" + (isActive ? " active" : "")}
            onClick={() => onSelect?.({ type: realType, id: item.id })}
            type="button"
          >
            <div className="panel-card-main">
              <div className="panel-cim">
                <i className={`fas fa-${getTypeIcon(realType)}`} />
                <span>{title}</span>

                {realType === "utvonal" && item.nehezseg && (
                  <span className={"nehezseg-badge " + getDifficultyClass(item.nehezseg)}>
                    {item.nehezseg}
                  </span>
                )}
              </div>

              {subtitle && (
                <div className="panel-leiras">{subtitle}</div>
              )}

              <div className="panel-info">
                {realType === "utvonal" && item.hossz && <span>{item.hossz} km</span>}
                {realType === "utvonal" && item.idotartam && <span>{item.idotartam}</span>}

<<<<<<< HEAD
                {realType === "esemeny" && item.datum && <span>{formatShortDate(item.datum)}</span>}
=======
                {realType === "esemeny" && item.datum && <span>{item.datum}</span>}
>>>>>>> d3fda18727ce8b2d98d799fc65d84bbb28bad97f
                {realType === "esemeny" && item.resztvevok && <span>{item.resztvevok} fő</span>}

                {realType === "kolcsonzo" && item.ar && <span>{item.ar}</span>}
                {realType === "kolcsonzo" && item.nyitvatartas && <span>{item.nyitvatartas}</span>}
              </div>
            </div>

            <div className="panel-card-side">
              <button
                type="button"
                className={"panel-favBtn" + (kedvenc ? " active" : "")}
                onClick={e => {
                  e.stopPropagation()
                  onToggleKedvenc?.(celTipus, item.id)
                }}
                title={kedvenc ? "Kedvencekből törlés" : "Kedvencekhez adás"}
                disabled={favLoading}
              >
                <i className={kedvenc ? "fa-solid fa-heart" : "fa-regular fa-heart"} />
              </button>
            </div>
          </button>
        )
      })}
    </div>
  )
}