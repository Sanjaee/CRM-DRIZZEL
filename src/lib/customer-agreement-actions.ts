"use server"

import { and, eq, ne } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/db"
import { customerAgreementDocs } from "@/db/schema"
import { fail, ok, toActionResult } from "@/lib/action-result"
import { writeAuditLog } from "@/lib/audit"
import type { ActionResult, FormValues } from "@/lib/crud-types"
import { requirePermission } from "@/lib/permissions"
import { optionalText } from "@/lib/zod-helpers"

const CUSTOMERS_PATH = "/admin/customer-management/customers"
const MONITORING_PATH = "/admin/customer-management/agreement-monitoring"

const dateInput = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? undefined : value,
  z.coerce.date(),
)

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10)
}

const agreementSchema = z.object({
  customerId: z.string().trim().optional(),
  documentNo: z.string().trim().min(1, "Nomor dokumen wajib diisi"),
  title: z.string().trim().min(1, "Judul wajib diisi"),
  startDate: dateInput,
  endDate: dateInput,
  fileUrl: optionalText,
  isActive: z.coerce.boolean().default(true),
})

export async function createAgreementAction(
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("agreement.create")
    const data = agreementSchema.parse(input)
    if (!data.customerId) return fail("Customer tidak valid.")

    if (data.isActive) {
      await db
        .update(customerAgreementDocs)
        .set({ isActive: false })
        .where(eq(customerAgreementDocs.customerId, data.customerId))
    }

    const [row] = await db
      .insert(customerAgreementDocs)
      .values({
        customerId: data.customerId,
        documentNo: data.documentNo,
        title: data.title,
        startDate: toDateString(data.startDate),
        endDate: toDateString(data.endDate),
        fileUrl: data.fileUrl || null,
        isActive: data.isActive,
      })
      .returning()

    await writeAuditLog({
      userId: user.id,
      action: "create",
      resource: "agreement",
      resourceId: row.id,
    })
    revalidatePath(`${CUSTOMERS_PATH}/${data.customerId}`)
    revalidatePath(MONITORING_PATH)
    return ok(row, "Agreement berhasil ditambahkan.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function updateAgreementAction(
  id: string,
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("agreement.update")
    const data = agreementSchema.parse(input)

    if (data.isActive && data.customerId) {
      await db
        .update(customerAgreementDocs)
        .set({ isActive: false })
        .where(
          and(
            eq(customerAgreementDocs.customerId, data.customerId),
            ne(customerAgreementDocs.id, id),
          ),
        )
    }

    await db
      .update(customerAgreementDocs)
      .set({
        documentNo: data.documentNo,
        title: data.title,
        startDate: toDateString(data.startDate),
        endDate: toDateString(data.endDate),
        fileUrl: data.fileUrl || null,
        isActive: data.isActive,
      })
      .where(eq(customerAgreementDocs.id, id))

    await writeAuditLog({
      userId: user.id,
      action: "update",
      resource: "agreement",
      resourceId: id,
    })
    if (data.customerId) revalidatePath(`${CUSTOMERS_PATH}/${data.customerId}`)
    revalidatePath(MONITORING_PATH)
    return ok(undefined, "Agreement berhasil diperbarui.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function deleteAgreementAction(
  id: string,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("agreement.delete")
    await db.delete(customerAgreementDocs).where(eq(customerAgreementDocs.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "delete",
      resource: "agreement",
      resourceId: id,
    })
    revalidatePath(MONITORING_PATH)
    return ok(undefined, "Agreement berhasil dihapus.")
  } catch (error) {
    return toActionResult(error)
  }
}
