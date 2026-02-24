import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();

const app = express();
app.use(cors()); // dev-re oké
app.use(express.json());

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

// Helper: safe allow-list
const resources = new Set([
  "menu",
  "utvonalak",
  "destinaciok",
  "esemenyek",
  "kolcsonzok",
  "blippek",
]);

app.get("/api/:resource", async (req, res) => {
  const { resource } = req.params;

  if (!resources.has(resource)) {
    return res.status(400).json({ error: "Unknown resource" });
  }

  try {
    let sql = "";
    let params = [];

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

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB/API error" });
  }
});

// Start
const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});