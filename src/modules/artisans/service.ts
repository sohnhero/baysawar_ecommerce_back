import { eq } from "drizzle-orm";
import { db } from "../../lib/db";
import { artisans } from "../../db/schema";

export const getAllArtisans = async () => {
  return await db.query.artisans.findMany({
    with: {
      products: true,
    },
  });
};

export const getArtisanBySlug = async (slug: string) => {
  const artisan = await db.query.artisans.findFirst({
    where: eq(artisans.slug, slug),
    with: {
      products: true,
    },
  });

  if (!artisan) {
    throw new Error("Artisan not found");
  }

  return artisan;
};

export const getArtisanById = async (id: string) => {
    const artisan = await db.query.artisans.findFirst({
      where: eq(artisans.id, id),
      with: {
        products: true,
      },
    });
  
    if (!artisan) {
      throw new Error("Artisan not found");
    }
  
    return artisan;
  };
