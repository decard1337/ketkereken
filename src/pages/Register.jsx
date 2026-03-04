import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await register(email.trim(), username.trim(), password);
      nav("/terkep");
    } catch (e2) {
      setErr(e2.message || "Hiba");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card blur-strong">
        <h1>Regisztráció</h1>
        <form onSubmit={submit} className="auth-form">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Felhasználónév" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Jelszó (min. 6)" />
          {err && <div className="auth-error">{err}</div>}
          <button type="submit" className="auth-btn">Fiók létrehozása</button>
        </form>
        <div className="auth-links">
          <span>Van már fiókod?</span> <Link to="/login">Bejelentkezés</Link>
        </div>
      </div>
    </div>
  );
}