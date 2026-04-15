import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../lib/api"
import { useAuth } from "../lib/auth"
import "../styles/auth.css"

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)

  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotErr, setForgotErr] = useState("")
  const [forgotMsg, setForgotMsg] = useState("")

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

  function openForgotPassword() {
    setForgotEmail(email.trim())
    setForgotErr("")
    setForgotMsg("")
    setForgotOpen(true)
  }

  function closeForgotPassword() {
    if (forgotLoading) return
    setForgotOpen(false)
    setForgotErr("")
    setForgotMsg("")
  }

  async function submitForgotPassword(e) {
    e.preventDefault()
    setForgotErr("")
    setForgotMsg("")
    setForgotLoading(true)

    try {
      const res = await api.forgotPassword(forgotEmail.trim())
      setForgotMsg(res?.message || "Ha létezik ilyen fiók, elküldtük a linket.")
    } catch (e2) {
      setForgotErr(e2.message || "Nem sikerült elküldeni a linket")
    } finally {
      setForgotLoading(false)
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
              <div className="authx-sub">Országos bringás közösségi platform</div>
            </div>
          </Link>

          <div className="authx-copy">
            <div className="authx-badge">
              <span className="dot" />
              <span>Bejelentkezés</span>
            </div>

            <h1>Lépj be a Két Keréken felületére.</h1>

            <p>
              Jelentkezz be, hogy elérd a profilodat, a mentett helyeket,
              az aktivitásaidat és a közösségi funkciókat.
            </p>

            <div className="authx-points">
              <div className="point">
                <i className="fa-solid fa-map" />
                <span>Országos térképes böngészés</span>
              </div>
              <div className="point">
                <i className="fa-solid fa-heart" />
                <span>Kedvencek, reakciók és kommentek</span>
              </div>
              <div className="point">
                <i className="fa-solid fa-user-group" />
                <span>Közösségi feed és profilkezelés</span>
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
                  <span>Email cím</span>
                  <div className="authx-inputWrap">
                    <i className="fa-solid fa-envelope" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Add meg az email címed"
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
                      placeholder="Add meg a jelszavad"
                      autoComplete="current-password"
                    />
                  </div>
                </label>

                <div className="authx-inlineAction">
                  <button
                    type="button"
                    className="authx-forgotText"
                    onClick={openForgotPassword}
                  >
                    Elfelejtett jelszó?
                  </button>
                </div>

                {err && <div className="authx-msg err">{err}</div>}

                <button className="authx-btn primary" type="submit" disabled={loading}>
                  <i className="fa-solid fa-right-to-bracket" />
                  <span>{loading ? "Bejelentkezés..." : "Bejelentkezés"}</span>
                </button>
              </form>

              <div className="authx-bottom">
                <span>Még nincs fiókod?</span>
                <Link to="/register">Regisztrálj</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {forgotOpen && (
        <div className="authx-forgotLayer">
          <div className="authx-forgotOverlay" onClick={closeForgotPassword} />

          <div className="authx-forgotCard" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="authx-forgotClose"
              onClick={closeForgotPassword}
              disabled={forgotLoading}
            >
              <i className="fa-solid fa-xmark" />
            </button>

            <div className="authx-forgotTop">
              <div className="authx-forgotIcon">
                <i className="fa-solid fa-key" />
              </div>

            </div>

            <h2>Elfelejtett jelszó</h2>
            <p>
              Add meg az email címed, és ha tartozik hozzá fiók, küldünk egy
              jelszó-visszaállító linket.
            </p>

            <form className="authx-form authx-forgotForm" onSubmit={submitForgotPassword}>
              <label className="authx-field">
                <span>Email cím</span>
                <div className="authx-inputWrap">
                  <i className="fa-solid fa-envelope" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="Add meg az email címed"
                    autoComplete="email"
                  />
                </div>
              </label>

              {forgotErr && <div className="authx-msg err">{forgotErr}</div>}
              {forgotMsg && <div className="authx-msg ok">{forgotMsg}</div>}

              <div className="authx-forgotActions">
                <button
                  type="button"
                  className="authx-btn"
                  onClick={closeForgotPassword}
                  disabled={forgotLoading}
                >
                  Mégse
                </button>

                <button className="authx-btn primary" type="submit" disabled={forgotLoading}>
                  <span>{forgotLoading ? "Küldés..." : "Link küldése"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}