import { Request, Response, NextFunction } from "express";
import * as cartService from "./service";

export const getCart = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const cartItems = await cartService.getCart(userId);
    res.json(cartItems);
  } catch (error) {
    next(error);
  }
};

export const syncCart = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid items format" });
    }

    const updatedCart = await cartService.syncCart(userId, items);
    res.json(updatedCart);
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    // For now, clearCart could be implemented in service, but let's do it here or simply sync with an empty array.
    const updatedCart = await cartService.syncCart(userId, []);
    res.json(updatedCart);
  } catch (error) {
    next(error);
  }
};
