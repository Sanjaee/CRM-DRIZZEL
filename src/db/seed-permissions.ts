import { eq } from "drizzle-orm"

import { db } from "./index"
import {
  adminUserRolePermissions,
  adminUserRoles,
  listOfUserPermissions,
} from "./schema"

export const ADMIN_ROLE_NAME = "admin"

export const PERMISSION_CATALOG: {
  code: string
  name: string
  module: string
}[] = [
  { code: "airline.read", name: "Lihat Maskapai", module: "Master Data" },
  { code: "airline.create", name: "Tambah Maskapai", module: "Master Data" },
  { code: "airline.update", name: "Ubah Maskapai", module: "Master Data" },
  { code: "airline.delete", name: "Hapus Maskapai", module: "Master Data" },
  { code: "airport.read", name: "Lihat Bandara", module: "Master Data" },
  { code: "airport.create", name: "Tambah Bandara", module: "Master Data" },
  { code: "airport.update", name: "Ubah Bandara", module: "Master Data" },
  { code: "airport.delete", name: "Hapus Bandara", module: "Master Data" },
  { code: "app_setting.read", name: "Lihat App Setting", module: "Settings" },
  { code: "app_setting.create", name: "Tambah App Setting", module: "Settings" },
  { code: "app_setting.update", name: "Ubah App Setting", module: "Settings" },
  { code: "app_setting.delete", name: "Hapus App Setting", module: "Settings" },
  { code: "integration.read", name: "Lihat Integrasi", module: "Settings" },
  { code: "integration.create", name: "Tambah Integrasi", module: "Settings" },
  { code: "integration.update", name: "Ubah Integrasi", module: "Settings" },
  { code: "integration.delete", name: "Hapus Integrasi", module: "Settings" },
  { code: "file.read", name: "Lihat File", module: "Settings" },
  { code: "file.create", name: "Unggah File", module: "Settings" },
  { code: "file.delete", name: "Hapus File", module: "Settings" },
  { code: "role.read", name: "Lihat Role", module: "User & Permissions" },
  { code: "role.create", name: "Tambah Role", module: "User & Permissions" },
  { code: "role.update", name: "Ubah Role", module: "User & Permissions" },
  { code: "role.delete", name: "Hapus Role", module: "User & Permissions" },
  {
    code: "role.permission",
    name: "Atur Izin Role",
    module: "User & Permissions",
  },
  { code: "admin_user.read", name: "Lihat Admin User", module: "User & Permissions" },
  {
    code: "admin_user.update",
    name: "Ubah Admin User",
    module: "User & Permissions",
  },
  {
    code: "department.read",
    name: "Lihat Departemen",
    module: "User & Permissions",
  },
  {
    code: "department.create",
    name: "Tambah Departemen",
    module: "User & Permissions",
  },
  {
    code: "department.update",
    name: "Ubah Departemen",
    module: "User & Permissions",
  },
  {
    code: "department.delete",
    name: "Hapus Departemen",
    module: "User & Permissions",
  },
  { code: "notification.read", name: "Lihat Notifikasi", module: "User & Permissions" },
  { code: "customer.read", name: "Lihat Customer", module: "Customer Management" },
  { code: "customer.create", name: "Tambah Customer", module: "Customer Management" },
  { code: "customer.update", name: "Ubah Customer", module: "Customer Management" },
  { code: "customer.delete", name: "Hapus Customer", module: "Customer Management" },
  { code: "customer.status", name: "Ubah Status Customer", module: "Customer Management" },
  { code: "customer_credit.read", name: "Lihat Credit/Deposit", module: "Customer Management" },
  { code: "customer_credit.update", name: "Ubah Credit/Deposit", module: "Customer Management" },
  { code: "customer_credit.overuse", name: "Beri Over-Use Kredit", module: "Customer Management" },
  { code: "customer_pic.read", name: "Lihat PIC Customer", module: "Customer Management" },
  { code: "customer_pic.create", name: "Tambah PIC Customer", module: "Customer Management" },
  { code: "customer_pic.update", name: "Ubah PIC Customer", module: "Customer Management" },
  { code: "customer_pic.delete", name: "Hapus PIC Customer", module: "Customer Management" },
  { code: "customer_group.read", name: "Lihat Grup Customer", module: "Customer Management" },
  { code: "customer_group.create", name: "Tambah Grup Customer", module: "Customer Management" },
  { code: "customer_group.update", name: "Ubah Grup Customer", module: "Customer Management" },
  { code: "customer_group.delete", name: "Hapus Grup Customer", module: "Customer Management" },
  { code: "customer_label.read", name: "Lihat Label Customer", module: "Customer Management" },
  { code: "customer_label.create", name: "Tambah Label Customer", module: "Customer Management" },
  { code: "customer_label.update", name: "Ubah Label Customer", module: "Customer Management" },
  { code: "customer_label.delete", name: "Hapus Label Customer", module: "Customer Management" },
  { code: "customer_rule.read", name: "Lihat Rule Customer", module: "Customer Management" },
  { code: "customer_rule.create", name: "Tambah Rule Customer", module: "Customer Management" },
  { code: "customer_rule.update", name: "Ubah Rule Customer", module: "Customer Management" },
  { code: "customer_rule.delete", name: "Hapus Rule Customer", module: "Customer Management" },
  { code: "agreement.read", name: "Lihat Agreement", module: "Customer Management" },
  { code: "agreement.create", name: "Tambah Agreement", module: "Customer Management" },
  { code: "agreement.update", name: "Ubah Agreement", module: "Customer Management" },
  { code: "agreement.delete", name: "Hapus Agreement", module: "Customer Management" },
  { code: "refund_account.read", name: "Lihat Rekening Refund", module: "Customer Management" },
  { code: "refund_account.create", name: "Tambah Rekening Refund", module: "Customer Management" },
  { code: "refund_account.update", name: "Ubah Rekening Refund", module: "Customer Management" },
  { code: "refund_account.delete", name: "Hapus Rekening Refund", module: "Customer Management" },
  { code: "web_user.read", name: "Lihat Web User", module: "Customer Management" },
  { code: "web_user.update", name: "Ubah Web User", module: "Customer Management" },
]

