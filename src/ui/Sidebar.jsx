import { iconForMenu } from "../lib/icons";

export default function Sidebar({ open, menu, onClose, onOpen, onMenuClick }) {
  return (
    <>
      <div id="sidebar" className={open ? "" : "closed"}>
        <button id="close-btn" onClick={onClose}>✕</button>
        <div className="menu-list">
          {menu.map((m) => (
            <div
              key={m.id}
              className="item"
              onClick={() => onMenuClick?.(m.link)}
            >
              <div className="item-icon">
                <i className={`fas fa-${iconForMenu(m.link)}`} />
              </div>
              <span>{m.nev}</span>
            </div>
          ))}
        </div>
      </div>

      {!open && (
        <div id="reopen-tab" onClick={onOpen}>
          <span>&lt;</span>
        </div>
      )}
    </>
  );
}