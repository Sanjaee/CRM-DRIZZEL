import { Suspense } from "react"
import { redirect } from "next/navigation"
import { asc } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/db"
import { listOfCustomerLabels } from "@/db/schema"
import { CrudManager } from "@/components/crud/crud-manager"
import { CrudTableSkeleton } from "@/components/skeletons/crud-table-skeleton"
import type { ColumnDef, FieldDef } from "@/lib/crud-types"
import {
  createCustomerLabelAction,
  deleteCustomerLabelAction,
  updateCustomerLabelAction,
} from "@/lib/customer-label-actions"

const columns: ColumnDef[] = [
  { key: "name", header: "Label" },
  { key: "color", header: "Warna", kind: "mono", className: "w-28" },
  { key: "isPublic", header: "Public", kind: "boolean", className: "w-24" },
  { key: "description", header: "Deskripsi" },
]

const fields: FieldDef[] = [
  { name: "name", label: "Nama Label", type: "text", required: true },
  {
    name: "color",
    label: "Warna (hex)",
    type: "text",
    defaultValue: "#3b82f6",
  },
  {
    name: "isPublic",
    label: "Public (terlihat semua staff)",
    type: "checkbox",
    defaultValue: true,
  },
  { name: "description", label: "Deskripsi", type: "textarea", colSpan: 2 },
]

export default function CustomerLabelsPage() {
  return (
    <Suspense fallback={<CrudTableSkeleton />}>
      <CustomerLabelsContent />
    </Suspense>
  )
}

async function CustomerLabelsContent() {
  const session = await auth()
  if (session?.user?.role !== "admin") redirect("/signin")

  const rows = await db
    .select()
    .from(listOfCustomerLabels)
    .orderBy(asc(listOfCustomerLabels.name))

  return (
    <CrudManager
      tableId="customer-labels"
      title="Customer Labels"
      description="Label fleksibel untuk klasifikasi customer (VIP, High Risk, dll)."
      addLabel="Tambah Label"
      entityLabel="Label"
      columns={columns}
      fields={fields}
      searchKeys={["name", "description"]}
      initialRows={rows}
      createAction={createCustomerLabelAction}
      updateAction={updateCustomerLabelAction}
      deleteAction={deleteCustomerLabelAction}
    />
  )
}
