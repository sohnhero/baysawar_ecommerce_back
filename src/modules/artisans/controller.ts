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
