import { Router } from "express";
import * as productController from "./controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.get("/", productController.getAllProducts);
router.get("/highlights", productController.getProductHighlights);
router.get("/seller", authenticate, authorize(["vendeur", "admin"]), productController.getSellerProducts);
router.get("/:id", productController.getProductById);
router.get("/category/:categoryId", productController.getProductsByCategory);

// Admin & Seller routes
router.post("/", authenticate, authorize(["admin", "vendeur"]), productController.createProduct);
router.put("/:id", authenticate, authorize(["admin", "vendeur"]), productController.updateProduct);
router.delete("/:id", authenticate, authorize(["admin", "vendeur"]), productController.deleteProduct);

export default router;
