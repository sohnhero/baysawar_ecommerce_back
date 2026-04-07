import { Request, Response } from "express";
import * as productService from "./service";
import * as artisanService from "../artisans/service";

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts(req.query);
    res.status(200).json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(404).json({ error: "Product not found (Invalid ID format)" });
    }
    const product = await productService.getProductById(id);
    res.status(200).json(product);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const products = await productService.getProductsByCategory(categoryId as string);
    res.status(200).json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
export const createProduct = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    // If it's a seller, auto-assign artisanId
    if (user.role === 'vendeur') {
      const artisan = await artisanService.getArtisanByUserId(user.id);
      if (artisan) {
        req.body.artisanId = artisan.id;
      }
    }
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSellerProducts = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const artisan = await artisanService.getArtisanByUserId(user.id);
    if (!artisan) {
       return res.status(404).json({ error: "Profil vendeur non trouvé" });
    }
    const products = await productService.getProductsByArtisanId(artisan.id);
    res.status(200).json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const user = (req as any).user;
    if (user.role === 'vendeur') {
      const product = await productService.getProductById(id);
      const artisan = await artisanService.getArtisanByUserId(user.id);
      if (!artisan || product.artisanId !== artisan.id) {
        return res.status(403).json({ error: "Vous n'êtes pas autorisé à modifier ce produit" });
      }
    }

    const product = await productService.updateProduct(id, req.body);
    res.status(200).json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const user = (req as any).user;
    if (user.role === 'vendeur') {
      const product = await productService.getProductById(id);
      const artisan = await artisanService.getArtisanByUserId(user.id);
      if (!artisan || product.artisanId !== artisan.id) {
        return res.status(403).json({ error: "Vous n'êtes pas autorisé à supprimer ce produit" });
      }
    }

    await productService.deleteProduct(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductHighlights = async (req: Request, res: Response) => {
  try {
    const highlights = await productService.getProductHighlights();
    res.json(highlights);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
