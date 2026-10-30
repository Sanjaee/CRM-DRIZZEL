"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/db"
import {
  customerRuleTemplateDetails,
  customerRuleTemplates,
  customerRules,
} from "@/db/schema"
import { fail, ok, toActionResult } from "@/lib/action-result"
import { writeAuditLog } from "@/lib/audit"
import type { ActionResult, FormValues } from "@/lib/crud-types"
import { requirePermission } from "@/lib/permissions"
import { optionalText } from "@/lib/zod-helpers"

const CUSTOMERS_PATH = "/admin/customer-management/customers"
const TEMPLATES_PATH = "/admin/customer-management/rule-templates"

const templateSchema = z.object({
  name: z.string().trim().min(1, "Nama template wajib diisi"),
  description: optionalText,
})

const templateDetailSchema = z.object({
  templateId: z.string().trim().optional(),
  ruleType: z.string().trim().default("BookingRestriction"),
  conditionKey: z.string().trim().min(1, "Condition key wajib diisi"),
  conditionOperator: z.string().trim().default("eq"),
  conditionValue: z.string().trim().min(1, "Condition value wajib diisi"),
})

const ruleSchema = z.object({
  customerId: z.string().trim().optional(),
  ruleType: z.string().trim().default("BookingRestriction"),
  conditionKey: z.string().trim().min(1, "Condition key wajib diisi"),
  conditionOperator: z.string().trim().default("eq"),
  conditionValue: z.string().trim().min(1, "Condition value wajib diisi"),
  isActive: z.coerce.boolean().default(true),
})

export async function createRuleTemplateAction(
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_rule.create")
    const data = templateSchema.parse(input)
    const [row] = await db
      .insert(customerRuleTemplates)
      .values({ name: data.name, description: data.description || null })
      .returning()
    await writeAuditLog({
      userId: user.id,
      action: "create",
      resource: "customer_rule_template",
      resourceId: row.id,
    })
    revalidatePath(TEMPLATES_PATH)
    return ok(row, "Template rule berhasil ditambahkan.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function updateRuleTemplateAction(
  id: string,
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_rule.update")
    const data = templateSchema.parse(input)
    await db
      .update(customerRuleTemplates)
      .set({ name: data.name, description: data.description || null })
      .where(eq(customerRuleTemplates.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "update",
      resource: "customer_rule_template",
      resourceId: id,
    })
    revalidatePath(TEMPLATES_PATH)
    return ok(undefined, "Template rule berhasil diperbarui.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function deleteRuleTemplateAction(
  id: string,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_rule.delete")
    await db
      .delete(customerRuleTemplates)
      .where(eq(customerRuleTemplates.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "delete",
      resource: "customer_rule_template",
      resourceId: id,
    })
    revalidatePath(TEMPLATES_PATH)
    return ok(undefined, "Template rule berhasil dihapus.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function createRuleTemplateDetailAction(
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_rule.create")
    const data = templateDetailSchema.parse(input)
    if (!data.templateId) return fail("Template tidak valid.")
    const [row] = await db
      .insert(customerRuleTemplateDetails)
      .values({
        templateId: data.templateId,
        ruleType: data.ruleType,
        conditionKey: data.conditionKey,
        conditionOperator: data.conditionOperator,
        conditionValue: data.conditionValue,
      })
      .returning()
    await writeAuditLog({
      userId: user.id,
      action: "create",
      resource: "customer_rule_template_detail",
      resourceId: row.id,
    })
    revalidatePath(`${TEMPLATES_PATH}/${data.templateId}`)
    return ok(row, "Detail rule berhasil ditambahkan.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function updateRuleTemplateDetailAction(
  id: string,
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_rule.update")
    const data = templateDetailSchema.parse(input)
    await db
      .update(customerRuleTemplateDetails)
      .set({
        ruleType: data.ruleType,
        conditionKey: data.conditionKey,
        conditionOperator: data.conditionOperator,
        conditionValue: data.conditionValue,
      })
      .where(eq(customerRuleTemplateDetails.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "update",
      resource: "customer_rule_template_detail",
      resourceId: id,
    })
    if (data.templateId) revalidatePath(`${TEMPLATES_PATH}/${data.templateId}`)
    return ok(undefined, "Detail rule berhasil diperbarui.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function deleteRuleTemplateDetailAction(
  id: string,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_rule.delete")
    await db
      .delete(customerRuleTemplateDetails)
      .where(eq(customerRuleTemplateDetails.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "delete",
      resource: "customer_rule_template_detail",
      resourceId: id,
    })
    return ok(undefined, "Detail rule berhasil dihapus.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function createCustomerRuleAction(
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_rule.create")
    const data = ruleSchema.parse(input)
    if (!data.customerId) return fail("Customer tidak valid.")
    const [row] = await db
      .insert(customerRules)
      .values({
        customerId: data.customerId,
        ruleType: data.ruleType,
        conditionKey: data.conditionKey,
        conditionOperator: data.conditionOperator,
        conditionValue: data.conditionValue,
        isActive: data.isActive,
      })
      .returning()
    await writeAuditLog({
      userId: user.id,
      action: "create",
      resource: "customer_rule",
      resourceId: row.id,
    })
    revalidatePath(`${CUSTOMERS_PATH}/${data.customerId}`)
    return ok(row, "Rule customer berhasil ditambahkan.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function updateCustomerRuleAction(
  id: string,
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_rule.update")
    const data = ruleSchema.parse(input)
    await db
      .update(customerRules)
      .set({
        ruleType: data.ruleType,
        conditionKey: data.conditionKey,
        conditionOperator: data.conditionOperator,
        conditionValue: data.conditionValue,
        isActive: data.isActive,
      })
      .where(eq(customerRules.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "update",
      resource: "customer_rule",
      resourceId: id,
    })
    if (data.customerId) revalidatePath(`${CUSTOMERS_PATH}/${data.customerId}`)
    return ok(undefined, "Rule customer berhasil diperbarui.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function deleteCustomerRuleAction(
  id: string,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer_rule.delete")
    await db.delete(customerRules).where(eq(customerRules.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "delete",
      resource: "customer_rule",
      resourceId: id,
    })
    return ok(undefined, "Rule customer berhasil dihapus.")
  } catch (error) {
    return toActionResult(error)
  }
}
