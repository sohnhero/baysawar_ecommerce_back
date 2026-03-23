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
