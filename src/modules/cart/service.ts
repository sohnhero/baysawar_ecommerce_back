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
  console.log(`[CartService] Syncing cart for user ${userId}, items in request: ${items.length}`);

  // Use a transaction to ensure atomicity
  return await db.transaction(async (tx) => {
    // Merging logic: 
    // For each item in the request, we additive-merge with what's in the DB
    // unless the quantities are specific (we'll just use the request quality as the "latest")
    
    for (const item of items) {
      const existing = await tx.query.cartItems.findFirst({
        where: and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, item.productId)
        ),
      });

      if (existing) {
        // If it exists, we take the MAX of the quantities, or just the incoming one?
        // Usually, if syncing from guest to user, we might want to Add them.
        // But if syncing a refresh, we want the incoming.
        // Let's go with incoming for simplicity, it matches "sync" behavior.
        await tx.update(cartItems)
          .set({ 
            quantity: item.quantity, 
            updatedAt: new Date().toISOString() 
          })
          .where(eq(cartItems.id, existing.id));
      } else {
        await tx.insert(cartItems).values({
          cartId: cart.id,
          productId: item.productId,
          quantity: item.quantity,
        });
      }
    }

    const allItems = await tx.query.cartItems.findMany({
      where: eq(cartItems.cartId, cart.id),
      with: {
        product: true,
      },
    });
    
    console.log(`[CartService] Sync complete. Total items in DB for user ${userId}: ${allItems.length}`);
    return allItems;
  });
};
