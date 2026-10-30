import { Suspense } from "react"
import { redirect } from "next/navigation"
import { asc } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/db"
import { appSettings } from "@/db/schema"
import { CrudManager } from "@/components/crud/crud-manager"
import { CrudTableSkeleton } from "@/components/skeletons/crud-table-skeleton"
import type { ColumnDef, FieldDef } from "@/lib/crud-types"
import {
  createAppSettingAction,
  deleteAppSettingAction,
  updateAppSettingAction,
} from "@/lib/settings-actions"

const columns: ColumnDef[] = [
  { key: "groupName", header: "Grup" },
  { key: "name", header: "Nama", kind: "mono" },
  { key: "dataType", header: "Tipe", kind: "badge", className: "w-24" },
  { key: "defaultValue", header: "Nilai Default" },
  { key: "description", header: "Deskripsi" },
]

const fields: FieldDef[] = [
  { name: "groupName", label: "Grup", type: "text", required: true },
  { name: "name", label: "Nama Setting", type: "text", required: true },
  {
    name: "dataType",
    label: "Tipe Data",
    type: "select",
    defaultValue: "String",
    options: [
      { label: "String", value: "String" },
      { label: "Number", value: "Number" },
      { label: "Boolean", value: "Boolean" },
      { label: "JSON", value: "JSON" },
    ],
  },
  { name: "defaultValue", label: "Nilai Default", type: "text" },
  { name: "description", label: "Deskripsi", type: "textarea", colSpan: 2 },
]

export default function AppSettingPage() {
  return (
    <Suspense fallback={<CrudTableSkeleton />}>
      <AppSettingContent />
    </Suspense>
  )
}

async function AppSettingContent() {
  const session = await auth()
  if (session?.user?.role !== "admin") redirect("/signin")

  const rows = await db
    .select()
    .from(appSettings)
    .orderBy(asc(appSettings.groupName), asc(appSettings.name))

  return (
    <CrudManager
      tableId="app-settings"
      title="App Setting"
      description="Konfigurasi aplikasi berbasis key-value."
      addLabel="Tambah Setting"
      entityLabel="App Setting"
      columns={columns}
      fields={fields}
      searchKeys={["groupName", "name", "dataType"]}
      initialRows={rows}
      createAction={createAppSettingAction}
      updateAction={updateAppSettingAction}
      deleteAction={deleteAppSettingAction}
    />
  )
}
