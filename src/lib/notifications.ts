import { desc, eq } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/db"
import { userNotifications } from "@/db/schema"

export type MyNotification = {
  id: string
  header: string
  message: string
  isRead: boolean | null
  createdDate: Date | null
}

export async function getMyNotifications(
  limit = 10,
): Promise<MyNotification[]> {
  const session = await auth()
  if (!session?.user) return []

  return db
    .select({
      id: userNotifications.id,
      header: userNotifications.header,
      message: userNotifications.message,
      isRead: userNotifications.isRead,
      createdDate: userNotifications.createdDate,
    })
    .from(userNotifications)
    .where(eq(userNotifications.userId, session.user.id))
    .orderBy(desc(userNotifications.createdDate))
    .limit(limit)
}
