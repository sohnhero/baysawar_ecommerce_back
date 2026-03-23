import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    price: z.coerce.number().positive(),
  })),
  shippingAddress: z.string().min(5),
  phone: z.string().min(8),
  totalAmount: z.coerce.number().positive(),
  paymentMethod: z.string().optional(),
});
