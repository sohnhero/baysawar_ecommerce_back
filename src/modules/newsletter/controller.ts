import { Request, Response } from "express";
import { db } from "../../lib/db";
import { newsletterSubscriptions } from "../../db/schema";
import { eq } from "drizzle-orm";
import { EmailService } from "../../lib/email";

export const subscribe = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const existing = await db.query.newsletterSubscriptions.findFirst({
      where: eq(newsletterSubscriptions.email, email),
    });

    if (existing) {
      if (existing.active) {
        return res.status(400).json({ error: "Email already subscribed" });
      } else {
        await db.update(newsletterSubscriptions)
          .set({ active: true })
          .where(eq(newsletterSubscriptions.email, email));
      }
    } else {
      await db.insert(newsletterSubscriptions).values({ email });
    }

    // Send welcome email
    try {
      await EmailService.sendNewsletterSubscription(email);
    } catch (e) {
      console.error("Failed to send newsletter email:", e);
    }

    res.status(201).json({ message: "Subscription successful" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
