"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/db"
import { users } from "@/db/schema"
import { ok, toActionResult } from "@/lib/action-result"
import { writeAuditLog } from "@/lib/audit"
import type { ActionResult, FormValues } from "@/lib/crud-types"
import { requirePermission } from "@/lib/permissions"
import { optionalText } from "@/lib/zod-helpers"

const USERS_PATH = "/admin/customer-management/web-users"

const webUserSchema = z.object({
  name: optionalText,
  isEnabled: z.coerce.boolean().default(true),
})

export async function updateWebUserAction(
  id: string,
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("web_user.update")
    const data = webUserSchema.parse(input)
    await db
      .update(users)
      .set({ name: data.name || null, isEnabled: data.isEnabled })
      .where(eq(users.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "update",
      resource: "web_user",
      resourceId: id,
    })
    revalidatePath(USERS_PATH)
    return ok(undefined, "Web user berhasil diperbarui.")
  } catch (error) {
    return toActionResult(error)
  }
}
