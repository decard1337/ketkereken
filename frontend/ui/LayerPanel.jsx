export default function LayerPanel({ open, layerType, onChange }) {
  return (
    <div id="layer-panel" className={open ? "open" : ""}>
      <div className="layer-title">
        <i className="fas fa-layer-group" />
        <span>Térkép rétegek</span>
      </div>

      <button className="layer-option" onClick={() => onChange("standard")} type="button">
        <input type="radio" readOnly checked={layerType === "standard"} />
        <label>Alap térkép</label>
      </button>

      <button className="layer-option" onClick={() => onChange("satellite")} type="button">
        <input type="radio" readOnly checked={layerType === "satellite"} />
        <label>Műhold</label>
      </button>

      <button className="layer-option" onClick={() => onChange("terrain")} type="button">
        <input type="radio" readOnly checked={layerType === "terrain"} />
        <label>Domborzati</label>
      </button>
    </div>
  )
}