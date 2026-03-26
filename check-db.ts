import { db } from "./src/lib/db";
import { products, carts } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function checkIds() {
  const productId = "44444444-4444-4444-a444-444444444444";
  const cartId = "76485077-6367-48df-81fc-c77b8680d0b5";

  const product = await db.query.products.findFirst({
    where: eq(products.id, productId)
  });

  const cart = await db.query.carts.findFirst({
    where: eq(carts.id, cartId)
  });

  console.log("Product exists:", !!product);
  if (product) console.log("Product name:", product.name);
  
  console.log("Cart exists:", !!cart);
  
  process.exit(0);
}

checkIds().catch(err => {
  console.error(err);
  process.exit(1);
});
