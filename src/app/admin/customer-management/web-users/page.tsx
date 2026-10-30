import { Suspense } from "react"
import { redirect } from "next/navigation"
import { asc, ne } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { CrudManager } from "@/components/crud/crud-manager"
import { CrudTableSkeleton } from "@/components/skeletons/crud-table-skeleton"
import type { ColumnDef, FieldDef } from "@/lib/crud-types"
import { updateWebUserAction } from "@/lib/web-user-actions"

const columns: ColumnDef[] = [
  { key: "name", header: "Nama" },
  { key: "email", header: "Email", kind: "mono" },
  { key: "signUpProvider", header: "Provider", kind: "badge", className: "w-28" },
  { key: "isEnabled", header: "Aktif", kind: "boolean", className: "w-20" },
  { key: "lastLogIn", header: "Login Terakhir", kind: "date", className: "w-40" },
]

const fields: FieldDef[] = [
  { name: "name", label: "Nama", type: "text" },
  { name: "isEnabled", label: "Aktif", type: "checkbox", defaultValue: true },
]

export default function WebUsersPage() {
  return (
    <Suspense fallback={<CrudTableSkeleton />}>
      <WebUsersContent />
    </Suspense>
  )
}

async function WebUsersContent() {
  const session = await auth()
  if (session?.user?.role !== "admin") redirect("/signin")

  const rows = await db
    .select()
    .from(users)
    .where(ne(users.role, "admin"))
    .orderBy(asc(users.email))

  return (
    <CrudManager
      tableId="web-users"
      title="Web Users"
      description="Daftar pengguna portal web (B2C/B2B) dan status aktifnya."
      entityLabel="Web User"
      columns={columns}
      fields={fields}
      searchKeys={["name", "email", "signUpProvider"]}
      initialRows={rows}
      updateAction={updateWebUserAction}
    />
  )
}
