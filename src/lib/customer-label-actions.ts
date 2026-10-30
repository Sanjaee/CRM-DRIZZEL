"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/db"
import { listOfCustomerLabels } from "@/db/schema"
import { ok, toActionResult } from "@/lib/action-result"
import { writeAuditLog } from "@/lib/audit"
import type { ActionResult, FormValues } from "@/lib/crud-types"
import { requirePermission } from "@/lib/permissions"
import { optionalText } from "@/lib/zod-helpers"

const LABELS_PATH = "/admin/customer-management/cust-labels"

const labelSchema = z.object({
  name: z.string().trim().min(1, "Nama label wajib diisi"),
  description: optionalText,
  color: z.string().trim().default("#3b82f6"),
  isPublic: z.coerce.boolean().default(true),
})

export async function createCustomerLabelAction(
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_label.create")
    const data = labelSchema.parse(input)
    const [row] = await db
      .insert(listOfCustomerLabels)
      .values({
        name: data.name,
        description: data.description || null,
        color: data.color || "#3b82f6",
        isPublic: data.isPublic,
      })
      .returning()
    await writeAuditLog({
      userId: user.id,
      action: "create",
      resource: "customer_label",
      resourceId: row.id,
    })
    revalidatePath(LABELS_PATH)
    return ok(row, "Label berhasil ditambahkan.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function updateCustomerLabelAction(
  id: string,
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_label.update")
    const data = labelSchema.parse(input)
    await db
      .update(listOfCustomerLabels)
      .set({
        name: data.name,
        description: data.description || null,
        color: data.color || "#3b82f6",
        isPublic: data.isPublic,
      })
      .where(eq(listOfCustomerLabels.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "update",
      resource: "customer_label",
      resourceId: id,
    })
    revalidatePath(LABELS_PATH)
    return ok(undefined, "Label berhasil diperbarui.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function deleteCustomerLabelAction(
  id: string,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_label.delete")
    await db.delete(listOfCustomerLabels).where(eq(listOfCustomerLabels.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "delete",
      resource: "customer_label",
      resourceId: id,
    })
    revalidatePath(LABELS_PATH)
    return ok(undefined, "Label berhasil dihapus.")
  } catch (error) {
    return toActionResult(error)
  }
}
