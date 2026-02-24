export default function LayerPanel({ open, layerType, onChange }) {
  return (
    <div id="layer-panel" className={open ? "open" : ""}>
      <div className="layer-title">
        <i className="fas fa-layer-group"></i>
        Térkép rétegek
      </div>

      <div className="layer-option" onClick={() => onChange("standard")}>
        <input type="radio" readOnly checked={layerType === "standard"} />
        <label>Alap térkép</label>
      </div>

      <div className="layer-option" onClick={() => onChange("satellite")}>
        <input type="radio" readOnly checked={layerType === "satellite"} />
        <label>Műhold</label>
      </div>

      <div className="layer-option" onClick={() => onChange("terrain")}>
        <input type="radio" readOnly checked={layerType === "terrain"} />
        <label>Domborzati</label>
      </div>
    </div>
  );
}