import { Router } from "express";
import * as authController from "./controller";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { registerSchema, loginSchema } from "../../lib/validation";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authenticate, authController.getMe);

export default router;
