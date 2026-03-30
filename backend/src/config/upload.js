import multer from "multer"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const UPLOAD_DIR = path.join(__dirname, "../../uploads")

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "") || ".jpg"
    const fajlNev = `${Date.now()}-${Math.round(Math.random() * 1000000000)}${ext}`
    cb(null, fajlNev)
  }
})

export const upload = multer({ storage })
