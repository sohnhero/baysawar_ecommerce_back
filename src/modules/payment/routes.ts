import { Router } from "express";
import { handleWebhook, verifyPayment } from "./controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

// Public webhook endpoint — called by Bictorys after payment
router.post("/webhook", handleWebhook);

// Authenticated endpoint — frontend calls this on the success/error redirect page
router.get("/verify/:orderId", authenticate, verifyPayment);

export default router;
