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
  kedvencItems = [],
  selected,
  onSelect,
  isKedvenc,
  onToggleKedvenc,
  kedvencLoadingId,
  getCelTipusFromSelectedType
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

  if (activePanel === "kedvencek") {
    title = "Kedvencek"
    icon = "heart"
    items = kedvencItems
    type = "kedvencek"
  }

  const detailsOpen =
    Boolean(selected) &&
    (type === "kedvencek"
      ? ["utvonal", "destinacio", "esemeny", "kolcsonzo"].includes(selected.type)
      : selected.type === type)

  let detailType = type
  let detailItems = items

  if (type === "kedvencek" && selected) {
    detailType = selected.type
    detailItems = kedvencItems.filter(item => item.__type === selected.type)
  }

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
            isKedvenc={isKedvenc}
            onToggleKedvenc={onToggleKedvenc}
            kedvencLoadingId={kedvencLoadingId}
            getCelTipusFromSelectedType={getCelTipusFromSelectedType}
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
              type={detailType}
              items={detailItems}
              selected={selected}
            />
          </div>
        </div>
      </div>
    </>
  )
}