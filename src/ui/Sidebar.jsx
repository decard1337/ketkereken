import { iconForMenu } from "../lib/icons";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Sidebar({ open, menu, onClose, onOpen, onMenuClick }) {
  const { user, logout } = useAuth();

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

          {user?.role === "admin" && (
            <Link to="/admin" className="item" onClick={onClose} style={{ textDecoration: "none" }}>
              <div className="item-icon">
                <i className="fas fa-user-shield" />
              </div>
              <span>Admin panel</span>
            </Link>
          )}

          {!user && (
            <Link to="/login" className="item" onClick={onClose} style={{ textDecoration: "none" }}>
              <div className="item-icon">
                <i className="fas fa-right-to-bracket" />
              </div>
              <span>Bejelentkezés</span>
            </Link>
          )}

          {user && (
            <div className="item" onClick={async () => { await logout(); onClose(); }}>
              <div className="item-icon">
                <i className="fas fa-right-from-bracket" />
              </div>
              <span>Kijelentkezés</span>
            </div>
          )}
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