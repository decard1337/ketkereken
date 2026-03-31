import { Router } from "express"
import { authRequired } from "../middleware/authMiddleware.js"
import {
  toggleFollow,
  getFollowStatus,
  getFollowers,
  getFollowing
} from "../controllers/followController.js"

const router = Router()

router.post("/toggle", authRequired, toggleFollow)
router.get("/status/:username", authRequired, getFollowStatus)
router.get("/followers/:username", getFollowers)
router.get("/following/:username", getFollowing)

export default router