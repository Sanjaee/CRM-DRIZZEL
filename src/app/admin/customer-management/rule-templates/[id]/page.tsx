import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { asc, eq } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/db"
import {
  customerRuleTemplateDetails,
  customerRuleTemplates,
} from "@/db/schema"
import { CrudManager } from "@/components/crud/crud-manager"
import { CrudTableSkeleton } from "@/components/skeletons/crud-table-skeleton"
import type { ColumnDef, FieldDef } from "@/lib/crud-types"
import {
  createRuleTemplateDetailAction,
  deleteRuleTemplateDetailAction,
  updateRuleTemplateDetailAction,
} from "@/lib/customer-rule-actions"

const columns: ColumnDef[] = [
  { key: "ruleType", header: "Tipe", kind: "badge", className: "w-44" },
  { key: "conditionKey", header: "Condition Key", kind: "mono" },
  { key: "conditionOperator", header: "Operator", kind: "mono", className: "w-28" },
  { key: "conditionValue", header: "Value" },
]

const ruleTypeOptions = [
  { label: "Booking Restriction", value: "BookingRestriction" },
  { label: "Fare Rule", value: "FareRule" },
  { label: "Discount Rule", value: "DiscountRule" },
]

const operatorOptions = [
  { label: "Sama dengan (=)", value: "eq" },
  { label: "Tidak sama (!=)", value: "ne" },
  { label: "Lebih besar (>)", value: "gt" },
  { label: "Lebih kecil (<)", value: "lt" },
  { label: "Mengandung", value: "contains" },
]

export default function RuleTemplateDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense fallback={<CrudTableSkeleton />}>
      <RuleTemplateDetailContent params={props.params} />
    </Suspense>
  )
}

async function RuleTemplateDetailContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (session?.user?.role !== "admin") redirect("/signin")

  const { id } = await params

  const [template] = await db
    .select()
    .from(customerRuleTemplates)
    .where(eq(customerRuleTemplates.id, id))
    .limit(1)

  if (!template) notFound()

  const rows = await db
    .select()
    .from(customerRuleTemplateDetails)
    .where(eq(customerRuleTemplateDetails.templateId, id))
    .orderBy(asc(customerRuleTemplateDetails.ruleType))

  const fields: FieldDef[] = [
    { name: "templateId", label: "Template", type: "hidden", defaultValue: id },
    {
      name: "ruleType",
      label: "Tipe Rule",
      type: "select",
      defaultValue: "BookingRestriction",
      options: ruleTypeOptions,
    },
    {
      name: "conditionKey",
      label: "Condition Key",
      type: "text",
      required: true,
      placeholder: "mis. max_pax",
    },
    {
      name: "conditionOperator",
      label: "Operator",
      type: "select",
      defaultValue: "eq",
      options: operatorOptions,
    },
    {
      name: "conditionValue",
      label: "Condition Value",
      type: "text",
      required: true,
      placeholder: "mis. 20",
    },
  ]

  return (
    <CrudManager
      tableId={`rule-template-detail-${id}`}
      title={`Detail Rule: ${template.name}`}
      description="Baris aturan yang termasuk dalam template ini."
      addLabel="Tambah Detail"
      entityLabel="Detail Rule"
      backHref="/admin/customer-management/rule-templates"
      backLabel="Kembali ke Template"
      columns={columns}
      fields={fields}
      searchKeys={["conditionKey", "conditionValue", "ruleType"]}
      initialRows={rows}
      createAction={createRuleTemplateDetailAction}
      updateAction={updateRuleTemplateDetailAction}
      deleteAction={deleteRuleTemplateDetailAction}
    />
  )
}
