"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/db"
import {
  customerCreditMovements,
  customerDepositMovements,
  customers,
} from "@/db/schema"
import { fail, ok, toActionResult } from "@/lib/action-result"
import { writeAuditLog } from "@/lib/audit"
import type { ActionResult, FormValues } from "@/lib/crud-types"
import { requirePermission } from "@/lib/permissions"
import { optionalNumber, requiredNumber } from "@/lib/zod-helpers"

const CUSTOMERS_PATH = "/admin/customer-management/customers"

const creditMovementTypes = ["Usage", "Repayment", "Adjustment", "Reversal"] as const
const depositMovementTypes = ["Deposit", "Refund", "Adjustment"] as const

const creditLimitSchema = z.object({
  creditLimit: requiredNumber,
})

const overUseSchema = z.object({
  allowCreditOverUse: z.coerce.boolean().default(false),
  maxCreditOverUseAmount: optionalNumber,
  creditOverUseValidUntil: z.preprocess(
    (value) =>
      value === "" || value === null || value === undefined ? undefined : value,
    z.coerce.date().optional(),
  ),
})

const creditMovementSchema = z.object({
  movementType: z.enum(creditMovementTypes),
  amount: requiredNumber,
  referenceDoc: z.string().optional(),
  notes: z.string().optional(),
})

const depositMovementSchema = z.object({
  movementType: z.enum(depositMovementTypes),
  amount: requiredNumber,
  referenceDoc: z.string().optional(),
  notes: z.string().optional(),
})

async function loadCustomer(id: string) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1)
  return customer
}

export async function updateCreditLimitAction(
  id: string,
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_credit.update")
    const data = creditLimitSchema.parse(input)
    const customer = await loadCustomer(id)
    if (!customer) return fail("Customer tidak ditemukan.")

    const limit = data.creditLimit
    const inUsed = Number(customer.creditInUsed ?? 0)
    const onHold = Number(customer.creditOnHold ?? 0)
    const balanceBefore = Number(customer.creditAvailable ?? 0)
    const available = limit - inUsed - onHold

    await db
      .update(customers)
      .set({
        creditLimit: String(limit),
        creditAvailable: String(available),
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id))

    await db.insert(customerCreditMovements).values({
      customerId: id,
      movementType: "Adjustment",
      movementStatus: "Settled",
      balanceBefore: String(balanceBefore),
      amount: String(limit - Number(customer.creditLimit ?? 0)),
      balanceAfter: String(available),
      notes: "Ubah limit kredit",
    })

    await writeAuditLog({
      userId: user.id,
      action: "update-credit-limit",
      resource: "customer",
      resourceId: id,
      meta: { limit },
    })
    revalidatePath(`${CUSTOMERS_PATH}/${id}`)
    return ok(undefined, "Limit kredit berhasil diperbarui.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function grantCreditOverUseAction(
  id: string,
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_credit.overuse")
    const data = overUseSchema.parse(input)
    await db
      .update(customers)
      .set({
        allowCreditOverUse: data.allowCreditOverUse,
        maxCreditOverUseAmount: String(data.maxCreditOverUseAmount ?? 0),
        creditOverUseValidUntil: data.creditOverUseValidUntil ?? null,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "grant-overuse",
      resource: "customer",
      resourceId: id,
    })
    revalidatePath(`${CUSTOMERS_PATH}/${id}`)
    return ok(undefined, "Over-use kredit berhasil diperbarui.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function recordCreditMovementAction(
  id: string,
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_credit.update")
    const data = creditMovementSchema.parse(input)
    const customer = await loadCustomer(id)
    if (!customer) return fail("Customer tidak ditemukan.")

    const limit = Number(customer.creditLimit ?? 0)
    const onHold = Number(customer.creditOnHold ?? 0)
    let inUsed = Number(customer.creditInUsed ?? 0)
    const balanceBefore = limit - inUsed - onHold

    if (data.movementType === "Usage") {
      const allowOverUse =
        customer.allowCreditOverUse &&
        (!customer.creditOverUseValidUntil ||
          new Date(customer.creditOverUseValidUntil) >= new Date())
      if (data.amount > balanceBefore && !allowOverUse) {
        return fail("Kredit tidak mencukupi. Aktifkan over-use untuk melanjutkan.")
      }
      inUsed += data.amount
    } else if (
      data.movementType === "Repayment" ||
      data.movementType === "Reversal"
    ) {
      inUsed = Math.max(0, inUsed - data.amount)
    } else {
      inUsed = Math.max(0, inUsed + data.amount)
    }

    const balanceAfter = limit - inUsed - onHold
    const signedAmount =
      data.movementType === "Usage" ? -data.amount : data.amount

    await db
      .update(customers)
      .set({
        creditInUsed: String(inUsed),
        creditAvailable: String(balanceAfter),
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id))

    await db.insert(customerCreditMovements).values({
      customerId: id,
      movementType: data.movementType,
      movementStatus: "Settled",
      balanceBefore: String(balanceBefore),
      amount: String(signedAmount),
      balanceAfter: String(balanceAfter),
      referenceDoc: data.referenceDoc || null,
      notes: data.notes || null,
    })

    await writeAuditLog({
      userId: user.id,
      action: "credit-movement",
      resource: "customer",
      resourceId: id,
      meta: { type: data.movementType, amount: data.amount },
    })
    revalidatePath(`${CUSTOMERS_PATH}/${id}`)
    return ok(undefined, "Mutasi kredit tercatat.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function recordDepositMovementAction(
  id: string,
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_credit.update")
    const data = depositMovementSchema.parse(input)
    const customer = await loadCustomer(id)
    if (!customer) return fail("Customer tidak ditemukan.")

    const onHold = Number(customer.depositOnHold ?? 0)
    let balance = Number(customer.depositBalance ?? 0)
    const balanceBefore = balance - onHold

    if (data.movementType === "Deposit") {
      balance += data.amount
    } else {
      balance = Math.max(0, balance - data.amount)
    }

    const balanceAfter = balance - onHold
    const signedAmount =
      data.movementType === "Deposit" ? data.amount : -data.amount

    await db
      .update(customers)
      .set({
        depositBalance: String(balance),
        depositAvailable: String(balanceAfter),
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id))

    await db.insert(customerDepositMovements).values({
      customerId: id,
      movementType: data.movementType,
      movementStatus: "Settled",
      balanceBefore: String(balanceBefore),
      amount: String(signedAmount),
      balanceAfter: String(balanceAfter),
      referenceDoc: data.referenceDoc || null,
      notes: data.notes || null,
    })

    await writeAuditLog({
      userId: user.id,
      action: "deposit-movement",
      resource: "customer",
      resourceId: id,
      meta: { type: data.movementType, amount: data.amount },
    })
    revalidatePath(`${CUSTOMERS_PATH}/${id}`)
    return ok(undefined, "Mutasi deposit tercatat.")
  } catch (error) {
    return toActionResult(error)
  }
}
