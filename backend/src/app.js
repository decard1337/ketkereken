import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"

import { FRONTEND_ORIGIN } from "./config/env.js"
import authRoutes from "./routes/authRoutes.js"
import profileRoutes from "./routes/profileRoutes.js"
import favoriteRoutes from "./routes/favoriteRoutes.js"
import ratingRoutes from "./routes/ratingRoutes.js"
import imageRoutes from "./routes/imageRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import publicRoutes from "./routes/publicRoutes.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}))

app.use(express.json({ limit: "10mb" }))
app.use(cookieParser())
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

app.get("/health", (req, res) => {
  res.json({ ok: true })
})

app.use("/api/auth", authRoutes)
app.use("/api", profileRoutes)
app.use("/api/kedvencek", favoriteRoutes)
app.use("/api/ertekelesek", ratingRoutes)
app.use("/api/kepek", imageRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api", publicRoutes)

app.use((req, res) => {
  res.status(404).json({ error: "Az útvonal nem található" })
})

export default app
