"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/db"
import {
  customerCreditMovements,
  customerGroups,
  customerLabelAssignments,
  customers,
} from "@/db/schema"
import { ok, toActionResult } from "@/lib/action-result"
import { writeAuditLog } from "@/lib/audit"
import type { ActionResult, FormValues } from "@/lib/crud-types"
import { generateCustomerNo } from "@/lib/customer-number"
import { requirePermission } from "@/lib/permissions"
import { optionalInt, optionalNumber, optionalText } from "@/lib/zod-helpers"

const CUSTOMERS_PATH = "/admin/customer-management/customers"

const customerStatuses = [
  "Draft",
  "PendingVerification",
  "Active",
  "Suspended",
  "Inactive",
] as const

const customerSchema = z.object({
  name: z.string().trim().min(1, "Nama customer wajib diisi"),
  alias: optionalText,
  customerGroupId: optionalText,
  customerType: z.string().trim().default("Corporate"),
  businessType: optionalText,
  businessNature: optionalText,
  emailAddress: optionalText,
  phoneNo: optionalText,
  officeAddress: optionalText,
  officeAddressCity: optionalText,
  officeAddressCountry: optionalText,
  currencyCode: z.string().trim().default("IDR"),
  dueDays: optionalInt,
  gracePeriod: optionalInt,
  taxIdType: optionalText,
  taxIdNo: optionalText,
  taxPayerName: optionalText,
  creditLimit: optionalNumber,
  status: z.enum(customerStatuses).default("Active"),
})

const statusSchema = z.enum(customerStatuses)

function profileValues(data: z.infer<typeof customerSchema>) {
  return {
    name: data.name,
    alias: data.alias || null,
    customerGroupId: data.customerGroupId || null,
    customerType: data.customerType || "Corporate",
    businessType: data.businessType || null,
    businessNature: data.businessNature || null,
    emailAddress: data.emailAddress || null,
    phoneNo: data.phoneNo || null,
    officeAddress: data.officeAddress || null,
    officeAddressCity: data.officeAddressCity || null,
    officeAddressCountry: data.officeAddressCountry || null,
    currencyCode: data.currencyCode || "IDR",
    dueDays: data.dueDays ?? 30,
    gracePeriod: data.gracePeriod ?? 7,
    taxIdType: data.taxIdType || null,
    taxIdNo: data.taxIdNo || null,
    taxPayerName: data.taxPayerName || null,
    status: data.status,
  }
}

export async function createCustomerAction(
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer.create")
    const data = customerSchema.parse(input)

    let creditLimit = data.creditLimit ?? 0
    if (!creditLimit && data.customerGroupId) {
      const [group] = await db
        .select({ defaultCreditLimit: customerGroups.defaultCreditLimit })
        .from(customerGroups)
        .where(eq(customerGroups.id, data.customerGroupId))
        .limit(1)
      if (group?.defaultCreditLimit) {
        creditLimit = Number(group.defaultCreditLimit)
      }
    }

    const customerNo = await generateCustomerNo()

    const [row] = await db
      .insert(customers)
      .values({
        ...profileValues(data),
        customerNo,
        creditLimit: String(creditLimit),
        creditInUsed: "0",
        creditOnHold: "0",
        creditAvailable: String(creditLimit),
      })
      .returning()

    if (creditLimit > 0) {
      await db.insert(customerCreditMovements).values({
        customerId: row.id,
        movementType: "InitialAllocation",
        movementStatus: "Settled",
        balanceBefore: "0",
        amount: String(creditLimit),
        balanceAfter: String(creditLimit),
        notes: "Alokasi kredit awal",
      })
    }

    await writeAuditLog({
      userId: user.id,
      action: "create",
      resource: "customer",
      resourceId: row.id,
      meta: { customerNo },
    })
    revalidatePath(CUSTOMERS_PATH)
    return ok(row, `Customer ${customerNo} berhasil dibuat.`)
  } catch (error) {
    return toActionResult(error)
  }
}

export async function updateCustomerAction(
  id: string,
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer.update")
    const data = customerSchema.parse(input)
    await db
      .update(customers)
      .set({ ...profileValues(data), updatedAt: new Date() })
      .where(eq(customers.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "update",
      resource: "customer",
      resourceId: id,
    })
    revalidatePath(CUSTOMERS_PATH)
    revalidatePath(`${CUSTOMERS_PATH}/${id}`)
    return ok(undefined, "Customer berhasil diperbarui.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function updateCustomerStatusAction(
  id: string,
  status: string,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer.status")
    const parsedStatus = statusSchema.parse(status)
    await db
      .update(customers)
      .set({ status: parsedStatus, updatedAt: new Date() })
      .where(eq(customers.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "update-status",
      resource: "customer",
      resourceId: id,
      meta: { status: parsedStatus },
    })
    revalidatePath(CUSTOMERS_PATH)
    revalidatePath(`${CUSTOMERS_PATH}/${id}`)
    return ok(undefined, `Status diubah menjadi ${parsedStatus}.`)
  } catch (error) {
    return toActionResult(error)
  }
}

export async function setCustomerLabelsAction(
  customerId: string,
  labelIds: string[],
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_label.update")
    await db
      .delete(customerLabelAssignments)
      .where(eq(customerLabelAssignments.customerId, customerId))
    if (labelIds.length > 0) {
      await db.insert(customerLabelAssignments).values(
        labelIds.map((labelId) => ({ customerId, labelId })),
      )
    }
    await writeAuditLog({
      userId: user.id,
      action: "set-labels",
      resource: "customer",
      resourceId: customerId,
      meta: { count: labelIds.length },
    })
    revalidatePath(`${CUSTOMERS_PATH}/${customerId}`)
    return ok(undefined, "Label customer berhasil disimpan.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function deleteCustomerAction(id: string): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer.delete")
    await db.delete(customers).where(eq(customers.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "delete",
      resource: "customer",
      resourceId: id,
    })
    revalidatePath(CUSTOMERS_PATH)
    return ok(undefined, "Customer berhasil dihapus.")
  } catch (error) {
    return toActionResult(error)
  }
}
