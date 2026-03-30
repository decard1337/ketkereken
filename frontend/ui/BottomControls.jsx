export default function BottomControls({
  onMenu,
  onLayers,
  onLocation,
  layersActive
}) {
  return (
    <div id="bottom-controls" className="bottom-controls-minimal">
      <div className="control-group">
        <button className="control-btn" onClick={onMenu} title="Menü">
          <i className="fas fa-bars" />
        </button>

        <button
          className={"control-btn" + (layersActive ? " active" : "")}
          onClick={onLayers}
          title="Rétegek"
        >
          <i className="fas fa-layer-group" />
        </button>
      </div>

      <div className="control-group">
        <button className="control-btn" onClick={onLocation} title="Saját helyzet">
          <i className="fas fa-location-arrow" />
        </button>
      </div>
    </div>
  )
}