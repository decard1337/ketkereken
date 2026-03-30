import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../lib/auth"
import "../styles/auth.css"

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr("")
    setLoading(true)

    try {
      await login(email.trim(), password)
      nav("/terkep")
    } catch (e2) {
      setErr(e2.message || "Hiba történt")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="authx">
      <div className="authx-bg">
        <div className="authx-blob a" />
        <div className="authx-blob b" />
        <div className="authx-grid" />
      </div>

      <div className="authx-shell">
        <div className="authx-left">
          <Link to="/" className="authx-brand">
            <div className="authx-mark">
              <i className="fa-solid fa-bicycle" />
            </div>
            <div className="authx-brandText">
              <div className="authx-name">Két Keréken</div>
              <div className="authx-sub">Minimal map platform</div>
            </div>
          </Link>

          <div className="authx-copy">
            <div className="authx-badge">
              <span className="dot" />
              <span>Belépés</span>
            </div>

            <h1>Jelentkezz be, és folytasd ott, ahol abbahagytad.</h1>

            <p>
              Útvonalak, események, helyek és admin felület – ugyanabban a letisztult,
              sötét UI-ban.
            </p>

            <div className="authx-points">
              <div className="point">
                <i className="fa-solid fa-route" />
                <span>Gyors hozzáférés az útvonalakhoz</span>
              </div>
              <div className="point">
                <i className="fa-solid fa-location-dot" />
                <span>Térkép-központú élmény</span>
              </div>
              <div className="point">
                <i className="fa-solid fa-shield-halved" />
                <span>Jogosultság alapú admin rendszer</span>
              </div>
            </div>
          </div>
        </div>

        <div className="authx-right">
          <div className="authx-card">
            <div className="authx-cardGlow" />

            <div className="authx-cardIn">
              <div className="authx-head">
                <div>
                  <div className="authx-title">Bejelentkezés</div>
                  <div className="authx-muted">Lépj be a fiókodba</div>
                </div>
              </div>

              <form className="authx-form" onSubmit={submit}>
                <label className="authx-field">
                  <span>Email</span>
                  <div className="authx-inputWrap">
                    <i className="fa-solid fa-envelope" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="email@pelda.hu"
                      autoComplete="email"
                    />
                  </div>
                </label>

                <label className="authx-field">
                  <span>Jelszó</span>
                  <div className="authx-inputWrap">
                    <i className="fa-solid fa-lock" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Jelszó"
                      autoComplete="current-password"
                    />
                  </div>
                </label>

                {err && <div className="authx-msg err">{err}</div>}

                <button className="authx-btn primary" type="submit" disabled={loading}>
                  <i className="fa-solid fa-right-to-bracket" />
                  <span>{loading ? "Belépés..." : "Belépés"}</span>
                </button>
              </form>

              <div className="authx-bottom">
                <span>Nincs még fiókod?</span>
                <Link to="/register">Regisztráció</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}