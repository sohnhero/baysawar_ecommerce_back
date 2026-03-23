import { Router } from "express";
import * as flashSaleController from "./controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.get("/active", flashSaleController.getActiveSales);

// Admin routes
router.use(authenticate);
router.use(authorize(["admin"]));

router.get("/", flashSaleController.getAllSales);
router.post("/", flashSaleController.createSale);
router.put("/:id", flashSaleController.updateSale);
router.delete("/:id", flashSaleController.deleteSale);

export default router;
