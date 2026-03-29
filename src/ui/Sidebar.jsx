export default function Sidebar({ open, menu, onClose, onOpen, onMenuClick }) {
  return (
    <>
      <aside id="sidebar" className={open ? "" : "closed"}>
        <button id="close-btn" onClick={onClose} title="Bezárás">
          <i className="fas fa-times" />
        </button>

        <div className="menu-list">
          {menu.map(item => (
            <div
              key={item.id}
              className="item"
              onClick={() => onMenuClick?.(item.link)}
            >
              <div className="item-icon">
                <i className={`fas fa-${item.ikon || "circle"}`} />
              </div>

              <div>{item.nev}</div>
            </div>
          ))}
        </div>
      </aside>

      {!open && (
        <button id="reopen-tab" onClick={onOpen} title="Menü megnyitása">
          <span>›</span>
        </button>
      )}
    </>
  )
}