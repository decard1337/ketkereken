import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";

dotenv.config();

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret_change_me";
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "kk_token";
const TOKEN_TTL_DAYS = Number(process.env.TOKEN_TTL_DAYS ?? 7);

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => res.json({ ok: true }));

function signToken(user) {
  const payload = { id: user.id, role: user.role, email: user.email, username: user.username };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${TOKEN_TTL_DAYS}d` });
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

function clearAuthCookie(res) {
  res.cookie(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 0,
    path: "/",
  });
}

function getToken(req) {
  const fromCookie = req.cookies?.[COOKIE_NAME];
  if (fromCookie) return fromCookie;
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

function authRequired(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function adminRequired(req, res, next) {
  authRequired(req, res, () => {
    if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin only" });
    next();
  });
}

app.post("/api/auth/register", async (req, res) => {
  const { email, username, password } = req.body ?? {};
  if (!email || !username || !password) return res.status(400).json({ error: "Missing fields" });
  if (typeof password !== "string" || password.length < 6) return res.status(400).json({ error: "Weak password" });

  try {
    const [exists] = await pool.query("SELECT id FROM felhasznalok WHERE email=?", [email]);
    if (exists.length) return res.status(409).json({ error: "Email already used" });

    const password_hash = await bcrypt.hash(password, 12);
    const [ins] = await pool.query(
      "INSERT INTO felhasznalok (email, username, password_hash, role) VALUES (?,?,?, 'user')",
      [email, username, password_hash]
    );

    const user = { id: ins.insertId, email, username, role: "user" };
    const token = signToken(user);
    setAuthCookie(res, token);
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Register error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  try {
    const [rows] = await pool.query(
      "SELECT id, email, username, password_hash, role FROM felhasznalok WHERE email=? LIMIT 1",
      [email]
    );
    const u = rows?.[0];
    if (!u) return res.status(401).json({ error: "Bad credentials" });

    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: "Bad credentials" });

    const user = { id: u.id, email: u.email, username: u.username, role: u.role };
    const token = signToken(user);
    setAuthCookie(res, token);
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login error" });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

app.get("/api/auth/me", authRequired, async (req, res) => {
  res.json({ user: { id: req.user.id, email: req.user.email, username: req.user.username, role: req.user.role } });
});

const publicResources = new Set(["menu", "utvonalak", "destinaciok", "esemenyek", "kolcsonzok", "blippek"]);

app.get("/api/:resource", async (req, res) => {
  const { resource } = req.params;
  if (!publicResources.has(resource)) return res.status(400).json({ error: "Unknown resource" });

  try {
    let sql = "";

    switch (resource) {
      case "menu":
        sql = `
          SELECT id, nev, link, statusz, sorrend
          FROM menu
          WHERE statusz='aktiv'
          ORDER BY sorrend ASC, id ASC
        `;
        break;
      case "utvonalak":
        sql = `
          SELECT id, cim, leiras, koordinatak, hossz, nehezseg, statusz, idotartam, szintkulonbseg
          FROM utvonalak
          WHERE statusz='aktiv'
          ORDER BY id ASC
        `;
        break;
      case "destinaciok":
        sql = `
          SELECT id, nev, leiras, lat, lng, ertekeles, tipus, statusz
          FROM destinaciok
          WHERE statusz='aktiv'
          ORDER BY id ASC
        `;
        break;
      case "esemenyek":
        sql = `
          SELECT id, nev, leiras, lat, lng, datum, resztvevok, tipus, statusz
          FROM esemenyek
          WHERE statusz='aktiv' AND datum >= CURDATE()
          ORDER BY datum ASC, id ASC
        `;
        break;
      case "kolcsonzok":
        sql = `
          SELECT id, nev, cim, lat, lng, ar, telefon, nyitvatartas, statusz
          FROM kolcsonzok
          WHERE statusz='aktiv'
          ORDER BY id ASC
        `;
        break;
      case "blippek":
        sql = `
          SELECT id, nev, leiras, lat, lng, tipus, ikon, statusz
          FROM blippek
          WHERE statusz='aktiv'
          ORDER BY id ASC
        `;
        break;
    }

    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB/API error" });
  }
});

const adminResources = {
  utvonalak: {
    table: "utvonalak",
    id: "id",
    columns: ["cim", "leiras", "koordinatak", "hossz", "nehezseg", "statusz", "idotartam", "szintkulonbseg"],
  },
  destinaciok: {
    table: "destinaciok",
    id: "id",
    columns: ["nev", "leiras", "lat", "lng", "ertekeles", "tipus", "statusz"],
  },
  esemenyek: {
    table: "esemenyek",
    id: "id",
    columns: ["nev", "leiras", "lat", "lng", "datum", "resztvevok", "tipus", "statusz"],
  },
  kolcsonzok: {
    table: "kolcsonzok",
    id: "id",
    columns: ["nev", "cim", "lat", "lng", "ar", "telefon", "nyitvatartas", "statusz"],
  },
  blippek: {
    table: "blippek",
    id: "id",
    columns: ["nev", "leiras", "lat", "lng", "tipus", "ikon", "statusz"],
  },
  menu: {
    table: "menu",
    id: "id",
    columns: ["nev", "link", "statusz", "sorrend"],
  },
};

app.get("/api/admin/:resource", adminRequired, async (req, res) => {
  const cfg = adminResources[req.params.resource];
  if (!cfg) return res.status(400).json({ error: "Unknown resource" });

  try {
    const cols = [cfg.id, ...cfg.columns].join(", ");
    const [rows] = await pool.query(`SELECT ${cols} FROM ${cfg.table} ORDER BY ${cfg.id} ASC`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Admin list error" });
  }
});

app.post("/api/admin/:resource", adminRequired, async (req, res) => {
  const cfg = adminResources[req.params.resource];
  if (!cfg) return res.status(400).json({ error: "Unknown resource" });

  try {
    const body = req.body ?? {};
    const keys = cfg.columns.filter((k) => Object.prototype.hasOwnProperty.call(body, k));
    if (!keys.length) return res.status(400).json({ error: "No fields" });

    const placeholders = keys.map(() => "?").join(", ");
    const values = keys.map((k) => body[k]);

    const [r] = await pool.query(
      `INSERT INTO ${cfg.table} (${keys.join(", ")}) VALUES (${placeholders})`,
      values
    );

    const [rows] = await pool.query(
      `SELECT ${[cfg.id, ...cfg.columns].join(", ")} FROM ${cfg.table} WHERE ${cfg.id}=?`,
      [r.insertId]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Admin create error" });
  }
});

app.put("/api/admin/:resource/:id", adminRequired, async (req, res) => {
  const cfg = adminResources[req.params.resource];
  if (!cfg) return res.status(400).json({ error: "Unknown resource" });

  try {
    const body = req.body ?? {};
    const keys = cfg.columns.filter((k) => Object.prototype.hasOwnProperty.call(body, k));
    if (!keys.length) return res.status(400).json({ error: "No fields" });

    const setSql = keys.map((k) => `${k}=?`).join(", ");
    const values = keys.map((k) => body[k]);
    values.push(req.params.id);

    await pool.query(`UPDATE ${cfg.table} SET ${setSql} WHERE ${cfg.id}=?`, values);

    const [rows] = await pool.query(
      `SELECT ${[cfg.id, ...cfg.columns].join(", ")} FROM ${cfg.table} WHERE ${cfg.id}=?`,
      [req.params.id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Admin update error" });
  }
});

app.delete("/api/admin/:resource/:id", adminRequired, async (req, res) => {
  const cfg = adminResources[req.params.resource];
  if (!cfg) return res.status(400).json({ error: "Unknown resource" });

  try {
    await pool.query(`DELETE FROM ${cfg.table} WHERE ${cfg.id}=?`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Admin delete error" });
  }
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
  console.log(`CORS origin: ${FRONTEND_ORIGIN}`);
});