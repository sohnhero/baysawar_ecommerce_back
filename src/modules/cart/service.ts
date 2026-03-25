import { eq, and, not, inArray } from "drizzle-orm";
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
    // 1. Delete all current items for this cart to ensure absolute consistency
    await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    // 2. Insert the current items from the frontend
    if (items.length > 0) {
      // Perform sequential inserts within transaction or use bulk insert if supported
      for (const item of items) {
        await tx.insert(cartItems).values({
          cartId: cart.id,
          productId: item.productId,
          quantity: item.quantity,
        });
      }
    }

    // 3. Return the fresh state
    return await tx.query.cartItems.findMany({
      where: eq(cartItems.cartId, cart.id),
      with: {
        product: true,
      },
    });
  });
};
