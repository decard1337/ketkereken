import { Router } from "express"
import { getPublicTable } from "../controllers/publicController.js"

const router = Router()

router.get("/:tabla", getPublicTable)

export default router
