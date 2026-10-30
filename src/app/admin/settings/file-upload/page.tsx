import { Suspense } from "react"
import { redirect } from "next/navigation"
import { desc } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/db"
import { fileEntities } from "@/db/schema"
import { CrudTableSkeleton } from "@/components/skeletons/crud-table-skeleton"
import { deleteFileAction, uploadFileAction } from "@/lib/settings-actions"

import { FileUploadManager } from "./file-upload-manager"

export default function FileUploadPage() {
  return (
    <Suspense fallback={<CrudTableSkeleton />}>
      <FileUploadContent />
    </Suspense>
  )
}

async function FileUploadContent() {
  const session = await auth()
  if (session?.user?.role !== "admin") redirect("/signin")

  const rows = await db
    .select()
    .from(fileEntities)
    .orderBy(desc(fileEntities.createdAt))

  return (
    <FileUploadManager
      files={rows}
      uploadAction={uploadFileAction}
      deleteAction={deleteFileAction}
    />
  )
}
