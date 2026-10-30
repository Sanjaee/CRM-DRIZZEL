"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/db"
import { customerPics } from "@/db/schema"
import { fail, ok, toActionResult } from "@/lib/action-result"
import { writeAuditLog } from "@/lib/audit"
import type { ActionResult, FormValues } from "@/lib/crud-types"
import { requirePermission } from "@/lib/permissions"
import { optionalText } from "@/lib/zod-helpers"

const CUSTOMERS_PATH = "/admin/customer-management/customers"

const picSchema = z.object({
  customerId: z.string().trim().optional(),
  name: z.string().trim().min(1, "Nama PIC wajib diisi"),
  title: optionalText,
  emailAddress: optionalText,
  phoneNo: optionalText,
  mobilePhoneNo: optionalText,
  position: optionalText,
  division: optionalText,
  isActive: z.coerce.boolean().default(true),
  isHeadOfficer: z.coerce.boolean().default(false),
  userNo: optionalText,
})

export async function createCustomerPicAction(
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_pic.create")
    const data = picSchema.parse(input)
    if (!data.customerId) return fail("Customer tidak valid.")

    const [row] = await db
      .insert(customerPics)
      .values({
        customerId: data.customerId,
        name: data.name,
        title: data.title || null,
        emailAddress: data.emailAddress || null,
        phoneNo: data.phoneNo || null,
        mobilePhoneNo: data.mobilePhoneNo || null,
        position: data.position || null,
        division: data.division || null,
        isActive: data.isActive,
        isHeadOfficer: data.isHeadOfficer,
        userNo: data.userNo || null,
      })
      .returning()

    await writeAuditLog({
      userId: user.id,
      action: "create",
      resource: "customer_pic",
      resourceId: row.id,
    })
    revalidatePath(`${CUSTOMERS_PATH}/${data.customerId}`)
    return ok(row, "PIC berhasil ditambahkan.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function updateCustomerPicAction(
  id: string,
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_pic.update")
    const data = picSchema.parse(input)
    await db
      .update(customerPics)
      .set({
        name: data.name,
        title: data.title || null,
        emailAddress: data.emailAddress || null,
        phoneNo: data.phoneNo || null,
        mobilePhoneNo: data.mobilePhoneNo || null,
        position: data.position || null,
        division: data.division || null,
        isActive: data.isActive,
        isHeadOfficer: data.isHeadOfficer,
        userNo: data.userNo || null,
      })
      .where(eq(customerPics.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "update",
      resource: "customer_pic",
      resourceId: id,
    })
    if (data.customerId) revalidatePath(`${CUSTOMERS_PATH}/${data.customerId}`)
    return ok(undefined, "PIC berhasil diperbarui.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function deleteCustomerPicAction(
  id: string,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_pic.delete")
    await db.delete(customerPics).where(eq(customerPics.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "delete",
      resource: "customer_pic",
      resourceId: id,
    })
    return ok(undefined, "PIC berhasil dihapus.")
  } catch (error) {
    return toActionResult(error)
  }
}
