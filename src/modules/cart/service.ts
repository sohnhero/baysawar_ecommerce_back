import { eq, and } from "drizzle-orm";
import { db } from "../../lib/db";
import { carts, cartItems } from "../../db/schema";

export const getOrCreateCart = async (userId: string) => {
  let cart = await db.query.carts.findFirst({
    where: eq(carts.userId, userId),
  });

  if (!cart) {
    const [newCart] = await db.insert(carts).values({ userId }).returning();
    cart = newCart;
  }

  return cart;
};

export const getCart = async (userId: string) => {
  const cart = await getOrCreateCart(userId);
  return await db.query.cartItems.findMany({
    where: eq(cartItems.cartId, cart.id),
    with: {
      product: true,
    },
  });
};

export const syncCart = async (userId: string, items: { productId: string; quantity: number }[]) => {
  const cart = await getOrCreateCart(userId);

  // Use a transaction to ensure atomicity
  return await db.transaction(async (tx) => {
    // 1. Delete existing items (we'll replace them or we could merge, 
    // but the frontend sync usually sends the "truth" state)
    // Actually, merging is safer if the user has multiple devices.
    // For now, let's implement a merge logic.
    
    for (const item of items) {
      const existing = await tx.query.cartItems.findFirst({
        where: and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, item.productId)
        ),
      });

      if (existing) {
        await tx.update(cartItems)
          .set({ quantity: item.quantity, updatedAt: new Date().toISOString() })
          .where(eq(cartItems.id, existing.id));
      } else {
        await tx.insert(cartItems).values({
          cartId: cart.id,
          productId: item.productId,
          quantity: item.quantity,
        });
      }
    }

    // Return the updated cart
    return await tx.query.cartItems.findMany({
      where: eq(cartItems.cartId, cart.id),
      with: {
        product: true,
      },
    });
  });
};
