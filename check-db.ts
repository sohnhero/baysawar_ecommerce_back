import { db } from "./src/lib/db";
import { sql } from "drizzle-orm";

async function checkTables() {
  try {
    const result = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`);
    console.log("Tables in database:", result);
    process.exit(0);
  } catch (error) {
    console.error("Failed to check tables:", error);
    process.exit(1);
  }
}

checkTables();
