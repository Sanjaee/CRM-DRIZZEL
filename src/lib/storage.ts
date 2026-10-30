import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

export const MAX_FILE_SIZE = 10 * 1024 * 1024

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
]

export type StoredFile = {
  fileName: string
  fileExt: string
  contentType: string
  absoluteUrl: string
  storageProvider: string
  fileSize: number
}

export async function storeLocalFile(file: File): Promise<StoredFile> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran file melebihi batas 10MB.")
  }
  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Tipe file tidak diizinkan (hanya gambar/PDF).")
  }

  const fileExt = file.name.includes(".")
    ? file.name.split(".").pop()!.toLowerCase()
    : "bin"
  const storedName = `${randomUUID()}.${fileExt}`
  const dir = join(process.cwd(), "public", "uploads")
  await mkdir(dir, { recursive: true })
  const bytes = Buffer.from(await file.arrayBuffer())
  await writeFile(join(dir, storedName), bytes)

  return {
    fileName: file.name,
    fileExt,
    contentType: file.type || "application/octet-stream",
    absoluteUrl: `/uploads/${storedName}`,
    storageProvider: "LocalDisk",
    fileSize: file.size,
  }
}
