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

  // 1. Deduplicate items to prevent unique constraint violations
  const mergedItemsMap = new Map<string, number>();
  for (const item of items) {
    const current = mergedItemsMap.get(item.productId) || 0;
    mergedItemsMap.set(item.productId, current + item.quantity);
  }

  const uniqueItems = Array.from(mergedItemsMap.entries()).map(([productId, quantity]) => ({
    cartId: cart.id,
    productId,
    quantity,
  }));

  // 2. Use a transaction to ensure atomicity
  return await db.transaction(async (tx) => {
    // a. Delete all current items for this cart
    await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    // b. Insert the unique items from the frontend in a single bulk operation
    if (uniqueItems.length > 0) {
      await tx.insert(cartItems).values(uniqueItems);
    }

    // c. Return the fresh state
    return await tx.query.cartItems.findMany({
      where: eq(cartItems.cartId, cart.id),
      with: {
        product: true,
      },
    });
  });
};
