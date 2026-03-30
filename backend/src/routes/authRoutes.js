import { Router } from "express"
import { authRequired } from "../middleware/authMiddleware.js"
import { register, login, logout, me } from "../controllers/authController.js"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.get("/me", authRequired, me)

export default router
