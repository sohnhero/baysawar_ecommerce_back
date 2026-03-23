import { Router } from "express";
import * as productController from "./controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.get("/category/:categoryId", productController.getProductsByCategory);

// Admin routes
router.post("/", authenticate, authorize(["admin"]), productController.createProduct);
router.put("/:id", authenticate, authorize(["admin"]), productController.updateProduct);
router.delete("/:id", authenticate, authorize(["admin"]), productController.deleteProduct);

export default router;
