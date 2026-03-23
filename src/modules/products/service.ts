import { eq, and, ilike, sql } from "drizzle-orm";
import { db } from "../../lib/db";
import { products, categories } from "../../db/schema";

export const getAllProducts = async (filters: any) => {
  const { category, search, minPrice, maxPrice } = filters;

  const whereConditions = [];

  if (category) {
    whereConditions.push(eq(products.categoryId, category));
  }

  if (search) {
    whereConditions.push(ilike(products.name, `%${search}%`));
  }

  if (minPrice) {
    whereConditions.push(sql`${products.price} >= ${minPrice}`);
  }

  if (maxPrice) {
    whereConditions.push(sql`${products.price} <= ${maxPrice}`);
  }

  const result = await db.query.products.findMany({
    where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
    with: {
      category: true,
      artisan: true,
    },
  });

  return result;
};

export const getProductById = async (id: string) => {
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      category: true,
      artisan: true,
      reviews: {
        with: {
          user: true,
        }
      }
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

export const getProductsByCategory = async (categoryId: string) => {
  return await db.query.products.findMany({
    where: eq(products.categoryId, categoryId),
    with: {
      category: true,
      artisan: true,
    },
  });
};

export const createProduct = async (data: any) => {
  const slug = data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  
  // If category is a slug, find the ID
  if (data.category && typeof data.category === 'string' && data.category.length > 20 === false) {
     const cat = await db.query.categories.findFirst({
         where: eq(categories.slug, data.category)
     });
     if (cat) {
         data.categoryId = cat.id;
     }
  }

  const { category, ...productData } = data;

  const result = await db.insert(products).values({
    ...productData,
    slug,
    updatedAt: new Date().toISOString(),
  }).returning();
  
  return result[0];
};

export const updateProduct = async (id: string, data: any) => {
  let slug;
  if (data.name) {
    slug = data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  }

  // If category is a string mapped to ID or slug
  if (data.category && typeof data.category === 'string' && data.category.length > 20 === false) {
     const cat = await db.query.categories.findFirst({
         where: eq(categories.slug, data.category)
     });
     if (cat) {
         data.categoryId = cat.id;
     }
  }

  const { category, id: _, createdAt, ...updateData } = data;

  const result = await db.update(products).set({
    ...updateData,
    ...(slug ? { slug } : {}),
    updatedAt: new Date().toISOString(),
  }).where(eq(products.id, id)).returning();
  
  return result[0];
};

export const deleteProduct = async (id: string) => {
  return await db.delete(products).where(eq(products.id, id)).returning();
};
