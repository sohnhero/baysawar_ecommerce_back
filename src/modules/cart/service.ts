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
    // 1. Delete items that are NO LONGER in the request items
    const productIds = items.map(i => i.productId);
    if (productIds.length > 0) {
      await tx.delete(cartItems)
        .where(
          and(
            eq(cartItems.cartId, cart.id),
            not(inArray(cartItems.productId, productIds))
          )
        );
    } else {
      // If items array is empty, it means we WANT to clear the cart in a SYNC context.
      // Wait! If it's a "merge" on login, we send an empty list?
      // No, onLogin fetches the server cart first and merges. So it will send the full merged list.
      // So if items is empty, we should delete EVERYTHING for this cart.
      await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    }

    // 2. Update/Insert the remaining items
    for (const item of items) {
      const existing = await tx.query.cartItems.findFirst({
        where: and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, item.productId)
        ),
      });

      if (existing) {
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

    return await tx.query.cartItems.findMany({
      where: eq(cartItems.cartId, cart.id),
      with: {
        product: true,
      },
    });
  });
};
