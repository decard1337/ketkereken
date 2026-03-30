import { Router } from "express"
import { authRequired } from "../middleware/authMiddleware.js"
import { toggleFavorite, getMyFavorites, getFavoriteStatus } from "../controllers/favoriteController.js"

const router = Router()

router.post("/toggle", authRequired, toggleFavorite)
router.get("/", authRequired, getMyFavorites)
router.get("/status", authRequired, getFavoriteStatus)

export default router
