import { eq, and, sql, avg, count } from "drizzle-orm";
import { db } from "../../lib/db";
import { reviews, products } from "../../db/schema";

export const getProductReviews = async (productId: string) => {
  return await db.query.reviews.findMany({
    where: eq(reviews.productId, productId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
};

export const createReview = async (data: {
  productId: string;
  userId: string;
  rating: number;
  comment: string;
}) => {
  return await db.transaction(async (tx) => {
    // 1. Check if user already reviewed this product
    const existing = await tx.query.reviews.findFirst({
      where: and(eq(reviews.productId, data.productId), eq(reviews.userId, data.userId)),
    });

    let newReview;
    if (existing) {
      // Update existing review
      newReview = await tx
        .update(reviews)
        .set({
          rating: data.rating,
          comment: data.comment,
        })
        .where(eq(reviews.id, existing.id))
        .returning();
    } else {
      // Insert new review
      newReview = await tx.insert(reviews).values(data).returning();
    }

    // 2. Fetch all reviews for this product to recalculate
    const stats = await tx
      .select({
        avgRating: avg(reviews.rating),
        totalCount: count(reviews.id),
      })
      .from(reviews)
      .where(eq(reviews.productId, data.productId));

    const avgRating = stats[0].avgRating ? parseFloat(stats[0].avgRating.toString()) : data.rating;
    const totalCount = stats[0].totalCount ? parseInt(stats[0].totalCount.toString()) : 1;

    // 3. Update the product
    await tx
      .update(products)
      .set({
        rating: avgRating.toFixed(2),
        reviewCount: totalCount,
      })
      .where(eq(products.id, data.productId));

    return newReview;
  });
};

export const deleteReview = async (id: string, userId: string) => {
  return await db.transaction(async (tx) => {
    // 1. Get review to know which product it belongs to
    const review = await tx.query.reviews.findFirst({
      where: and(eq(reviews.id, id), eq(reviews.userId, userId)),
    });

    if (!review) throw new Error("Review not found or unauthorized");

    const productId = review.productId;

    // 2. Delete the review
    await tx.delete(reviews).where(eq(reviews.id, id));

    // 3. Recalculate stats
    const stats = await tx
      .select({
        avgRating: avg(reviews.rating),
        totalCount: count(reviews.id),
      })
      .from(reviews)
      .where(eq(reviews.productId, productId));

    const avgRating = stats[0].avgRating ? parseFloat(stats[0].avgRating.toString()) : 0;
    const totalCount = stats[0].totalCount ? parseInt(stats[0].totalCount.toString()) : 0;

    // 4. Update the product
    await tx
      .update(products)
      .set({
        rating: avgRating.toFixed(2),
        reviewCount: totalCount,
      })
      .where(eq(products.id, productId));

    return { id };
  });
};
