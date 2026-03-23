import { Router } from "express";
import * as artisanController from "./controller";

const router = Router();

router.get("/", artisanController.getArtisans);
router.get("/slug/:slug", artisanController.getArtisanBySlug);
router.get("/:id", artisanController.getArtisanById);

export default router;
