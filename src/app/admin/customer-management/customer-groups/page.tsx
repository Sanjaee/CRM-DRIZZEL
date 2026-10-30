import { Suspense } from "react"
import { redirect } from "next/navigation"
import { asc } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/db"
import { customerGroups } from "@/db/schema"
import { CrudManager } from "@/components/crud/crud-manager"
import { CrudTableSkeleton } from "@/components/skeletons/crud-table-skeleton"
import type { ColumnDef, FieldDef } from "@/lib/crud-types"
import {
  createCustomerGroupAction,
  deleteCustomerGroupAction,
  updateCustomerGroupAction,
} from "@/lib/customer-group-actions"

const columns: ColumnDef[] = [
  { key: "name", header: "Nama Grup" },
  { key: "customerType", header: "Tipe", kind: "badge", className: "w-28" },
  { key: "defaultCreditLimit", header: "Limit Default", kind: "mono" },
  { key: "maxCreditLimit", header: "Limit Maks", kind: "mono" },
  { key: "dueDays", header: "Due Days", className: "w-24" },
]

const fields: FieldDef[] = [
  { name: "name", label: "Nama Grup", type: "text", required: true },
  {
    name: "customerType",
    label: "Tipe Customer",
    type: "select",
    defaultValue: "Corporate",
    options: [
      { label: "Corporate", value: "Corporate" },
      { label: "Individual", value: "Individual" },
    ],
  },
  { name: "businessType", label: "Business Type", type: "text" },
  {
    name: "defaultCreditLimit",
    label: "Default Credit Limit",
    type: "number",
    defaultValue: 0,
  },
  {
    name: "maxCreditLimit",
    label: "Max Credit Limit",
    type: "number",
    defaultValue: 0,
  },
  { name: "dueDays", label: "Due Days", type: "number", defaultValue: 30 },
  { name: "description", label: "Deskripsi", type: "textarea", colSpan: 2 },
]

export default function CustomerGroupsPage() {
  return (
    <Suspense fallback={<CrudTableSkeleton />}>
      <CustomerGroupsContent />
    </Suspense>
  )
}

async function CustomerGroupsContent() {
  const session = await auth()
  if (session?.user?.role !== "admin") redirect("/signin")

  const rows = await db
    .select()
    .from(customerGroups)
    .orderBy(asc(customerGroups.name))

  return (
    <CrudManager
      tableId="customer-groups"
      title="Customer Groups"
      description="Segmentasi customer dengan default limit kredit & due days."
      addLabel="Tambah Grup"
      entityLabel="Grup"
      columns={columns}
      fields={fields}
      searchKeys={["name", "customerType", "businessType"]}
      initialRows={rows}
      createAction={createCustomerGroupAction}
      updateAction={updateCustomerGroupAction}
      deleteAction={deleteCustomerGroupAction}
    />
  )
}
