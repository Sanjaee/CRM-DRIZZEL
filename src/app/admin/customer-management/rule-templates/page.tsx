import { Suspense } from "react"
import { redirect } from "next/navigation"
import { asc } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/db"
import { customerRuleTemplates } from "@/db/schema"
import { CrudManager } from "@/components/crud/crud-manager"
import { CrudTableSkeleton } from "@/components/skeletons/crud-table-skeleton"
import type { ColumnDef, FieldDef } from "@/lib/crud-types"
import {
  createRuleTemplateAction,
  deleteRuleTemplateAction,
  updateRuleTemplateAction,
} from "@/lib/customer-rule-actions"

const columns: ColumnDef[] = [
  { key: "name", header: "Nama Template" },
  { key: "description", header: "Deskripsi" },
]

const fields: FieldDef[] = [
  { name: "name", label: "Nama Template", type: "text", required: true },
  { name: "description", label: "Deskripsi", type: "textarea", colSpan: 2 },
]

export default function RuleTemplatesPage() {
  return (
    <Suspense fallback={<CrudTableSkeleton />}>
      <RuleTemplatesContent />
    </Suspense>
  )
}

async function RuleTemplatesContent() {
  const session = await auth()
  if (session?.user?.role !== "admin") redirect("/signin")

  const rows = await db
    .select()
    .from(customerRuleTemplates)
    .orderBy(asc(customerRuleTemplates.name))

  return (
    <CrudManager
      tableId="rule-templates"
      title="Customer Rule Templates"
      description="Template aturan booking yang bisa dipakai ulang oleh customer."
      addLabel="Tambah Template"
      entityLabel="Template"
      columns={columns}
      fields={fields}
      searchKeys={["name", "description"]}
      initialRows={rows}
      detailHrefPrefix="/admin/customer-management/rule-templates"
      createAction={createRuleTemplateAction}
      updateAction={updateRuleTemplateAction}
      deleteAction={deleteRuleTemplateAction}
    />
  )
}
