import { desc, like } from "drizzle-orm"

import { db } from "@/db"
import { customers } from "@/db/schema"

export async function generateCustomerNo(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `CUST-${year}-`

  const [last] = await db
    .select({ customerNo: customers.customerNo })
    .from(customers)
    .where(like(customers.customerNo, `${prefix}%`))
    .orderBy(desc(customers.customerNo))
    .limit(1)

  const lastSequence = last?.customerNo
    ? Number(last.customerNo.slice(prefix.length))
    : 0
  const next = Number.isNaN(lastSequence) ? 1 : lastSequence + 1

  return `${prefix}${String(next).padStart(5, "0")}`
}
