import { Router } from "express";
import * as wishlistController from "./controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", wishlistController.getWishlist);
router.post("/", wishlistController.addWish);
router.delete("/:productId", wishlistController.removeWish);

export default router;