export async function seedPermissions() {
  for (const permission of PERMISSION_CATALOG) {
    await db
      .insert(listOfUserPermissions)
      .values({
        code: permission.code,
        name: permission.name,
        module: permission.module,
      })
      .onConflictDoUpdate({
        target: listOfUserPermissions.code,
        set: { name: permission.name, module: permission.module },
      })
  }

  let [role] = await db
    .select()
    .from(adminUserRoles)
    .where(eq(adminUserRoles.role, ADMIN_ROLE_NAME))
    .limit(1)

  if (!role) {
    ;[role] = await db
      .insert(adminUserRoles)
      .values({
        role: ADMIN_ROLE_NAME,
        securityLevel: "Critical",
        scopeType: "Global",
        description: "Akses penuh ke seluruh modul.",
      })
      .returning()
  }

  const existing = await db
    .select({ code: adminUserRolePermissions.permissionCode })
    .from(adminUserRolePermissions)
    .where(eq(adminUserRolePermissions.roleId, role.id))
  const existingCodes = new Set(existing.map((row) => row.code))

  const toInsert = PERMISSION_CATALOG.filter(
    (permission) => !existingCodes.has(permission.code),
  ).map((permission) => ({
    roleId: role.id,
    permissionCode: permission.code,
  }))

  if (toInsert.length > 0) {
    await db.insert(adminUserRolePermissions).values(toInsert)
  }

  return {
    permissions: PERMISSION_CATALOG.length,
    roleId: role.id,
    granted: toInsert.length,
  }
}
