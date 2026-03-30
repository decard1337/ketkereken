import { Router } from "express"
import { adminRequired } from "../middleware/authMiddleware.js"
import { upload } from "../config/upload.js"
import {
  getPendingApprovals,
  approvePending,
  rejectPending,
  adminList,
  adminCreate,
  adminUpdate,
  adminResetPassword,
  adminUploadProfileImage,
  adminDelete
} from "../controllers/adminController.js"

const router = Router()

router.get("/jovahagyando", adminRequired, getPendingApprovals)
router.post("/elfogad", adminRequired, approvePending)
router.post("/elutasit", adminRequired, rejectPending)
router.get("/:tabla", adminRequired, adminList)
router.post("/:tabla", adminRequired, adminCreate)
router.put("/:tabla/:id", adminRequired, adminUpdate)
router.put("/felhasznalok/:id/jelszo", adminRequired, adminResetPassword)
router.post("/felhasznalok/:id/profilkep", adminRequired, upload.single("file"), adminUploadProfileImage)
router.delete("/:tabla/:id", adminRequired, adminDelete)

export default router
