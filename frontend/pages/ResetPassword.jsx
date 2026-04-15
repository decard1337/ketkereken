import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { api } from "../lib/api"
import "../styles/auth.css"

export default function ResetPassword() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const token = useMemo(() => params.get("token") || "", [params])

  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [valid, setValid] = useState(false)
  const [msg, setMsg] = useState("")
  const [err, setErr] = useState("")

  useEffect(() => {
    let mounted = true

    async function checkToken() {
      if (!token) {
        if (mounted) {
          setErr("Hiányzó jelszó-visszaállító link.")
          setValid(false)
          setChecking(false)
        }
        return
      }

      try {
        await api.verifyResetToken(token)
        if (mounted) {
          setValid(true)
          setErr("")
        }
      } catch (e) {
        if (mounted) {
          setValid(false)
          setErr(e.message || "Érvénytelen vagy lejárt link")
        }
      } finally {
        if (mounted) setChecking(false)
      }
    }

    checkToken()
    return () => { mounted = false }
  }, [token])

  async function submit(e) {
    e.preventDefault()
    setErr("")
    setMsg("")

    if (password.length < 6) {
      setErr("A jelszónak legalább 6 karakteresnek kell lennie")
      return
    }

    if (password !== password2) {
      setErr("A két jelszó nem egyezik")
      return
    }

    setLoading(true)
    try {
      await api.resetPassword(token, password)
      setMsg("A jelszavad sikeresen módosítva lett. Most már bejelentkezhetsz.")
      setTimeout(() => nav("/login"), 1400)
    } catch (e) {
      setErr(e.message || "Nem sikerült módosítani a jelszót")
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

      <div className="authx-shell authx-shell-center">
        <div className="authx-right authx-right-center">
          <div className="authx-card">
            <div className="authx-cardGlow" />
            <div className="authx-cardIn">
              <div className="authx-head">
                <div>
                  <div className="authx-title">Új jelszó beállítása</div>
                  <div className="authx-muted">Két Keréken fiók helyreállítás</div>
                </div>
              </div>

              {checking ? (
                <div className="authx-msg">Link ellenőrzése...</div>
              ) : valid ? (
                <form className="authx-form" onSubmit={submit}>
                  <label className="authx-field">
                    <span>Új jelszó</span>
                    <div className="authx-inputWrap">
                      <i className="fa-solid fa-lock" />
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Add meg az új jelszavad"
                        autoComplete="new-password"
                      />
                    </div>
                  </label>

                  <label className="authx-field">
                    <span>Új jelszó újra</span>
                    <div className="authx-inputWrap">
                      <i className="fa-solid fa-lock" />
                      <input
                        type="password"
                        value={password2}
                        onChange={e => setPassword2(e.target.value)}
                        placeholder="Írd be újra az új jelszót"
                        autoComplete="new-password"
                      />
                    </div>
                  </label>

                  {err && <div className="authx-msg err">{err}</div>}
                  {msg && <div className="authx-msg ok">{msg}</div>}

                  <button className="authx-btn primary" type="submit" disabled={loading}>
                    <i className="fa-solid fa-key" />
                    <span>{loading ? "Mentés..." : "Új jelszó mentése"}</span>
                  </button>
                </form>
              ) : (
                <>
                  {err && <div className="authx-msg err">{err}</div>}
                  <div className="authx-bottom">
                    <Link to="/login">Vissza a bejelentkezéshez</Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
