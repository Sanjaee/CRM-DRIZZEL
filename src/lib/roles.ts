import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ??
  "afrizaahmad18@gmail.com")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null): boolean {
  return Boolean(email && ADMIN_EMAILS.includes(email.toLowerCase()));
}

export async function syncUserRole(
  userId: string,
  email?: string | null,
): Promise<string> {
  const [row] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  let role = row?.role ?? "user";

  if (isAdminEmail(email) && role !== "admin") {
    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.id, userId));
    role = "admin";
  }

  return role;
}