import { Router } from "express"
import { authRequired } from "../middleware/authMiddleware.js"
import { createOrUpdateRating, getRatings, updateOwnRating, deleteOwnRating } from "../controllers/ratingController.js"

const router = Router()

router.post("/", authRequired, createOrUpdateRating)
router.get("/", getRatings)
router.put("/sajat/:id", authRequired, updateOwnRating)
router.delete("/sajat/:id", authRequired, deleteOwnRating)

export default router
