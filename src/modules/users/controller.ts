import { Request, Response } from "express";
import * as userService from "./service";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const role = req.body.role as string;
    if (!['admin', 'customer'].includes(role)) {
       return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await userService.updateUserRole(id, role);
    if (!user) {
       return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await userService.deleteUser(id);
    if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const updatedUser = await userService.updateProfile(user.id, req.body);
    res.status(200).json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const stats = await userService.getUserStats();
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
