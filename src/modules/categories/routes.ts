import { Router } from "express";
import * as categoryController from "./controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.get("/", categoryController.getAllCategories);
router.get("/stats", authenticate, authorize(['admin']), categoryController.getCategoryStats);
router.post("/", authenticate, authorize(['admin']), categoryController.createCategory);
router.put("/:id", authenticate, authorize(['admin']), categoryController.updateCategory);
router.delete("/:id", authenticate, authorize(['admin']), categoryController.deleteCategory);

export default router;
