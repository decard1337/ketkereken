import PanelList from "./PanelList"
import PanelDetails from "./PanelDetails"

export default function Panels({
  activePanel,
  onClose,
  onBackToList,
  utvonalak,
  destinaciok,
  esemenyek,
  kolcsonzok,
  selected,
  onSelect
}) {
  const isOpen = Boolean(activePanel)

  let title = ""
  let icon = ""
  let items = []
  let type = ""

  if (activePanel === "utvonalak") {
    title = "Útvonalak"
    icon = "route"
    items = utvonalak
    type = "utvonal"
  }

  if (activePanel === "destinaciok") {
    title = "Desztinációk"
    icon = "map-marker-alt"
    items = destinaciok
    type = "destinacio"
  }

  if (activePanel === "esemenyek") {
    title = "Események"
    icon = "calendar-alt"
    items = esemenyek
    type = "esemeny"
  }

  if (activePanel === "kolcsonzok") {
    title = "Kölcsönzők"
    icon = "bicycle"
    items = kolcsonzok
    type = "kolcsonzo"
  }

  const detailsOpen = Boolean(selected && selected.type === type)

  return (
    <>
      <div className={"panel panel-listMode" + (isOpen && !detailsOpen ? " open" : "")} style={{ zIndex: 1000 }}>
        <div className="panel-header">
          <h2 className="panel-title">
            <i className={`fas fa-${icon}`} />
            {title || "Panel"}
          </h2>

          <div className="panel-controls">
            <button className="panel-btn panel-close-btn" onClick={onClose} title="Panel bezárása">
              <i className="fas fa-times" />
            </button>
          </div>
        </div>

        <div className="panel-content panel-content-listOnly">
          <PanelList
            type={type}
            items={items}
            selected={selected}
            onSelect={onSelect}
          />
        </div>
      </div>

      <div className={"side-details-panel" + (detailsOpen ? " open" : "")}>
        <div className="side-details-shell">
          <div className="side-details-top">
            <button
              className="side-back-btn"
              onClick={() => onBackToList?.()}
              title="Vissza"
            >
              <i className="fas fa-arrow-left" />
            </button>

            <div className="side-details-topTitle">
              <i className={`fas fa-${icon}`} />
              <span>{title}</span>
            </div>

            <button
              className="panel-btn panel-close-btn"
              onClick={onClose}
              title="Bezárás"
            >
              <i className="fas fa-times" />
            </button>
          </div>

          <div className="side-details-content">
            <PanelDetails
              type={type}
              items={items}
              selected={selected}
            />
          </div>
        </div>
      </div>
    </>
  )
}