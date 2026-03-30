import dotenv from "dotenv"
import app from "./src/app.js"

dotenv.config()

const PORT = Number(process.env.PORT || 3001)

app.listen(PORT, () => {
  console.log(`API fut: http://localhost:${PORT}`)
})
