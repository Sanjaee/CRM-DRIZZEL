"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Edit,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react"

import { DynamicIcon } from "@/components/icon-helper"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AppMenu } from "@/db/schema"
import {
  createMenuAction,
  deleteMenuAction,
  resetMenusAction,
  updateMenuAction,
  type MenuInput,
} from "@/lib/menu-actions"

const GROUP_OPTIONS = [
  { title: "Bookings", icon: "ShoppingCart" },
  { title: "Products", icon: "Briefcase" },
  { title: "Campaigns", icon: "Tag" },
  { title: "Contents", icon: "Newspaper" },
  { title: "Master Data", icon: "Database" },
  { title: "Customer Management", icon: "Users" },
  { title: "User & Permissions", icon: "ShieldCheck" },
  { title: "Reports", icon: "FileText" },
  { title: "Tools", icon: "Wrench" },
  { title: "Settings", icon: "Settings" },
]

export function MenuManager({ initialMenus }: { initialMenus: AppMenu[] }) {
  const router = useRouter()
  const [deletedIds, setDeletedIds] = React.useState<string[]>([])
  const [optimisticUpdates, setOptimisticUpdates] = React.useState<
    Record<string, Partial<AppMenu>>
  >({})
  const [isPending, startTransition] = React.useTransition()
  const [search, setSearch] = React.useState("")
  const [filterGroup, setFilterGroup] = React.useState("all")
  const [filterRole, setFilterRole] = React.useState("all")
  const [submitting, setSubmitting] = React.useState(false)
  const loading = submitting || isPending

  // Derive menus from server initialMenus + optimistic updates
  const menus = React.useMemo(() => {
    return initialMenus
      .filter((m) => !deletedIds.includes(m.id))
      .map((m) =>
        optimisticUpdates[m.id] ? { ...m, ...optimisticUpdates[m.id] } : m
      )
  }, [initialMenus, deletedIds, optimisticUpdates])

  // Dialog State
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<AppMenu | null>(null)
  const [formData, setFormData] = React.useState<MenuInput>({
    groupTitle: "Bookings",
    groupIcon: "ShoppingCart",
    title: "",
    url: "/admin/",
    icon: "Folder",
    order: 1,
    roles: "admin,user",
    isActive: true,
  })

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({
      groupTitle: "Bookings",
      groupIcon: "ShoppingCart",
      title: "",
      url: "/admin/",
      icon: "Folder",
      order: 1,
      roles: "admin,user",
      isActive: true,
    })
    setDialogOpen(true)
  }

  const handleOpenEdit = (item: AppMenu) => {
    setEditingItem(item)
    setFormData({
      groupTitle: item.groupTitle,
      groupIcon: item.groupIcon,
      title: item.title,
      url: item.url,
      icon: item.icon ?? "Folder",
      order: item.order,
      roles: item.roles,
      isActive: item.isActive,
    })
    setDialogOpen(true)
  }

  const handleGroupSelect = (val: string | null) => {
    if (!val) return
    const matched = GROUP_OPTIONS.find((g) => g.title === val)
    setFormData((prev) => ({
      ...prev,
      groupTitle: val,
      groupIcon: matched?.icon ?? prev.groupIcon,
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingItem) {
        // Optimistic update
        setOptimisticUpdates((prev) => ({
          ...prev,
          [editingItem.id]: formData,
        }))
        setDialogOpen(false)
        await updateMenuAction(editingItem.id, formData)
      } else {
        // Create
        setDialogOpen(false)
        await createMenuAction(formData)
      }

      // Silent background revalidation
      startTransition(() => {
        router.refresh()
      })
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Terjadi kesalahan"
      alert(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus menu "${title}"?`)) return

    // Optimistic delete immediately
    setDeletedIds((prev) => [...prev, id])

    try {
      await deleteMenuAction(id)
      startTransition(() => {
        router.refresh()
      })
    } catch (err: unknown) {
      setDeletedIds((prev) => prev.filter((item) => item !== id))
      const errorMsg = err instanceof Error ? err.message : "Gagal menghapus"
      alert(errorMsg)
    }
  }

  const handleReset = async () => {
    if (
      !confirm(
        "Reset semua menu ke seed awal dari screenshot (33 tab & submenu)? Semua modifikasi manual akan dikembalikan ke default."
      )
    )
      return
    setSubmitting(true)
    try {
      await resetMenusAction()
      startTransition(() => {
        router.refresh()
      })
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Gagal mereset"
      alert(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  // Filtered menus
  const filteredMenus = menus.filter((item) => {
    if (filterGroup !== "all" && item.groupTitle !== filterGroup) return false
    if (filterRole !== "all") {
      const roles = item.roles.split(",").map((r) => r.trim().toLowerCase())
      if (!roles.includes("*") && !roles.includes(filterRole.toLowerCase())) {
        return false
      }
    }
    if (search.trim()) {
      const term = search.toLowerCase()
      return (
        item.title.toLowerCase().includes(term) ||
        item.groupTitle.toLowerCase().includes(term) ||
        item.url.toLowerCase().includes(term)
      )
    }
    return true
  })

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Kelola Menu & Tab (App Menu)
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Atur struktur tab sidebar, tautan URL, urutan, dan hak akses
            masing-masing role (Role-based visibility).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={loading}
            className="h-8 gap-1 text-xs"
          >
            <RefreshCw className="size-3.5" />
            Reset ke Menu Bawaan
          </Button>
          <Button
            size="sm"
            onClick={handleOpenAdd}
            disabled={loading}
            className="h-8 gap-1 text-xs bg-primary text-primary-foreground"
          >
            <Plus className="size-3.5" />
            Tambah Menu Baru
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan judul menu, grup, atau url..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={filterGroup} onValueChange={(val) => val && setFilterGroup(val)}>
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue placeholder="Pilih Grup" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Grup ({menus.length})</SelectItem>
              {GROUP_OPTIONS.map((g) => (
                <SelectItem key={g.title} value={g.title}>
                  {g.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterRole} onValueChange={(val) => val && setFilterRole(val)}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="Pilih Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Role</SelectItem>
              <SelectItem value="admin">Role: Admin</SelectItem>
              <SelectItem value="user">Role: User</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Menus Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">Urutan</TableHead>
              <TableHead className="w-48">Kategori / Grup</TableHead>
              <TableHead>Judul Menu / Tab</TableHead>
              <TableHead>URL Tujuan</TableHead>
              <TableHead className="w-40">Hak Akses (Roles)</TableHead>
              <TableHead className="w-24 text-center">Status</TableHead>
              <TableHead className="w-28 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMenus.map((item) => {
              const rolesList = item.roles.split(",").map((r) => r.trim())

              return (
                <TableRow key={item.id}>
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">
                    #{item.order}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium text-xs">
                      <DynamicIcon name={item.groupIcon} className="size-4 text-muted-foreground" />
                      <span>{item.groupTitle}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      <DynamicIcon name={item.icon} className="size-3.5 text-muted-foreground" />
                      <span>{item.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {item.url}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {rolesList.map((role) => (
                        <Badge
                          key={role}
                          variant={role === "admin" ? "destructive" : "secondary"}
                          className="px-1.5 py-0 text-[10px] uppercase font-mono"
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {item.isActive ? (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[10px]">
                        Aktif
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground text-[10px]">
                        Nonaktif
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                        className="size-7 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="size-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id, item.title)}
                        className="size-7 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">Hapus</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}

            {filteredMenus.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-xs text-muted-foreground">
                  Tidak ada menu ditemukan. Silakan tambahkan atau reset menu.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Dialog Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Menu / Tab" : "Tambah Menu / Tab Baru"}
            </DialogTitle>
            <DialogDescription>
              Atur properti menu sidebar beserta role yang diizinkan untuk melihatnya.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
            {/* Grup */}
            <div className="grid gap-1.5">
              <Label htmlFor="groupTitle" className="text-xs">
                Kategori / Grup Menu
              </Label>
              <Select value={formData.groupTitle} onValueChange={handleGroupSelect}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Pilih Grup" />
                </SelectTrigger>
                <SelectContent>
                  {GROUP_OPTIONS.map((g) => (
                    <SelectItem key={g.title} value={g.title}>
                      {g.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Judul Menu */}
            <div className="grid gap-1.5">
              <Label htmlFor="title" className="text-xs">
                Judul Menu / Submenu
              </Label>
              <Input
                id="title"
                required
                placeholder="Contoh: Booking Car, Sales Report..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            {/* URL */}
            <div className="grid gap-1.5">
              <Label htmlFor="url" className="text-xs">
                URL Tujuan
              </Label>
              <Input
                id="url"
                required
                placeholder="/admin/bookings/car"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Urutan */}
              <div className="grid gap-1.5">
                <Label htmlFor="order" className="text-xs">
                  Nomor Urut
                </Label>
                <Input
                  id="order"
                  type="number"
                  min={1}
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) || 1 })
                  }
                  className="h-8 text-xs"
                />
              </div>

              {/* Icon */}
              <div className="grid gap-1.5">
                <Label htmlFor="icon" className="text-xs">
                  Nama Icon (Lucide)
                </Label>
                <Input
                  id="icon"
                  placeholder="Car, Hotel, FileText..."
                  value={formData.icon ?? ""}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Hak Akses Roles */}
            <div className="grid gap-1.5">
              <Label htmlFor="roles" className="text-xs">
                Hak Akses Role (Pisahkan dengan koma)
              </Label>
              <Input
                id="roles"
                required
                placeholder="admin,user atau admin"
                value={formData.roles}
                onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
                className="h-8 text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Gunakan <code>admin</code> (khusus admin) atau <code>admin,user</code> (dapat dilihat semua pengguna).
              </p>
            </div>

            {/* Status Aktif */}
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: Boolean(checked) })
                }
              />
              <Label htmlFor="isActive" className="cursor-pointer text-xs">
                Status menu aktif (tampilkan di sidebar)
              </Label>
            </div>

            <DialogFooter className="mt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
