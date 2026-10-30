import { Suspense } from "react"
import { redirect } from "next/navigation"
import { asc } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/db"
import { adminUserDepartments } from "@/db/schema"
import { CrudManager } from "@/components/crud/crud-manager"
import { CrudTableSkeleton } from "@/components/skeletons/crud-table-skeleton"
import type { ColumnDef, FieldDef } from "@/lib/crud-types"
import {
  createDepartmentAction,
  deleteDepartmentAction,
  updateDepartmentAction,
} from "@/lib/user-permissions-actions"

const columns: ColumnDef[] = [
  { key: "code", header: "Kode", kind: "mono", className: "w-32" },
  { key: "name", header: "Nama Departemen" },
  { key: "description", header: "Deskripsi" },
  { key: "isActive", header: "Aktif", kind: "boolean", className: "w-20" },
]

const fields: FieldDef[] = [
  {
    name: "code",
    label: "Kode",
    type: "text",
    required: true,
    placeholder: "FIN",
  },
  { name: "name", label: "Nama Departemen", type: "text", required: true },
  { name: "description", label: "Deskripsi", type: "textarea", colSpan: 2 },
  {
    name: "isActive",
    label: "Aktif",
    type: "checkbox",
    defaultValue: true,
  },
]

export default function AdminDepartmentsPage() {
  return (
    <Suspense fallback={<CrudTableSkeleton />}>
      <AdminDepartmentsContent />
    </Suspense>
  )
}

async function AdminDepartmentsContent() {
  const session = await auth()
  if (session?.user?.role !== "admin") redirect("/signin")

  const rows = await db
    .select()
    .from(adminUserDepartments)
    .orderBy(asc(adminUserDepartments.name))

  return (
    <CrudManager
      tableId="admin-departments"
      title="Departemen Admin"
      description="Kelola departemen untuk keperluan scope approval & penomoran."
      addLabel="Tambah Departemen"
      entityLabel="Departemen"
      columns={columns}
      fields={fields}
      searchKeys={["code", "name"]}
      initialRows={rows}
      createAction={createDepartmentAction}
      updateAction={updateDepartmentAction}
      deleteAction={deleteDepartmentAction}
    />
  )
}
