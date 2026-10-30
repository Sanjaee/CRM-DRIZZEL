import { readFileSync } from "fs";
import { resolve } from "path";
import * as dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not defined in .env.local");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function runMigration() {
  const migrationPath = resolve(process.cwd(), "drizzle", "0002_dry_diamondback.sql");
  console.log(`Reading migration from: ${migrationPath}`);
  const sqlContent = readFileSync(migrationPath, "utf-8");

  // Split by drizzle statement breakpoint
  const statements = sqlContent
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Found ${statements.length} SQL statements to execute.`);

  let successCount = 0;
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await sql.query(stmt);
      successCount++;
    } catch (err: unknown) {
      const error = err as { message?: string };
      // If table/column/constraint already exists, log as warning
      if (
        error.message?.includes("already exists") ||
        error.message?.includes("duplicate")
      ) {
        console.warn(`[Statement ${i + 1}] Notice: ${error.message}`);
        successCount++;
      } else {
        console.error(`[Statement ${i + 1}] Error executing:`, stmt);
        console.error("Error details:", error.message);
        throw err;
      }
    }
  }

  console.log(`Migration applied successfully! (${successCount}/${statements.length} statements executed)`);
}

runMigration()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  });
