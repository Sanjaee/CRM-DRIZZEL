"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/db"
import { customerGroups } from "@/db/schema"
import { ok, toActionResult } from "@/lib/action-result"
import { writeAuditLog } from "@/lib/audit"
import type { ActionResult, FormValues } from "@/lib/crud-types"
import { requirePermission } from "@/lib/permissions"
import { optionalInt, optionalNumber, optionalText } from "@/lib/zod-helpers"

const GROUPS_PATH = "/admin/customer-management/customer-groups"

const groupSchema = z.object({
  name: z.string().trim().min(1, "Nama grup wajib diisi"),
  description: optionalText,
  customerType: z.string().trim().default("Corporate"),
  businessType: optionalText,
  defaultCreditLimit: optionalNumber,
  maxCreditLimit: optionalNumber,
  dueDays: optionalInt,
})

export async function createCustomerGroupAction(
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_group.create")
    const data = groupSchema.parse(input)
    const [row] = await db
      .insert(customerGroups)
      .values({
        name: data.name,
        description: data.description || null,
        customerType: data.customerType || "Corporate",
        businessType: data.businessType || null,
        defaultCreditLimit: String(data.defaultCreditLimit ?? 0),
        maxCreditLimit: String(data.maxCreditLimit ?? 0),
        dueDays: data.dueDays ?? 30,
      })
      .returning()
    await writeAuditLog({
      userId: user.id,
      action: "create",
      resource: "customer_group",
      resourceId: row.id,
    })
    revalidatePath(GROUPS_PATH)
    return ok(row, "Grup customer berhasil ditambahkan.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function updateCustomerGroupAction(
  id: string,
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_group.update")
    const data = groupSchema.parse(input)
    await db
      .update(customerGroups)
      .set({
        name: data.name,
        description: data.description || null,
        customerType: data.customerType || "Corporate",
        businessType: data.businessType || null,
        defaultCreditLimit: String(data.defaultCreditLimit ?? 0),
        maxCreditLimit: String(data.maxCreditLimit ?? 0),
        dueDays: data.dueDays ?? 30,
      })
      .where(eq(customerGroups.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "update",
      resource: "customer_group",
      resourceId: id,
    })
    revalidatePath(GROUPS_PATH)
    return ok(undefined, "Grup customer berhasil diperbarui.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function deleteCustomerGroupAction(
  id: string,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_group.delete")
    await db.delete(customerGroups).where(eq(customerGroups.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "delete",
      resource: "customer_group",
      resourceId: id,
    })
    revalidatePath(GROUPS_PATH)
    return ok(undefined, "Grup customer berhasil dihapus.")
  } catch (error) {
    return toActionResult(error)
  }
}
