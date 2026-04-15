import { Router } from "express"
import { authRequired } from "../middleware/authMiddleware.js"
<<<<<<< HEAD
import {
  register,
  login,
  logout,
  me,
  requestPasswordReset,
  verifyPasswordResetToken,
  resetPassword
} from "../controllers/authController.js"
=======
import { register, login, logout, me } from "../controllers/authController.js"
>>>>>>> d3fda18727ce8b2d98d799fc65d84bbb28bad97f

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.get("/me", authRequired, me)
<<<<<<< HEAD
router.post("/forgot-password", requestPasswordReset)
router.get("/reset-password/verify", verifyPasswordResetToken)
router.post("/reset-password", resetPassword)
=======
>>>>>>> d3fda18727ce8b2d98d799fc65d84bbb28bad97f

export default router
