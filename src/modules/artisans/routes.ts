import { Router } from "express";
import * as artisanController from "./controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.get("/", artisanController.getArtisans);
router.get("/me", authenticate, artisanController.getMyArtisanProfile);
router.get("/slug/:slug", artisanController.getArtisanBySlug);
router.get("/:id", artisanController.getArtisanById);

router.post("/apply", authenticate, artisanController.applyToBeSeller);
router.patch("/:id/status", authenticate, authorize(['admin']), artisanController.updateArtisanStatus);

export default router;
