"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "./confirm-dialog"
import { CrudTable } from "./crud-table"
import { FormFields } from "./form-fields"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type {
  ActionResult,
  ColumnDef,
  CrudRow,
  FieldDef,
  FormValues,
} from "@/lib/crud-types"

type CrudManagerProps = {
  tableId: string
  title: string
  description?: string
  addLabel?: string
  entityLabel: string
  columns: ColumnDef[]
  fields: FieldDef[]
  searchKeys: string[]
  initialRows: CrudRow[]
  detailHrefPrefix?: string
  backHref?: string
  backLabel?: string
  createAction?: (input: FormValues) => Promise<ActionResult>
  updateAction: (id: string, input: FormValues) => Promise<ActionResult>
  deleteAction?: (id: string) => Promise<ActionResult>
}

function buildDefaults(fields: FieldDef[], row?: CrudRow): FormValues {
  const values: FormValues = {}
  for (const field of fields) {
    const current = row?.[field.name]
    if (current !== undefined && current !== null) {
      values[field.name] = current
    } else if (field.defaultValue !== undefined) {
      values[field.name] = field.defaultValue
    } else {
      values[field.name] = field.type === "checkbox" ? false : ""
    }
  }
  return values
}

function toPayload(fields: FieldDef[], values: FormValues): FormValues {
  const payload: FormValues = {}
  for (const field of fields) {
    const raw = values[field.name]
    payload[field.name] =
      field.type === "checkbox" ? Boolean(raw) : (raw ?? "")
  }
  return payload
}

export function CrudManager({
  tableId,
  title,
  description,
  addLabel = "Tambah",
  entityLabel,
  columns,
  fields,
  searchKeys,
  initialRows,
  detailHrefPrefix,
  backHref,
  backLabel = "Kembali",
  createAction,
  updateAction,
  deleteAction,
}: CrudManagerProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingRow, setEditingRow] = React.useState<CrudRow | null>(null)
  const [values, setValues] = React.useState<FormValues>(() =>
    buildDefaults(fields),
  )
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[]>
  >({})
  const [submitting, setSubmitting] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<CrudRow | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const openCreate = () => {
    setEditingRow(null)
    setValues(buildDefaults(fields))
    setFieldErrors({})
    setDialogOpen(true)
  }

  const openEdit = (row: CrudRow) => {
    setEditingRow(row)
    setValues(buildDefaults(fields, row))
    setFieldErrors({})
    setDialogOpen(true)
  }

  const handleChange = (name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setFieldErrors({})
    try {
      const payload = toPayload(fields, values)
      const result: ActionResult = editingRow
        ? await updateAction(String(editingRow.id), payload)
        : createAction
          ? await createAction(payload)
          : { ok: false, message: "Aksi tidak tersedia." }

      if (result.ok) {
        toast.success(result.message ?? "Berhasil disimpan")
        setDialogOpen(false)
        router.refresh()
      } else {
        setFieldErrors(result.fieldErrors ?? {})
        toast.error(result.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !deleteAction) return
    setDeleting(true)
    try {
      const result = await deleteAction(String(deleteTarget.id))
      if (result.ok) {
        toast.success(result.message ?? "Berhasil dihapus")
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
          {backHref ? (
            <Link
              href={backHref}
              className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              {backLabel}
            </Link>
          ) : null}
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          {description ? (
            <p className="text-xs text-muted-foreground sm:text-sm">
              {description}
            </p>
          ) : null}
        </div>
        {createAction ? (
          <Button onClick={openCreate} className="h-8 gap-1 text-xs">
            <Plus className="size-3.5" />
            {addLabel}
          </Button>
        ) : null}
      </div>

      <CrudTable
        tableId={tableId}
        columns={columns}
        rows={initialRows}
        searchKeys={searchKeys}
        searchPlaceholder={`Cari ${entityLabel.toLowerCase()}...`}
        detailHrefPrefix={detailHrefPrefix}
        onEdit={openEdit}
        onDelete={deleteAction ? setDeleteTarget : undefined}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>
                {editingRow ? `Ubah ${entityLabel}` : `Tambah ${entityLabel}`}
              </DialogTitle>
              <DialogDescription>
                Lengkapi data di bawah lalu simpan.
              </DialogDescription>
            </DialogHeader>

            <FormFields
              fields={fields}
              values={values}
              errors={fieldErrors}
              onChange={handleChange}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title={`Hapus ${entityLabel}`}
        description="Yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
