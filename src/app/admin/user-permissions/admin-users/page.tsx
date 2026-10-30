import { Suspense } from "react"
import { redirect } from "next/navigation"
import { asc, eq, or } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/db"
import { adminUserDepartments, adminUserRoles, users } from "@/db/schema"
import { CrudManager } from "@/components/crud/crud-manager"
import { CrudTableSkeleton } from "@/components/skeletons/crud-table-skeleton"
import type { ColumnDef, FieldDef } from "@/lib/crud-types"
import { updateAdminUserAction } from "@/lib/user-permissions-actions"

const columns: ColumnDef[] = [
  { key: "name", header: "Nama" },
  { key: "email", header: "Email", kind: "mono" },
  { key: "role", header: "Role", kind: "badge", className: "w-24" },
  { key: "adminUserRole", header: "Role Admin", kind: "badge", className: "w-32" },
  { key: "adminUserDepartment", header: "Departemen", className: "w-32" },
  { key: "isEnabled", header: "Aktif", kind: "boolean", className: "w-20" },
]

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<CrudTableSkeleton />}>
      <AdminUsersContent />
    </Suspense>
  )
}

async function AdminUsersContent() {
  const session = await auth()
  if (session?.user?.role !== "admin") redirect("/signin")

  const [rows, roleRows, departmentRows] = await Promise.all([
    db
      .select()
      .from(users)
      .where(or(eq(users.role, "admin"), eq(users.isAdminUser, true)))
      .orderBy(asc(users.email)),
    db
      .select({ role: adminUserRoles.role })
      .from(adminUserRoles)
      .orderBy(asc(adminUserRoles.role)),
    db
      .select({
        code: adminUserDepartments.code,
        name: adminUserDepartments.name,
      })
      .from(adminUserDepartments)
      .orderBy(asc(adminUserDepartments.name)),
  ])

  const fields: FieldDef[] = [
    { name: "name", label: "Nama", type: "text" },
    {
      name: "adminUserRole",
      label: "Role Admin (RBAC)",
      type: "select",
      placeholder: "Tanpa role khusus (akses penuh)",
      options: roleRows.map((role) => ({
        label: role.role,
        value: role.role,
      })),
    },
    {
      name: "adminUserDepartment",
      label: "Departemen",
      type: "select",
      placeholder: "Pilih departemen",
      options: departmentRows.map((department) => ({
        label: `${department.code} — ${department.name}`,
        value: department.code,
      })),
    },
    { name: "isEnabled", label: "Aktif", type: "checkbox", defaultValue: true },
    {
      name: "isAdminUser",
      label: "Admin User",
      type: "checkbox",
      defaultValue: true,
    },
  ]

  return (
    <CrudManager
      tableId="admin-users"
      title="Admin Users"
      description="Atur role, departemen, dan status akses admin."
      entityLabel="Admin User"
      columns={columns}
      fields={fields}
      searchKeys={["name", "email", "role", "adminUserRole"]}
      initialRows={rows}
      updateAction={updateAdminUserAction}
    />
  )
}
