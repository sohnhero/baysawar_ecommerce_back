import { Router } from "express";
import * as reviewController from "./controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.get("/product/:productId", reviewController.getReviews);
router.post("/", authenticate, reviewController.createReview);
router.get("/check-eligibility/:productId", authenticate, reviewController.checkEligibility);
router.delete("/:id", authenticate, reviewController.deleteReview);

export default router;
