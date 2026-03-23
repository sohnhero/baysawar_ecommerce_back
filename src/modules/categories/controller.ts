import { Request, Response } from "express";
import { db } from "../../lib/db";
import { categories, products } from "../../db/schema";
import { eq, sql } from "drizzle-orm";

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const result = await db.query.categories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.order)],
      with: {
        products: {
          limit: 6
        },
      }
    });

    const categoryWithCounts = result.map(cat => ({
      ...cat,
      productCount: cat.products?.length || 0
    }));

    res.status(200).json(categoryWithCounts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCategoryStats = async (req: Request, res: Response) => {
  try {
    const allCategories = await db.query.categories.findMany({
      with: {
        products: true,
      }
    });

    const totalCategories = allCategories.length;
    const totalProducts = allCategories.reduce((sum, cat) => sum + (cat.products?.length || 0), 0);
    
    // Find most popular category
    let topCategory = { name: "N/A", count: 0 };
    allCategories.forEach(cat => {
      const count = cat.products?.length || 0;
      if (count > topCategory.count) {
        topCategory = { name: cat.name, count };
      }
    });

    res.status(200).json({
      totalCategories,
      totalProducts,
      topCategory
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const result = await db.insert(categories).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const result = await db.update(categories)
      .set(req.body)
      .where(eq(categories.id, req.params.id as string))
      .returning();
    res.status(200).json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await db.delete(categories).where(eq(categories.id, req.params.id as string));
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
