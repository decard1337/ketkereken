import { useState } from "react"
import { useAuth } from "../lib/auth"

export default function Sidebar({
  open,
  menu,
  onClose,
  onOpen,
  onMenuClick
}) {
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  const profileImage = user?.profilkep
    ? `http://localhost:3001${user.profilkep}`
    : null

  return (
    <>
      <aside id="sidebar" className={open ? "" : "closed"}>
        <button
          id="close-btn"
          onClick={() => {
            setProfileOpen(false)
            onClose?.()
          }}
          title="Bezárás"
        >
          <i className="fas fa-times" />
        </button>

        <div className="sidebar-profile-block">
          <button
            className="sidebar-profile-trigger"
            onClick={() => setProfileOpen(v => !v)}
            type="button"
          >
            <div className="sidebar-profile-avatar">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profilkép"
                  className="sidebar-profile-avatarImg"
                />
              ) : (
                <i className="fas fa-user" />
              )}
            </div>

            <div className="sidebar-profile-texts">
              <div className="sidebar-profile-name">
                {user ? user.username || "Profil" : "Vendég"}
              </div>
              <div className="sidebar-profile-sub">
                {user ? "Profil lehetőségek" : "Bejelentkezés szükséges"}
              </div>
            </div>

            <div className={"sidebar-profile-chevron" + (profileOpen ? " open" : "")}>
              <i className="fas fa-chevron-down" />
            </div>
          </button>

          {profileOpen && (
            <div className="sidebar-profile-menu">
              {!user ? (
                <a className="sidebar-profile-menuItem" href="/login">
                  <i className="fas fa-right-to-bracket" />
                  <span>Bejelentkezés</span>
                </a>
              ) : (
                <>
                  <a
                    className="sidebar-profile-menuItem"
                    href={`/u/${user.username}`}
                  >
                    <i className="fas fa-user-circle" />
                    <span>Profil</span>
                  </a>

                  {String(user.role).toLowerCase() === "admin" && (
                    <a className="sidebar-profile-menuItem" href="/admin">
                      <i className="fas fa-shield-halved" />
                      <span>Admin panel</span>
                    </a>
                  )}

                  <button
                    className="sidebar-profile-menuItem danger"
                    type="button"
                    onClick={logout}
                  >
                    <i className="fas fa-right-from-bracket" />
                    <span>Kijelentkezés</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="sidebar-menu-title">Kategóriák</div>

        <div className="menu-list sidebar-menu-list">
          {user && (
            <button
              className="item sidebar-menu-item sidebar-menu-item-favorites"
              onClick={() => {
                setProfileOpen(false)
                onMenuClick?.("kedvencek")
              }}
              type="button"
            >
              <div className="item-icon sidebar-menu-icon">
                <i className="fas fa-heart" />
              </div>
              <div className="sidebar-menu-label">Kedvencek</div>
            </button>
          )}

          {menu.map(item => (
            <button
              key={item.id}
              className="item sidebar-menu-item"
              onClick={() => {
                setProfileOpen(false)
                onMenuClick?.(item.link)
              }}
              type="button"
            >
              <div className="item-icon sidebar-menu-icon">
                <i className={`fas fa-${item.ikon || "circle"}`} />
              </div>

              <div className="sidebar-menu-label">{item.nev}</div>
            </button>
          ))}
        </div>

        <div className="sidebar-bottom-card">
          <div className="sidebar-bottom-title">Gyors tipp</div>
          <div className="sidebar-bottom-text">
            Válassz egy kategóriát, majd kattints egy pontra a térképen a részletek megnyitásához.
          </div>
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