import { Suspense } from "react"
import { redirect } from "next/navigation"
import { asc, desc, eq } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/db"
import { customerAgreementDocs, customers } from "@/db/schema"
import { CrudManager } from "@/components/crud/crud-manager"
import { CrudTableSkeleton } from "@/components/skeletons/crud-table-skeleton"
import type { ColumnDef, FieldDef } from "@/lib/crud-types"
import {
  createAgreementAction,
  deleteAgreementAction,
  updateAgreementAction,
} from "@/lib/customer-agreement-actions"

const columns: ColumnDef[] = [
  { key: "documentNo", header: "No. Dokumen", kind: "mono", className: "w-40" },
  { key: "title", header: "Judul" },
  { key: "customerName", header: "Customer" },
  { key: "startDate", header: "Mulai", kind: "date", className: "w-32" },
  { key: "endDate", header: "Berakhir", kind: "date", className: "w-32" },
  { key: "isActive", header: "Aktif", kind: "boolean", className: "w-20" },
]

export default function AgreementMonitoringPage() {
  return (
    <Suspense fallback={<CrudTableSkeleton />}>
      <AgreementMonitoringContent />
    </Suspense>
  )
}

async function AgreementMonitoringContent() {
  const session = await auth()
  if (session?.user?.role !== "admin") redirect("/signin")

  const [rows, customerRows] = await Promise.all([
    db
      .select({
        id: customerAgreementDocs.id,
        customerId: customerAgreementDocs.customerId,
        customerName: customers.name,
        documentNo: customerAgreementDocs.documentNo,
        title: customerAgreementDocs.title,
        startDate: customerAgreementDocs.startDate,
        endDate: customerAgreementDocs.endDate,
        fileUrl: customerAgreementDocs.fileUrl,
        isActive: customerAgreementDocs.isActive,
      })
      .from(customerAgreementDocs)
      .leftJoin(customers, eq(customerAgreementDocs.customerId, customers.id))
      .orderBy(desc(customerAgreementDocs.startDate)),
    db
      .select({ id: customers.id, name: customers.name })
      .from(customers)
      .orderBy(asc(customers.name)),
  ])

  const fields: FieldDef[] = [
    {
      name: "customerId",
      label: "Customer",
      type: "select",
      required: true,
      placeholder: "Pilih customer",
      options: customerRows.map((customer) => ({
        label: customer.name,
        value: customer.id,
      })),
    },
    { name: "documentNo", label: "Nomor Dokumen", type: "text", required: true },
    { name: "title", label: "Judul", type: "text", required: true, colSpan: 2 },
    { name: "startDate", label: "Mulai Berlaku", type: "date", required: true },
    { name: "endDate", label: "Berakhir", type: "date", required: true },
    {
      name: "fileUrl",
      label: "URL File (PDF)",
      type: "text",
      colSpan: 2,
      placeholder: "https://... atau /uploads/...",
    },
    {
      name: "isActive",
      label: "Agreement Aktif",
      type: "checkbox",
      defaultValue: true,
    },
  ]

  return (
    <CrudManager
      tableId="agreement-monitoring"
      title="Agreement Monitoring"
      description="Pantau seluruh dokumen perjanjian customer (aktif & historis)."
      addLabel="Tambah Agreement"
      entityLabel="Agreement"
      columns={columns}
      fields={fields}
      searchKeys={["documentNo", "title", "customerName"]}
      initialRows={rows}
      createAction={createAgreementAction}
      updateAction={updateAgreementAction}
      deleteAction={deleteAgreementAction}
    />
  )
}
