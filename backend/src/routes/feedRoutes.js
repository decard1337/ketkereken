import { Router } from "express"
import { authOptional, authRequired } from "../middleware/authMiddleware.js"
import {
  getMyFeed,
  getUserFeed,
  createStatusPost,
  reactToActivity,
  createComment,
  deleteComment
} from "../controllers/feedController.js"

const router = Router()

router.get("/", authRequired, getMyFeed)
router.get("/:username", authOptional, getUserFeed)

router.post("/statusz", authRequired, createStatusPost)
router.post("/react", authRequired, reactToActivity)

router.post("/comment", authRequired, createComment)
router.delete("/comment/:commentId", authRequired, deleteComment)

export default router