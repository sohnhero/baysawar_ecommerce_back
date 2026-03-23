import { Request, Response } from "express";
import * as wishlistService from "./service";

export const getWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await wishlistService.getUserWishlist(userId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addWish = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { productId } = req.body;
    const result = await wishlistService.addToWishlist(userId, productId);
    res.status(201).json(result[0] || { message: "Already in wishlist" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const removeWish = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { productId } = req.params as { productId: string };
    await wishlistService.removeFromWishlist(userId, productId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
