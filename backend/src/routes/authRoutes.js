import { Router } from "express"
import { authRequired } from "../middleware/authMiddleware.js"
import {
  register,
  login,
  logout,
  me,
  requestPasswordReset,
  verifyPasswordResetToken,
  resetPassword
} from "../controllers/authController.js"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.get("/me", authRequired, me)
router.post("/forgot-password", requestPasswordReset)
router.get("/reset-password/verify", verifyPasswordResetToken)
router.post("/reset-password", resetPassword)

export default router
