import { Request, Response } from "express";
import { db } from "../../lib/db";
import { orders, orderItems, products } from "../../db/schema";
import { eq, sql } from "drizzle-orm";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { items, shippingAddress, phone, totalAmount, paymentMethod } = req.body;

    console.log("Creating order for user:", userId);
    console.log("Order Data:", JSON.stringify({ items, shippingAddress, phone, totalAmount, paymentMethod }, null, 2));

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must have items" });
    }

    const result = await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values({
        userId,
        totalAmount: totalAmount.toString(),
        shippingAddress,
        phone,
        paymentMethod,
        status: "pending",
        paymentStatus: "pending",
      }).returning();

      console.log("Inserted order header:", newOrder.id);

      for (const item of items) {
        if (!item.productId || !item.quantity || item.price === undefined) {
          throw new Error(`Invalid item: ${JSON.stringify(item)}`);
        }

        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price.toString(),
        });

        // Update stock
        await tx.update(products)
          .set({ stock: sql`${products.stock} - ${item.quantity}` })
          .where(eq(products.id, item.productId));
      }

      return newOrder;
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error("Order Creation Detailed Error:", error);
    const msg = error.message || "Unknown error during order creation";
    res.status(500).json({ 
      error: msg,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      with: {
        items: {
          with: {
            product: true
          }
        }
      },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const result = await db.query.orders.findMany({
      with: {
        items: {
          with: {
            product: true
          }
        },
        user: true,
      },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: "Invalid ID" });
    }
    const { status } = req.body;
    const result = await db.update(orders)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq(orders.id, id))
      .returning();
    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
