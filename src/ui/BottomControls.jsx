export default function BottomControls({
  search,
  onSearch,
  onMenu,
  onLayers,
  onLocation,
  layersActive
}) {
  return (
    <div id="bottom-controls">
      <div className="control-group">
        <div className="control-btn" id="location-btn" title="Saját helyzet" onClick={onLocation}>
          <i className="fas fa-location-arrow"></i>
        </div>
        <div
          className={"control-btn" + (layersActive ? " active" : "")}
          id="layers-btn"
          title="Térkép rétegek"
          onClick={onLayers}
        >
          <i className="fas fa-layer-group"></i>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Keress helyeket vagy útvonalakat..."
          value={search}
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>

      <div className="control-group">
        <div className="control-btn" id="menu-btn" title="Menü" onClick={onMenu}>
          <i className="fas fa-bars"></i>
        </div>
      </div>
    </div>
  );
}