"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import { db } from "@/db"
import { userNotifications } from "@/db/schema"
import { ok, toActionResult } from "@/lib/action-result"
import type { ActionResult } from "@/lib/crud-types"

export async function markNotificationReadAction(
  id: string,
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    await db
      .update(userNotifications)
      .set({ isRead: true, readDate: new Date() })
      .where(
        and(
          eq(userNotifications.id, id),
          eq(userNotifications.userId, session.user.id),
        ),
      )
    revalidatePath("/admin", "layout")
    return ok(undefined, "Notifikasi ditandai dibaca.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    await db
      .update(userNotifications)
      .set({ isRead: true, readDate: new Date() })
      .where(eq(userNotifications.userId, session.user.id))
    revalidatePath("/admin", "layout")
    return ok(undefined, "Semua notifikasi ditandai dibaca.")
  } catch (error) {
    return toActionResult(error)
  }
}
