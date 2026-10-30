"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/crud/confirm-dialog"
import { CrudTable } from "@/components/crud/crud-table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ActionResult, ColumnDef, CrudRow } from "@/lib/crud-types"

const TABLE_ID = "customers"

const columns: ColumnDef[] = [
  { key: "customerNo", header: "No. Customer", kind: "mono", className: "w-40" },
  { key: "name", header: "Nama" },
  { key: "customerType", header: "Tipe", kind: "badge", className: "w-28" },
  { key: "groupName", header: "Grup" },
  { key: "creditLimit", header: "Credit Limit", kind: "mono", className: "w-32" },
  {
    key: "status",
    header: "Status",
    kind: "badge",
    className: "w-40",
    badgeVariants: {
      Active: "default",
      PendingVerification: "secondary",
      Suspended: "destructive",
      Inactive: "outline",
      Draft: "outline",
    },
  },
]

const STATUS_OPTIONS = [
  "all",
  "Active",
  "PendingVerification",
  "Suspended",
  "Inactive",
  "Draft",
]

export function CustomerManager({
  rows,
  deleteAction,
}: {
  rows: CrudRow[]
  deleteAction: (id: string) => Promise<ActionResult>
}) {
  const router = useRouter()
  const [status, setStatus] = React.useState("all")
  const [deleteTarget, setDeleteTarget] = React.useState<CrudRow | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const filtered = React.useMemo(() => {
    if (status === "all") return rows
    return rows.filter((row) => row.status === status)
  }, [rows, status])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const result = await deleteAction(String(deleteTarget.id))
      if (result.ok) {
        toast.success(result.message ?? "Customer dihapus")
        setDeleteTarget(null)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Customers
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Kelola customer B2B/B2C, kredit, deposit, dan dokumen.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/admin/customer-management/customers/new" />}
          className="h-8 gap-1 text-xs"
        >
          <Plus className="size-3.5" />
          Tambah Customer
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={status}
          onValueChange={(value) => value && setStatus(value)}
        >
          <SelectTrigger className="h-8 w-48 text-xs">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "all" ? "Semua Status" : option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <CrudTable
        tableId={TABLE_ID}
        columns={columns}
        rows={filtered}
        searchKeys={[
          "customerNo",
          "name",
          "alias",
          "emailAddress",
          "groupName",
        ]}
        searchPlaceholder="Cari customer..."
        detailHrefPrefix="/admin/customer-management/customers"
        onDelete={setDeleteTarget}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Hapus Customer"
        description="Customer beserta data terkait akan dihapus. Lanjutkan?"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
