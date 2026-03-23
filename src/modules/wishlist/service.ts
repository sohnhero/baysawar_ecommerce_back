import { eq, and } from "drizzle-orm";
import { db } from "../../lib/db";
import { wishlist } from "../../db/schema";

export const getUserWishlist = async (userId: string) => {
  return await db.query.wishlist.findMany({
    where: eq(wishlist.userId, userId),
    with: {
      product: true,
    },
  });
};

export const addToWishlist = async (userId: string, productId: string) => {
  return await db.insert(wishlist).values({ userId, productId }).onConflictDoNothing().returning();
};

export const removeFromWishlist = async (userId: string, productId: string) => {
  return await db.delete(wishlist).where(
    and(eq(wishlist.userId, userId), eq(wishlist.productId, productId))
  );
};
