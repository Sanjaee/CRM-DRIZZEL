"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/db"
import { customerRefundAccounts } from "@/db/schema"
import { fail, ok, toActionResult } from "@/lib/action-result"
import { writeAuditLog } from "@/lib/audit"
import type { ActionResult, FormValues } from "@/lib/crud-types"
import { requirePermission } from "@/lib/permissions"
import { optionalText } from "@/lib/zod-helpers"

const CUSTOMERS_PATH = "/admin/customer-management/customers"

const refundAccountSchema = z.object({
  customerId: z.string().trim().optional(),
  bankName: z.string().trim().min(1, "Nama bank wajib diisi"),
  bankBranch: optionalText,
  accountNo: z.string().trim().min(1, "Nomor rekening wajib diisi"),
  accountHolderName: z.string().trim().min(1, "Nama pemilik wajib diisi"),
  isPrimary: z.coerce.boolean().default(false),
})

export async function createRefundAccountAction(
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("refund_account.create")
    const data = refundAccountSchema.parse(input)
    if (!data.customerId) return fail("Customer tidak valid.")

    const [row] = await db
      .insert(customerRefundAccounts)
      .values({
        customerId: data.customerId,
        bankName: data.bankName,
        bankBranch: data.bankBranch || null,
        accountNo: data.accountNo,
        accountHolderName: data.accountHolderName,
        isPrimary: data.isPrimary,
      })
      .returning()

    await writeAuditLog({
      userId: user.id,
      action: "create",
      resource: "refund_account",
      resourceId: row.id,
    })
    revalidatePath(`${CUSTOMERS_PATH}/${data.customerId}`)
    return ok(row, "Rekening refund berhasil ditambahkan.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function updateRefundAccountAction(
  id: string,
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("refund_account.update")
    const data = refundAccountSchema.parse(input)
    await db
      .update(customerRefundAccounts)
      .set({
        bankName: data.bankName,
        bankBranch: data.bankBranch || null,
        accountNo: data.accountNo,
        accountHolderName: data.accountHolderName,
        isPrimary: data.isPrimary,
      })
      .where(eq(customerRefundAccounts.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "update",
      resource: "refund_account",
      resourceId: id,
    })
    if (data.customerId) revalidatePath(`${CUSTOMERS_PATH}/${data.customerId}`)
    return ok(undefined, "Rekening refund berhasil diperbarui.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function deleteRefundAccountAction(
  id: string,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("refund_account.delete")
    await db
      .delete(customerRefundAccounts)
      .where(eq(customerRefundAccounts.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "delete",
      resource: "refund_account",
      resourceId: id,
    })
    return ok(undefined, "Rekening refund berhasil dihapus.")
  } catch (error) {
    return toActionResult(error)
  }
}
