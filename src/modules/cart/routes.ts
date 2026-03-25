import { Router } from "express";
import * as cartController from "./controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.get("/", authenticate, cartController.getCart);
router.post("/sync", authenticate, cartController.syncCart);
router.delete("/clear", authenticate, cartController.clearCart);

export default router;
