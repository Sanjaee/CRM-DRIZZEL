import { db } from "@/db"
import { activityLogs } from "@/db/schema"

type AuditInput = {
  userId?: string | null
  action: string
  resource: string
  resourceId?: string | null
  meta?: Record<string, unknown> | null
}

export async function writeAuditLog(input: AuditInput): Promise<void> {
  try {
    await db.insert(activityLogs).values({
      userId: input.userId ?? null,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId ?? null,
      meta: input.meta ? JSON.stringify(input.meta) : null,
    })
  } catch {
    // Audit logging must never break the main operation.
  }
}
