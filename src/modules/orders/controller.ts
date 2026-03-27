import { Request, Response } from "express";
import { db } from "../../lib/db";
import { orders, orderItems, products } from "../../db/schema";
import { eq, sql, and } from "drizzle-orm";
import { EmailService } from "../../lib/email";


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

    // Send order confirmation email
    try {
      const orderWithUser = await db.query.orders.findFirst({
        where: eq(orders.id, result.id),
        with: { user: true, items: { with: { product: true } } }
      });
      if (orderWithUser && orderWithUser.user) {
        await EmailService.sendOrderConfirmation(orderWithUser.user.email, orderWithUser, orderWithUser.items);
      }
    } catch (e) {
      console.error("Failed to send order confirmation email:", e);
    }

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

    // Send status update email
    try {
      const orderWithUser = await db.query.orders.findFirst({
        where: eq(orders.id, id),
        with: { user: true }
      });
      if (orderWithUser && orderWithUser.user) {
        await EmailService.sendOrderStatusUpdate(orderWithUser.user.email, orderWithUser);
      }
    } catch (e) {
      console.error("Failed to send status update email:", e);
    }

    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    if (typeof id !== 'string') {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const result = await db.transaction(async (tx) => {
      // 1. Fetch the order to verify ownership and status
      const order = await tx.query.orders.findFirst({
        where: and(eq(orders.id, id), eq(orders.userId, userId)),
        with: { items: true }
      });

      if (!order) {
        throw new Error("Order not found or unauthorized");
      }

      if (order.status !== "pending") {
        throw new Error("Only pending orders can be cancelled");
      }

      // 2. Update status to cancelled
      const [updatedOrder] = await tx.update(orders)
        .set({ status: "cancelled", updatedAt: new Date().toISOString() })
        .where(eq(orders.id, id))
        .returning();

      // 3. Restore stock
      for (const item of order.items) {
        await tx.update(products)
          .set({ stock: sql`${products.stock} + ${item.quantity}` })
          .where(eq(products.id, item.productId));
      }

      return updatedOrder;
    });

    // Send cancellation email to admin
    try {
      const orderWithUser = await db.query.orders.findFirst({
        where: eq(orders.id, result.id),
        with: { user: true }
      });
      if (orderWithUser) {
        await EmailService.sendOrderCancelledAdmin(orderWithUser);
      }
    } catch (e) {
      console.error("Failed to send cancellation email to admin:", e);
    }

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
