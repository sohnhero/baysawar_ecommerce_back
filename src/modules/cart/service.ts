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

const getActiveFlashPriceMap = async (): Promise<Map<string, string>> => {
  const now = new Date().toISOString();
  const activeCampaign = await db.query.flashSaleCampaigns.findFirst({
    where: (c, { and, eq, lt, gt }) =>
      and(eq(c.active, true), lt(c.startTime, now), gt(c.endTime, now)),
    with: { items: true },
  });

  const map = new Map<string, string>();
  if (activeCampaign) {
    for (const item of (activeCampaign as any).items) {
      map.set(item.productId, item.flashPrice);
    }
  }
  return map;
};

export const getCart = async (userId: string) => {
  const cart = await getOrCreateCart(userId);
  const items = await db.query.cartItems.findMany({
    where: eq(cartItems.cartId, cart.id),
    with: { product: true },
  });

  const flashPriceMap = await getActiveFlashPriceMap();

  return items.map((item) => ({
    ...item,
    product: {
      ...item.product,
      effectivePrice: flashPriceMap.get(item.productId) ?? item.product?.price,
      flashPrice: flashPriceMap.get(item.productId) ?? null,
    },
  }));
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

  const productIds = uniqueItems.map(i => i.productId);

  // 2. Use a transaction to ensure atomicity
  return await db.transaction(async (tx) => {
    // a. Update or Insert (Upsert) every item in the payload
    if (uniqueItems.length > 0) {
      for (const item of uniqueItems) {
        await tx.insert(cartItems)
          .values(item)
          .onConflictDoUpdate({
            target: [cartItems.cartId, cartItems.productId],
            set: { quantity: item.quantity, updatedAt: new Date().toISOString() }
          });
      }
    }

    // b. Delete any items that are NOT in the current frontend payload
    if (productIds.length > 0) {
      await tx.delete(cartItems).where(
        and(
          eq(cartItems.cartId, cart.id),
          not(inArray(cartItems.productId, productIds))
        )
      );
    } else {
      // If empty payload, clear entire cart
      await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    }

    // c. Return the fresh state with flash prices
    const freshItems = await tx.query.cartItems.findMany({
      where: eq(cartItems.cartId, cart.id),
      with: { product: true },
    });

    const flashPriceMap = await getActiveFlashPriceMap();
    return freshItems.map((item) => ({
      ...item,
      product: {
        ...item.product,
        effectivePrice: flashPriceMap.get(item.productId) ?? item.product?.price,
        flashPrice: flashPriceMap.get(item.productId) ?? null,
      },
    }));
  });
};
