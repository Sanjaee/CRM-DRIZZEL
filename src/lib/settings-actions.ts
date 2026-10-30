"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/db"
import { appSettings, fileEntities, integrations } from "@/db/schema"
import { fail, ok, toActionResult } from "@/lib/action-result"
import { writeAuditLog } from "@/lib/audit"
import type { ActionResult, FormValues } from "@/lib/crud-types"
import { requirePermission } from "@/lib/permissions"
import { storeLocalFile } from "@/lib/storage"

const APP_SETTING_PATH = "/admin/settings/app-setting"
const INTEGRATION_PATH = "/admin/settings/integration"
const FILE_PATH = "/admin/settings/file-upload"

const appSettingSchema = z.object({
  groupName: z.string().trim().min(1, "Grup wajib diisi"),
  name: z.string().trim().min(1, "Nama wajib diisi"),
  dataType: z.string().trim().min(1).default("String"),
  defaultValue: z.string().trim().optional(),
  description: z.string().trim().optional(),
})

const integrationSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi"),
  serviceType: z.string().trim().min(1, "Tipe layanan wajib diisi"),
  endPoint: z.string().trim().min(1, "Endpoint wajib diisi"),
  logActivity: z.coerce.boolean().default(true),
  isEnabled: z.coerce.boolean().default(true),
  description: z.string().trim().optional(),
})

export async function createAppSettingAction(
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("app_setting.create")
    const data = appSettingSchema.parse(input)
    const [row] = await db
      .insert(appSettings)
      .values({
        groupName: data.groupName,
        name: data.name,
        dataType: data.dataType,
        defaultValue: data.defaultValue || null,
        description: data.description || null,
      })
      .returning()
    await writeAuditLog({
      userId: user.id,
      action: "create",
      resource: "app_setting",
      resourceId: row.id,
    })
    revalidatePath(APP_SETTING_PATH)
    return ok(row, "App setting berhasil ditambahkan.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function updateAppSettingAction(
  id: string,
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("app_setting.update")
    const data = appSettingSchema.parse(input)
    await db
      .update(appSettings)
      .set({
        groupName: data.groupName,
        name: data.name,
        dataType: data.dataType,
        defaultValue: data.defaultValue || null,
        description: data.description || null,
      })
      .where(eq(appSettings.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "update",
      resource: "app_setting",
      resourceId: id,
    })
    revalidatePath(APP_SETTING_PATH)
    return ok(undefined, "App setting berhasil diperbarui.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function deleteAppSettingAction(
  id: string,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("app_setting.delete")
    await db.delete(appSettings).where(eq(appSettings.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "delete",
      resource: "app_setting",
      resourceId: id,
    })
    revalidatePath(APP_SETTING_PATH)
    return ok(undefined, "App setting berhasil dihapus.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function createIntegrationAction(
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("integration.create")
    const data = integrationSchema.parse(input)
    const [row] = await db
      .insert(integrations)
      .values({
        name: data.name,
        serviceType: data.serviceType,
        endPoint: data.endPoint,
        logActivity: data.logActivity,
        isEnabled: data.isEnabled,
        description: data.description || null,
      })
      .returning()
    await writeAuditLog({
      userId: user.id,
      action: "create",
      resource: "integration",
      resourceId: row.id,
    })
    revalidatePath(INTEGRATION_PATH)
    return ok(row, "Integrasi berhasil ditambahkan.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function updateIntegrationAction(
  id: string,
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("integration.update")
    const data = integrationSchema.parse(input)
    await db
      .update(integrations)
      .set({
        name: data.name,
        serviceType: data.serviceType,
        endPoint: data.endPoint,
        logActivity: data.logActivity,
        isEnabled: data.isEnabled,
        description: data.description || null,
      })
      .where(eq(integrations.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "update",
      resource: "integration",
      resourceId: id,
    })
    revalidatePath(INTEGRATION_PATH)
    return ok(undefined, "Integrasi berhasil diperbarui.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function deleteIntegrationAction(
  id: string,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("integration.delete")
    await db.delete(integrations).where(eq(integrations.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "delete",
      resource: "integration",
      resourceId: id,
    })
    revalidatePath(INTEGRATION_PATH)
    return ok(undefined, "Integrasi berhasil dihapus.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function uploadFileAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("file.create")
    const file = formData.get("file")
    if (!(file instanceof File) || file.size === 0) {
      return fail("Pilih file terlebih dahulu.")
    }

    const stored = await storeLocalFile(file)
    const [row] = await db
      .insert(fileEntities)
      .values({
        fileName: stored.fileName,
        contentType: stored.contentType,
        fileExt: stored.fileExt,
        fileSize: String(stored.fileSize),
        absoluteUrl: stored.absoluteUrl,
        storageProvider: stored.storageProvider,
        groupName: (formData.get("groupName") as string) || null,
        category: (formData.get("category") as string) || null,
      })
      .returning()

    await writeAuditLog({
      userId: user.id,
      action: "upload",
      resource: "file",
      resourceId: row.id,
      meta: { fileName: stored.fileName },
    })
    revalidatePath(FILE_PATH)
    return ok(row, "File berhasil diunggah.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function deleteFileAction(id: string): Promise<ActionResult> {
  try {
    const user = await requirePermission("file.delete")
    await db.delete(fileEntities).where(eq(fileEntities.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "delete",
      resource: "file",
      resourceId: id,
    })
    revalidatePath(FILE_PATH)
    return ok(undefined, "File berhasil dihapus.")
  } catch (error) {
    return toActionResult(error)
  }
}
