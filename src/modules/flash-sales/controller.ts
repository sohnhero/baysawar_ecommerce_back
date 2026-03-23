import { Request, Response } from "express";
import * as flashSaleService from "./service";

export const getActiveSales = async (req: Request, res: Response) => {
  try {
    const result = await flashSaleService.getActiveCampaign();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllSales = async (req: Request, res: Response) => {
  try {
    const result = await flashSaleService.getAllCampaigns();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createSale = async (req: Request, res: Response) => {
  try {
    const { items, ...campaignData } = req.body;
    const result = await flashSaleService.createCampaign(campaignData, items);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSale = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await flashSaleService.deleteCampaign(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSale = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { items, ...campaignData } = req.body;
    const result = await flashSaleService.updateCampaign(id, campaignData, items);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
