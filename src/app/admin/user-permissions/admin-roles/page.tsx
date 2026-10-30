import { Suspense } from "react"
import { redirect } from "next/navigation"
import { asc } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/db"
import {
  adminUserRolePermissions,
  adminUserRoles,
  listOfUserPermissions,
} from "@/db/schema"
import { CrudTableSkeleton } from "@/components/skeletons/crud-table-skeleton"
import {
  createRoleAction,
  deleteRoleAction,
  setRolePermissionsAction,
  updateRoleAction,
} from "@/lib/user-permissions-actions"

import { RoleManager } from "./role-manager"

export default function AdminRolesPage() {
  return (
    <Suspense fallback={<CrudTableSkeleton />}>
      <AdminRolesContent />
    </Suspense>
  )
}

async function AdminRolesContent() {
  const session = await auth()
  if (session?.user?.role !== "admin") redirect("/signin")

  const [roles, permissions, mappings] = await Promise.all([
    db
      .select({
        id: adminUserRoles.id,
        role: adminUserRoles.role,
        securityLevel: adminUserRoles.securityLevel,
        scopeType: adminUserRoles.scopeType,
        description: adminUserRoles.description,
      })
      .from(adminUserRoles)
      .orderBy(asc(adminUserRoles.role)),
    db
      .select({
        code: listOfUserPermissions.code,
        name: listOfUserPermissions.name,
        module: listOfUserPermissions.module,
      })
      .from(listOfUserPermissions)
      .orderBy(asc(listOfUserPermissions.module), asc(listOfUserPermissions.name)),
    db
      .select({
        roleId: adminUserRolePermissions.roleId,
        code: adminUserRolePermissions.permissionCode,
      })
      .from(adminUserRolePermissions),
  ])

  const rolePermissionMap: Record<string, string[]> = {}
  for (const mapping of mappings) {
    rolePermissionMap[mapping.roleId] = [
      ...(rolePermissionMap[mapping.roleId] ?? []),
      mapping.code,
    ]
  }

  return (
    <RoleManager
      roles={roles}
      permissions={permissions}
      rolePermissionMap={rolePermissionMap}
      createAction={createRoleAction}
      updateAction={updateRoleAction}
      deleteAction={deleteRoleAction}
      setPermissionsAction={setRolePermissionsAction}
    />
  )
}
