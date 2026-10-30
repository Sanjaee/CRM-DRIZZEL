"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/db"
import {
  adminUserRolePermissions,
  adminUserRoles,
  adminUserDepartments,
  users,
} from "@/db/schema"
import { ok, toActionResult } from "@/lib/action-result"
import { writeAuditLog } from "@/lib/audit"
import type { ActionResult, FormValues } from "@/lib/crud-types"
import { requirePermission } from "@/lib/permissions"

const ROLES_PATH = "/admin/user-permissions/admin-roles"
const USERS_PATH = "/admin/user-permissions/admin-users"
const DEPARTMENTS_PATH = "/admin/user-permissions/admin-departments"

const roleSchema = z.object({
  role: z.string().trim().min(1, "Nama role wajib diisi"),
  securityLevel: z.string().trim().min(1).default("Low"),
  scopeType: z.string().trim().min(1).default("Department"),
  description: z.string().trim().optional(),
})

const departmentSchema = z.object({
  code: z.string().trim().min(1, "Kode wajib diisi"),
  name: z.string().trim().min(1, "Nama wajib diisi"),
  description: z.string().trim().optional(),
  isActive: z.coerce.boolean().default(true),
})

const adminUserSchema = z.object({
  name: z.string().trim().optional(),
  adminUserRole: z.string().trim().optional(),
  adminUserDepartment: z.string().trim().optional(),
  isEnabled: z.coerce.boolean().default(true),
  isAdminUser: z.coerce.boolean().default(true),
})

export async function createRoleAction(
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("role.create")
    const data = roleSchema.parse(input)
    const [row] = await db
      .insert(adminUserRoles)
      .values({
        role: data.role,
        securityLevel: data.securityLevel,
        scopeType: data.scopeType,
        description: data.description || null,
      })
      .returning()
    await writeAuditLog({
      userId: user.id,
      action: "create",
      resource: "role",
      resourceId: row.id,
    })
    revalidatePath(ROLES_PATH)
    return ok(row, "Role berhasil ditambahkan.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function updateRoleAction(
  id: string,
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("role.update")
    const data = roleSchema.parse(input)
    await db
      .update(adminUserRoles)
      .set({
        role: data.role,
        securityLevel: data.securityLevel,
        scopeType: data.scopeType,
        description: data.description || null,
      })
      .where(eq(adminUserRoles.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "update",
      resource: "role",
      resourceId: id,
    })
    revalidatePath(ROLES_PATH)
    return ok(undefined, "Role berhasil diperbarui.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function deleteRoleAction(id: string): Promise<ActionResult> {
  try {
    const user = await requirePermission("role.delete")
    await db.delete(adminUserRoles).where(eq(adminUserRoles.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "delete",
      resource: "role",
      resourceId: id,
    })
    revalidatePath(ROLES_PATH)
    return ok(undefined, "Role berhasil dihapus.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function setRolePermissionsAction(
  roleId: string,
  codes: string[],
): Promise<ActionResult> {
  try {
    const user = await requirePermission("role.permission")
    await db
      .delete(adminUserRolePermissions)
      .where(eq(adminUserRolePermissions.roleId, roleId))
    if (codes.length > 0) {
      await db.insert(adminUserRolePermissions).values(
        codes.map((permissionCode) => ({ roleId, permissionCode })),
      )
    }
    await writeAuditLog({
      userId: user.id,
      action: "set-permissions",
      resource: "role",
      resourceId: roleId,
      meta: { count: codes.length },
    })
    revalidatePath(ROLES_PATH)
    return ok(undefined, "Izin role berhasil disimpan.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function createDepartmentAction(
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("department.create")
    const data = departmentSchema.parse(input)
    const [row] = await db
      .insert(adminUserDepartments)
      .values({
        code: data.code,
        name: data.name,
        description: data.description || null,
        isActive: data.isActive,
      })
      .returning()
    await writeAuditLog({
      userId: user.id,
      action: "create",
      resource: "department",
      resourceId: row.id,
    })
    revalidatePath(DEPARTMENTS_PATH)
    return ok(row, "Departemen berhasil ditambahkan.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function updateDepartmentAction(
  id: string,
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("department.update")
    const data = departmentSchema.parse(input)
    await db
      .update(adminUserDepartments)
      .set({
        code: data.code,
        name: data.name,
        description: data.description || null,
        isActive: data.isActive,
      })
      .where(eq(adminUserDepartments.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "update",
      resource: "department",
      resourceId: id,
    })
    revalidatePath(DEPARTMENTS_PATH)
    return ok(undefined, "Departemen berhasil diperbarui.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function deleteDepartmentAction(
  id: string,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("department.delete")
    await db.delete(adminUserDepartments).where(eq(adminUserDepartments.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "delete",
      resource: "department",
      resourceId: id,
    })
    revalidatePath(DEPARTMENTS_PATH)
    return ok(undefined, "Departemen berhasil dihapus.")
  } catch (error) {
    return toActionResult(error)
  }
}

export async function updateAdminUserAction(
  id: string,
  input: FormValues,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("admin_user.update")
    const data = adminUserSchema.parse(input)
    await db
      .update(users)
      .set({
        name: data.name || null,
        adminUserRole: data.adminUserRole || null,
        adminUserDepartment: data.adminUserDepartment || null,
        isEnabled: data.isEnabled,
        isAdminUser: data.isAdminUser,
      })
      .where(eq(users.id, id))
    await writeAuditLog({
      userId: user.id,
      action: "update",
      resource: "admin_user",
      resourceId: id,
    })
    revalidatePath(USERS_PATH)
    return ok(undefined, "Admin user berhasil diperbarui.")
  } catch (error) {
    return toActionResult(error)
  }
}
