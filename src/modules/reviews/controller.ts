import { Request, Response } from "express";
import * as reviewService from "./service";

export const getReviews = async (req: Request, res: Response) => {
  try {
    const result = await reviewService.getProductReviews(req.params.productId as string);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await reviewService.createReview({
      ...req.body,
      userId,
    });
    res.status(200).json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const id = req.params.id as string;
    await reviewService.deleteReview(id, userId);
    res.status(200).json({ message: "Review deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
