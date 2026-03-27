import { Router } from "express";
import { subscribe } from "./controller";

const router = Router();

router.post("/subscribe", subscribe);

export default router;
