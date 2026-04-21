import { Router } from "express";
import * as adminController from "./controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.use(authenticate);
router.use(authorize(["admin"]));

router.get("/stats", adminController.getStats);
router.get("/vendor-stats", adminController.getVendorStats);
router.get("/vendor-payouts", adminController.getVendorPayouts);
router.post("/vendor-payouts", adminController.createVendorPayout);

export default router;
