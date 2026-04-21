import { Request, Response } from "express";
import * as adminService from "./service";

export const getStats = async (req: Request, res: Response) => {
  try {
    const { timeRange } = req.query;
    const stats = await adminService.getDashboardStats(timeRange as string);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getVendorStats = async (_req: Request, res: Response) => {
  try {
    const stats = await adminService.getVendorStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createVendorPayout = async (req: Request, res: Response) => {
  try {
    const { artisanId, amount, method, notes } = req.body;
    if (!artisanId || !amount || !method) {
      return res.status(400).json({ error: "artisanId, amount et method sont requis" });
    }
    const payout = await adminService.createVendorPayout({ artisanId, amount: Number(amount), method, notes });
    res.status(201).json(payout);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getVendorPayouts = async (req: Request, res: Response) => {
  try {
    const { artisanId } = req.query;
    const payouts = await adminService.getVendorPayouts(artisanId as string | undefined);
    res.json(payouts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
