"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Pencil, Plus, Search, ShieldCheck, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/crud/confirm-dialog"
import { FormFields } from "@/components/crud/form-fields"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ActionResult, FieldDef, FormValues } from "@/lib/crud-types"
import { useTableUiStore } from "@/store/use-table-ui-store"

type RoleRow = {
  id: string
  role: string
  securityLevel: string | null
  scopeType: string | null
  description: string | null
}

type PermissionItem = {
  code: string
  name: string
  module: string | null
}

type RoleManagerProps = {
  roles: RoleRow[]
  permissions: PermissionItem[]
  rolePermissionMap: Record<string, string[]>
  createAction: (input: FormValues) => Promise<ActionResult>
  updateAction: (id: string, input: FormValues) => Promise<ActionResult>
  deleteAction: (id: string) => Promise<ActionResult>
  setPermissionsAction: (
    roleId: string,
    codes: string[],
  ) => Promise<ActionResult>
}

const roleFields: FieldDef[] = [
  { name: "role", label: "Nama Role", type: "text", required: true },
  {
    name: "securityLevel",
    label: "Security Level",
    type: "select",
    defaultValue: "Low",
    options: [
      { label: "Low", value: "Low" },
      { label: "Medium", value: "Medium" },
      { label: "High", value: "High" },
      { label: "Critical", value: "Critical" },
    ],
  },
  {
    name: "scopeType",
    label: "Scope",
    type: "select",
    defaultValue: "Department",
    options: [
      { label: "Department", value: "Department" },
      { label: "Organization", value: "Organization" },
      { label: "Global", value: "Global" },
    ],
  },
  { name: "description", label: "Deskripsi", type: "textarea", colSpan: 2 },
]

const TABLE_ID = "admin-roles"

export function RoleManager({
  roles,
  permissions,
  rolePermissionMap,
  createAction,
  updateAction,
  deleteAction,
  setPermissionsAction,
}: RoleManagerProps) {
  const router = useRouter()
  const search = useTableUiStore((state) => state.tables[TABLE_ID]?.search ?? "")
  const setSearch = useTableUiStore((state) => state.setSearch)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingRole, setEditingRole] = React.useState<RoleRow | null>(null)
  const [values, setValues] = React.useState<FormValues>({})
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[]>
  >({})
  const [submitting, setSubmitting] = React.useState(false)

  const [deleteTarget, setDeleteTarget] = React.useState<RoleRow | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const [permissionRole, setPermissionRole] = React.useState<RoleRow | null>(
    null,
  )
  const [selected, setSelected] = React.useState<string[]>([])
  const [savingPermissions, setSavingPermissions] = React.useState(false)

  const groupedPermissions = React.useMemo(() => {
    const groups = new Map<string, PermissionItem[]>()
    for (const permission of permissions) {
      const key = permission.module ?? "Lainnya"
      groups.set(key, [...(groups.get(key) ?? []), permission])
    }
    return Array.from(groups.entries())
  }, [permissions])

  const filteredRoles = React.useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return roles
    return roles.filter(
      (role) =>
        role.role.toLowerCase().includes(term) ||
        (role.description ?? "").toLowerCase().includes(term),
    )
  }, [roles, search])

  const openCreate = () => {
    setEditingRole(null)
    setValues({
      role: "",
      securityLevel: "Low",
      scopeType: "Department",
      description: "",
    })
    setFieldErrors({})
    setFormOpen(true)
  }

  const openEdit = (role: RoleRow) => {
    setEditingRole(role)
    setValues({
      role: role.role,
      securityLevel: role.securityLevel ?? "Low",
      scopeType: role.scopeType ?? "Department",
      description: role.description ?? "",
    })
    setFieldErrors({})
    setFormOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setFieldErrors({})
    try {
      const result = editingRole
        ? await updateAction(editingRole.id, values)
        : await createAction(values)
      if (result.ok) {
        toast.success(result.message ?? "Role disimpan")
        setFormOpen(false)
        router.refresh()
      } else {
        setFieldErrors(result.fieldErrors ?? {})
        toast.error(result.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const result = await deleteAction(deleteTarget.id)
      if (result.ok) {
        toast.success(result.message ?? "Role dihapus")
        setDeleteTarget(null)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } finally {
      setDeleting(false)
    }
  }

  const openPermissions = (role: RoleRow) => {
    setPermissionRole(role)
    setSelected(rolePermissionMap[role.id] ?? [])
  }

  const togglePermission = (code: string, checked: boolean) => {
    setSelected((prev) =>
      checked ? [...new Set([...prev, code])] : prev.filter((c) => c !== code),
    )
  }

  const handleSavePermissions = async () => {
    if (!permissionRole) return
    setSavingPermissions(true)
    try {
      const result = await setPermissionsAction(permissionRole.id, selected)
      if (result.ok) {
        toast.success(result.message ?? "Izin disimpan")
        setPermissionRole(null)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } finally {
      setSavingPermissions(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Admin Roles & Izin
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Kelola role dan matriks izin akses per modul.
          </p>
        </div>
        <Button onClick={openCreate} className="h-8 gap-1 text-xs">
          <Plus className="size-3.5" />
          Tambah Role
        </Button>
      </div>

      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari role..."
          value={search}
          onChange={(event) => setSearch(TABLE_ID, event.target.value)}
          className="h-8 pl-8 text-xs"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead className="w-28">Level</TableHead>
              <TableHead className="w-32">Scope</TableHead>
              <TableHead className="w-28">Jumlah Izin</TableHead>
              <TableHead className="w-40 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Belum ada role.
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.role}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">
                      {role.securityLevel ?? "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {role.scopeType ?? "-"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {(rolePermissionMap[role.id] ?? []).length} izin
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openPermissions(role)}
                        className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        <ShieldCheck className="size-3.5" />
                        Izin
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(role)}
                        className="size-7 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(role)}
                        className="size-7 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>
                {editingRole ? "Ubah Role" : "Tambah Role"}
              </DialogTitle>
              <DialogDescription>
                Tentukan nama dan level keamanan role.
              </DialogDescription>
            </DialogHeader>
            <FormFields
              fields={roleFields}
              values={values}
              errors={fieldErrors}
              onChange={(name, value) =>
                setValues((prev) => ({ ...prev, [name]: value }))
              }
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
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

      <Dialog
        open={Boolean(permissionRole)}
        onOpenChange={(open) => {
          if (!open) setPermissionRole(null)
        }}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Izin untuk role: {permissionRole?.role}</DialogTitle>
            <DialogDescription>
              Centang izin yang dimiliki role ini.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {groupedPermissions.map(([module, items]) => (
              <div key={module} className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {module}
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {items.map((permission) => (
                    <label
                      key={permission.code}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={selected.includes(permission.code)}
                        onCheckedChange={(checked) =>
                          togglePermission(permission.code, Boolean(checked))
                        }
                      />
                      <span>{permission.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPermissionRole(null)}
              disabled={savingPermissions}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSavePermissions}
              disabled={savingPermissions}
            >
              {savingPermissions ? "Menyimpan..." : "Simpan Izin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Hapus Role"
        description="Role beserta izinnya akan dihapus. Lanjutkan?"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
