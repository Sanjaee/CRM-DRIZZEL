"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Trash2, Upload } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/crud/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ActionResult } from "@/lib/crud-types"

type FileRow = {
  id: string
  fileName: string
  contentType: string | null
  fileExt: string | null
  fileSize: string | null
  absoluteUrl: string
  groupName: string | null
  storageProvider: string | null
}

type FileUploadManagerProps = {
  files: FileRow[]
  uploadAction: (formData: FormData) => Promise<ActionResult>
  deleteAction: (id: string) => Promise<ActionResult>
}

function formatSize(size: string | null): string {
  if (!size) return "-"
  const bytes = Number(size)
  if (Number.isNaN(bytes)) return "-"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUploadManager({
  files,
  uploadAction,
  deleteAction,
}: FileUploadManagerProps) {
  const router = useRouter()
  const [file, setFile] = React.useState<File | null>(null)
  const [groupName, setGroupName] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [uploading, setUploading] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<FileRow | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!file) {
      toast.error("Pilih file terlebih dahulu.")
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.set("file", file)
      formData.set("groupName", groupName)
      formData.set("category", category)
      const result = await uploadAction(formData)
      if (result.ok) {
        toast.success(result.message ?? "File terunggah")
        setFile(null)
        setGroupName("")
        setCategory("")
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const result = await deleteAction(deleteTarget.id)
      if (result.ok) {
        toast.success(result.message ?? "File dihapus")
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
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          File Upload
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Unggah dan kelola file (gambar/PDF). Storage default: Local Disk.
        </p>
      </div>

      <form
        onSubmit={handleUpload}
        className="flex flex-col gap-4 rounded-lg border bg-card p-4"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              onChange={(event) =>
                setFile(event.target.files?.[0] ?? null)
              }
              className="h-8 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="groupName">Grup</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              placeholder="mis. banner, product"
              className="h-8 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Kategori</Label>
            <Input
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="mis. image"
              className="h-8 text-xs"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={uploading} className="h-8 gap-1 text-xs">
            <Upload className="size-3.5" />
            {uploading ? "Mengunggah..." : "Unggah"}
          </Button>
        </div>
      </form>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama File</TableHead>
              <TableHead className="w-28">Tipe</TableHead>
              <TableHead className="w-24">Ukuran</TableHead>
              <TableHead className="w-32">Grup</TableHead>
              <TableHead className="w-24 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Belum ada file.
                </TableCell>
              </TableRow>
            ) : (
              files.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <a
                      href={item.absoluteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {item.fileName}
                    </a>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.contentType ?? "-"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatSize(item.fileSize)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.groupName ?? "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(item)}
                      className="size-7 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Hapus File"
        description="File akan dihapus dari daftar. Lanjutkan?"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
