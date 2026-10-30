import { eq } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/db"
import {
  adminUserRolePermissions,
  adminUserRoles,
  users,
} from "@/db/schema"

export const ALL_PERMISSIONS = "*"

export async function getUserPermissions(userId: string): Promise<string[]> {
  const [user] = await db
    .select({ adminRole: users.adminUserRole, coarseRole: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) return []

  if (user.adminRole) {
    const rows = await db
      .select({ code: adminUserRolePermissions.permissionCode })
      .from(adminUserRolePermissions)
      .innerJoin(
        adminUserRoles,
        eq(adminUserRolePermissions.roleId, adminUserRoles.id),
      )
      .where(eq(adminUserRoles.role, user.adminRole))
    return rows.map((row) => row.code)
  }

  return user.coarseRole === "admin" ? [ALL_PERMISSIONS] : []
}

export async function requirePermission(code: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized: anda belum masuk.")
  }

  const permissions = await getUserPermissions(session.user.id)
  if (
    permissions.includes(ALL_PERMISSIONS) ||
    permissions.includes(code)
  ) {
    return session.user
  }

  throw new Error("Forbidden: anda tidak memiliki izin untuk aksi ini.")
}
