import { Request, Response } from "express";
import * as authService from "./service";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ user });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);
    res.status(200).json({ user, token });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { user, token } = await authService.getUserWithToken(userId);
    res.status(200).json({ user, token });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};
