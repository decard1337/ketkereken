import { Router } from "express"
import { authRequired, authOptional } from "../middleware/authMiddleware.js"
import { upload } from "../config/upload.js"
import { getPublicProfile, updateMyProfile, uploadMyProfileImage } from "../controllers/profileController.js"
import { getOwnRatings } from "../controllers/ratingController.js"
import { getOwnImages } from "../controllers/imageController.js"

const router = Router()

router.get("/u/:username", authOptional, getPublicProfile)
router.put("/profilom", authRequired, updateMyProfile)
router.post("/profilom/profilkep", authRequired, upload.single("file"), uploadMyProfileImage)
router.get("/sajat/ertekelesek", authRequired, getOwnRatings)
router.get("/sajat/kepek", authRequired, getOwnImages)

export default router