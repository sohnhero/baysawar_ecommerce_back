import { Router } from "express";
import * as orderController from "./controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { orderSchema } from "../../lib/validation";

const router = Router();

router.post("/", authenticate, validate(orderSchema), orderController.createOrder);
router.get("/my", authenticate, orderController.getMyOrders);
router.get("/admin", authenticate, authorize(["admin"]), orderController.getAllOrders);
router.patch("/admin/:id", authenticate, authorize(["admin"]), orderController.updateOrderStatus);
router.get("/seller", authenticate, authorize(["vendeur"]), orderController.getSellerOrders);
router.patch("/seller/:id", authenticate, authorize(["vendeur"]), orderController.updateSellerOrderStatus);
router.patch("/my/:id/cancel", authenticate, orderController.cancelOrder);

export default router;
