import { Router } from "express";
import * as userController from "./controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.get("/", authenticate, authorize(["admin"]), userController.getAllUsers);
router.get("/stats", authenticate, authorize(["admin"]), userController.getUserStats);
router.put("/:id/role", authenticate, authorize(["admin"]), userController.updateUserRole);
router.delete("/:id", authenticate, authorize(["admin"]), userController.deleteUser);

// Profile routes
router.put("/profile", authenticate, userController.updateProfile);

export default router;
