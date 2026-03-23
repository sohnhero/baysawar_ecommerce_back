import { db } from "./src/lib/db";
import { products } from "./src/db/schema";
import { ilike } from "drizzle-orm";

async function findIds() {
  const result = await db.query.products.findMany({
    where: (p, { or, ilike }) => or(
      ilike(p.name, "%Karité%"),
      ilike(p.name, "%Touba%")
    )
  });
  console.log(JSON.stringify(result.map(r => ({ name: r.name, id: r.id })), null, 2));
  process.exit(0);
}

findIds().catch(e => { console.error(e); process.exit(1); });
