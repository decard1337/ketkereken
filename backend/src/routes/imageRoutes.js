import { Router } from "express"
import { authRequired } from "../middleware/authMiddleware.js"
import { upload } from "../config/upload.js"
import { uploadImage, getImages } from "../controllers/imageController.js"

const router = Router()

router.post("/", authRequired, upload.single("file"), uploadImage)
router.get("/", getImages)

export default router
