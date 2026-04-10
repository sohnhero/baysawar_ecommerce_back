import { Request, Response } from "express";
import { db } from "../../lib/db";
import { orders, orderItems, products } from "../../db/schema";
import { eq, sql } from "drizzle-orm";
import { getTransaction } from "./service";
import crypto from "crypto";

// Maps Bictorys transaction status to our internal paymentStatus
const mapPaymentStatus = (bictorysStatus: string): string => {
  switch (bictorysStatus?.toUpperCase()) {
    case "SUCCESS":
    case "SUCCESSFUL":
    case "COMPLETED":
      return "paid";
    case "FAILED":
    case "CANCELLED":
    case "CANCELED":
      return "failed";
    default:
      return "pending";
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    // Validate webhook signature if secret is configured
    const webhookSecret = process.env.BICTORYS_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers["x-bictorys-signature"] as string;
      if (!signature) {
        return res.status(401).json({ error: "Missing webhook signature" });
      }
      const expectedSig = crypto
        .createHmac("sha256", webhookSecret)
        .update(JSON.stringify(req.body))
        .digest("hex");
      if (signature !== expectedSig) {
        return res.status(401).json({ error: "Invalid webhook signature" });
      }
    }

    const event = req.body;
    const merchantReference: string = event?.merchantReference || event?.data?.merchantReference;
    const transactionId: string = event?.id || event?.data?.id;
    const status: string = event?.status || event?.data?.status;

    if (!merchantReference) {
      return res.status(400).json({ error: "Missing merchantReference in webhook payload" });
    }

    const paymentStatus = mapPaymentStatus(status);

    await db.update(orders)
      .set({
        paymentStatus,
        paymentTransactionId: transactionId || null,
        ...(paymentStatus === "paid" ? { status: "confirmed" } : {}),
        ...(paymentStatus === "failed" ? { status: "cancelled" } : {}),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(orders.id, merchantReference));

    // Restaurer le stock si paiement échoué ou annulé
    if (paymentStatus === "failed") {
      const items = await db.query.orderItems.findMany({
        where: eq(orderItems.orderId, merchantReference),
      });
      for (const item of items) {
        await db.update(products)
          .set({ stock: sql`${products.stock} + ${item.quantity}` })
          .where(eq(products.id, item.productId));
      }
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Allows frontend to verify a payment status manually (e.g. on success redirect)
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId as string;
    const userId = (req as any).user.id;

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order || order.userId !== userId) {
      return res.status(404).json({ error: "Order not found" });
    }

    // If we have a Bictorys transaction ID, refresh status from their API
    if (order.paymentTransactionId) {
      try {
        const transaction = await getTransaction(order.paymentTransactionId);
        const freshStatus = mapPaymentStatus(transaction.status);
        if (freshStatus !== order.paymentStatus) {
          await db.update(orders)
            .set({
              paymentStatus: freshStatus,
              ...(freshStatus === "paid" ? { status: "confirmed" } : {}),
              updatedAt: new Date().toISOString(),
            })
            .where(eq(orders.id, orderId));
          order.paymentStatus = freshStatus;
        }
      } catch (e) {
        console.error("Failed to refresh payment status from Bictorys:", e);
      }
    }

    res.json({ orderId, paymentStatus: order.paymentStatus, orderStatus: order.status });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
