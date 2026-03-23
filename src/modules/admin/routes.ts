import { Router } from "express";
import * as adminController from "./controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.use(authenticate);
router.use(authorize(["admin"]));

router.get("/stats", adminController.getStats);

export default router;
