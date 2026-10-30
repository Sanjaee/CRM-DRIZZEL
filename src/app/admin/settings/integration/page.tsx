import { Suspense } from "react"
import { redirect } from "next/navigation"
import { asc } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/db"
import { integrations } from "@/db/schema"
import { CrudManager } from "@/components/crud/crud-manager"
import { CrudTableSkeleton } from "@/components/skeletons/crud-table-skeleton"
import type { ColumnDef, FieldDef } from "@/lib/crud-types"
import {
  createIntegrationAction,
  deleteIntegrationAction,
  updateIntegrationAction,
} from "@/lib/settings-actions"

const columns: ColumnDef[] = [
  { key: "name", header: "Nama" },
  { key: "serviceType", header: "Tipe Layanan", kind: "badge" },
  { key: "endPoint", header: "Endpoint", kind: "mono" },
  { key: "isEnabled", header: "Aktif", kind: "boolean", className: "w-20" },
  { key: "logActivity", header: "Log", kind: "boolean", className: "w-20" },
]

const fields: FieldDef[] = [
  { name: "name", label: "Nama Integrasi", type: "text", required: true },
  {
    name: "serviceType",
    label: "Tipe Layanan",
    type: "select",
    defaultValue: "PaymentGateway",
    options: [
      { label: "Payment Gateway", value: "PaymentGateway" },
      { label: "GDS", value: "GDS" },
      { label: "Hotel Aggregator", value: "HotelAggregator" },
      { label: "SMTP", value: "SMTP" },
      { label: "Storage/CDN", value: "Storage" },
      { label: "Lainnya", value: "Other" },
    ],
  },
  { name: "endPoint", label: "Endpoint", type: "text", required: true, colSpan: 2 },
  {
    name: "logActivity",
    label: "Catat Log Aktivitas",
    type: "checkbox",
    defaultValue: true,
  },
  {
    name: "isEnabled",
    label: "Aktif",
    type: "checkbox",
    defaultValue: true,
  },
  { name: "description", label: "Deskripsi", type: "textarea", colSpan: 2 },
]

export default function IntegrationPage() {
  return (
    <Suspense fallback={<CrudTableSkeleton />}>
      <IntegrationContent />
    </Suspense>
  )
}

async function IntegrationContent() {
  const session = await auth()
  if (session?.user?.role !== "admin") redirect("/signin")

  const rows = await db
    .select()
    .from(integrations)
    .orderBy(asc(integrations.name))

  return (
    <CrudManager
      tableId="integrations"
      title="Integrasi"
      description="Daftar koneksi layanan eksternal (payment, GDS, storage, dll)."
      addLabel="Tambah Integrasi"
      entityLabel="Integrasi"
      columns={columns}
      fields={fields}
      searchKeys={["name", "serviceType", "endPoint"]}
      initialRows={rows}
      createAction={createIntegrationAction}
      updateAction={updateIntegrationAction}
      deleteAction={deleteIntegrationAction}
    />
  )
}
