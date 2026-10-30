import { Suspense } from "react"
import { redirect } from "next/navigation"
import { asc } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/db"
import { airports } from "@/db/schema"
import { CrudManager } from "@/components/crud/crud-manager"
import { CrudTableSkeleton } from "@/components/skeletons/crud-table-skeleton"
import type { ColumnDef, FieldDef } from "@/lib/crud-types"
import {
  createAirportAction,
  deleteAirportAction,
  updateAirportAction,
} from "@/lib/master-data-actions"

const columns: ColumnDef[] = [
  { key: "airportCode", header: "Kode", kind: "mono", className: "w-24" },
  { key: "airportName", header: "Nama Bandara" },
  { key: "city", header: "Kota" },
  { key: "country", header: "Negara", kind: "badge", className: "w-24" },
  { key: "icao", header: "ICAO", kind: "mono", className: "w-24" },
]

const fields: FieldDef[] = [
  {
    name: "airportCode",
    label: "Kode IATA",
    type: "text",
    required: true,
    placeholder: "CGK",
  },
  {
    name: "airportName",
    label: "Nama Bandara",
    type: "text",
    required: true,
    placeholder: "Soekarno-Hatta",
  },
  { name: "city", label: "Kota", type: "text", required: true },
  {
    name: "country",
    label: "Negara",
    type: "text",
    required: true,
    defaultValue: "ID",
  },
  { name: "icao", label: "Kode ICAO", type: "text", placeholder: "WIII" },
]

export default function AirportsPage() {
  return (
    <Suspense fallback={<CrudTableSkeleton />}>
      <AirportsContent />
    </Suspense>
  )
}

async function AirportsContent() {
  const session = await auth()
  if (session?.user?.role !== "admin") redirect("/signin")

  const rows = await db
    .select()
    .from(airports)
    .orderBy(asc(airports.airportName))

  return (
    <CrudManager
      tableId="airports"
      title="Master Bandara"
      description="Kelola data bandara dan kode IATA/ICAO."
      addLabel="Tambah Bandara"
      entityLabel="Bandara"
      columns={columns}
      fields={fields}
      searchKeys={["airportCode", "airportName", "city", "country", "icao"]}
      initialRows={rows}
      createAction={createAirportAction}
      updateAction={updateAirportAction}
      deleteAction={deleteAirportAction}
    />
  )
}
