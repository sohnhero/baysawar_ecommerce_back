import { Request, Response } from "express";
import * as artisanService from "./service";

export const getArtisans = async (req: Request, res: Response) => {
  try {
    const result = await artisanService.getAllArtisans();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getArtisanBySlug = async (req: Request, res: Response) => {
  try {
    const result = await artisanService.getArtisanBySlug(req.params.slug as string);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getArtisanById = async (req: Request, res: Response) => {
    try {
      const result = await artisanService.getArtisanById(req.params.id as string);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };
export const applyToBeSeller = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { shopName, ...rest } = req.body;
    const data = { ...rest, name: shopName || req.body.name };

    const existing = await artisanService.getArtisanByUserId(userId);
    if (existing) {
      const result = await artisanService.updateArtisan(existing.id, data);
      return res.json(result);
    }

    const result = await artisanService.createArtisan({ ...data, userId });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateArtisanStatus = async (req: Request, res: Response) => {
  try {
    const { status, adminNotes } = req.body;
    const result = await artisanService.updateArtisanStatus(req.params.id as string, status, adminNotes);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyArtisanProfile = async (req: any, res: Response) => {
  try {
    const result = await artisanService.getArtisanByUserId(req.user.id);
    if (!result) return res.status(404).json({ error: "Profile not found" });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
