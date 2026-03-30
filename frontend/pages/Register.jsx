import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../lib/auth"
import "../styles/auth.css"

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()

  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr("")
    setLoading(true)

    try {
      await register(email.trim(), username.trim(), password)
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
              <span>Regisztráció</span>
            </div>

            <h1>Hozd létre a fiókod pár másodperc alatt.</h1>

            <p>
              Csatlakozz, ments útvonalakat, használd a térképet, és ha admin vagy,
              kezeld az egész rendszert egy helyről.
            </p>

            <div className="authx-points">
              <div className="point">
                <i className="fa-solid fa-user-plus" />
                <span>Gyors regisztráció</span>
              </div>
              <div className="point">
                <i className="fa-solid fa-map" />
                <span>Egységes dark UI minden oldalon</span>
              </div>
              <div className="point">
                <i className="fa-solid fa-sparkles" />
                <span>Minimal, modern felület</span>
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
                  <div className="authx-title">Regisztráció</div>
                  <div className="authx-muted">Új fiók létrehozása</div>
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
                  <span>Felhasználónév</span>
                  <div className="authx-inputWrap">
                    <i className="fa-solid fa-user" />
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Felhasználónév"
                      autoComplete="username"
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
                      placeholder="Minimum 6 karakter"
                      autoComplete="new-password"
                    />
                  </div>
                </label>

                {err && <div className="authx-msg err">{err}</div>}

                <button className="authx-btn primary" type="submit" disabled={loading}>
                  <i className="fa-solid fa-user-plus" />
                  <span>{loading ? "Létrehozás..." : "Fiók létrehozása"}</span>
                </button>
              </form>

              <div className="authx-bottom">
                <span>Van már fiókod?</span>
                <Link to="/login">Bejelentkezés</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}