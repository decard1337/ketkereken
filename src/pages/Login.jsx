import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(email.trim(), password);
      nav("/terkep");
    } catch (e2) {
      setErr(e2.message || "Hiba");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card blur-strong">
        <h1>Bejelentkezés</h1>
        <form onSubmit={submit} className="auth-form">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Jelszó" />
          {err && <div className="auth-error">{err}</div>}
          <button type="submit" className="auth-btn">Belépés</button>
        </form>
        <div className="auth-links">
          <span>Nincs fiókod?</span> <Link to="/register">Regisztráció</Link>
        </div>
      </div>
    </div>
  );
}