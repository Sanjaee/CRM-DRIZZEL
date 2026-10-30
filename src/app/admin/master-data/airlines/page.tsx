import { Suspense } from "react"
import { redirect } from "next/navigation"
import { asc } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/db"
import { airlines } from "@/db/schema"
import { CrudManager } from "@/components/crud/crud-manager"
import { CrudTableSkeleton } from "@/components/skeletons/crud-table-skeleton"
import type { ColumnDef, FieldDef } from "@/lib/crud-types"
import {
  createAirlineAction,
  deleteAirlineAction,
  updateAirlineAction,
} from "@/lib/master-data-actions"

const columns: ColumnDef[] = [
  { key: "airlineCode", header: "Kode", kind: "mono", className: "w-28" },
  { key: "airlineName", header: "Nama Maskapai" },
  { key: "alias", header: "Alias" },
  { key: "country", header: "Negara", kind: "badge", className: "w-24" },
  { key: "emailAddress", header: "Email" },
]

const fields: FieldDef[] = [
  {
    name: "airlineCode",
    label: "Kode Maskapai",
    type: "text",
    required: true,
    placeholder: "GA",
  },
  {
    name: "airlineName",
    label: "Nama Maskapai",
    type: "text",
    required: true,
    placeholder: "Garuda Indonesia",
  },
  { name: "alias", label: "Alias", type: "text" },
  { name: "country", label: "Negara", type: "text", defaultValue: "ID" },
  { name: "phoneNo", label: "Telepon", type: "text" },
  {
    name: "emailAddress",
    label: "Email",
    type: "text",
    placeholder: "cs@maskapai.com",
  },
]

export default function AirlinesPage() {
  return (
    <Suspense fallback={<CrudTableSkeleton />}>
      <AirlinesContent />
    </Suspense>
  )
}

async function AirlinesContent() {
  const session = await auth()
  if (session?.user?.role !== "admin") redirect("/signin")

  const rows = await db
    .select()
    .from(airlines)
    .orderBy(asc(airlines.airlineName))

  return (
    <CrudManager
      tableId="airlines"
      title="Master Maskapai"
      description="Kelola data maskapai penerbangan."
      addLabel="Tambah Maskapai"
      entityLabel="Maskapai"
      columns={columns}
      fields={fields}
      searchKeys={["airlineCode", "airlineName", "alias", "country"]}
      initialRows={rows}
      createAction={createAirlineAction}
      updateAction={updateAirlineAction}
      deleteAction={deleteAirlineAction}
    />
  )
}
