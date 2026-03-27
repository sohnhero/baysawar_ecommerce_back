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
export const createArtisan = async (data: any) => {
  const { userId, name, specialty, location, bio, image } = data;
  const slug = name.toLowerCase().split(' ').join('-').replace(/[^\w-]/g, '');
  
  const [newArtisan] = await db.insert(artisans).values({
    userId,
    name,
    slug,
    specialty,
    location,
    bio,
    image,
    since: new Date().getFullYear(),
    status: "pending",
  }).returning();

  return newArtisan;
};

export const updateArtisan = async (id: string, data: any) => {
  const { name, specialty, bio } = data;
  const slug = name ? name.toLowerCase().split(' ').join('-').replace(/[^\w-]/g, '') : undefined;
  
  const [updated] = await db.update(artisans)
    .set({
      ...(name && { name }),
      ...(slug && { slug }),
      ...(specialty && { specialty }),
      ...(bio && { bio }),
      updatedAt: new Date().toISOString()
    })
    .where(eq(artisans.id, id))
    .returning();
    
  return updated;
};

export const getArtisanByUserId = async (userId: string) => {
  return await db.query.artisans.findFirst({
    where: eq(artisans.userId, userId),
    with: {
      products: true,
    },
  });
};

export const updateArtisanStatus = async (id: string, status: string, adminNotes?: string) => {
  const [updated] = await db.update(artisans)
    .set({ status, adminNotes, updatedAt: new Date().toISOString() })
    .where(eq(artisans.id, id))
    .returning();
  
  if (!updated) throw new Error("Artisan not found");
  
  // If approved, update user role
  if (status === 'approved' && updated.userId) {
    await db.update(require("../../db/schema").users)
      .set({ role: 'vendeur' })
      .where(eq(require("../../db/schema").users.id, updated.userId));
  }
  
  return updated;
};
