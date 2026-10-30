"use server"

import { eq, asc } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { auth } from "@/auth"
import { db } from "@/db"
import { appMenus, type AppMenu } from "@/db/schema"
import { seedDefaultMenus } from "@/db/seed-menus"

const menuSchema = z.object({
  groupTitle: z.string().min(1, "Nama grup wajib diisi"),
  groupIcon: z.string().default("Folder"),
  title: z.string().min(1, "Judul menu wajib diisi"),
  url: z.string().default("#"),
  icon: z.string().optional(),
  order: z.number().int().default(1),
  roles: z.string().default("admin"),
  isActive: z.boolean().default(true),
})

export type MenuInput = z.infer<typeof menuSchema>

export type MenuGroup = {
  groupTitle: string
  groupIcon: string
  items: AppMenu[]
}

export async function getAppMenus(filterRole?: string): Promise<MenuGroup[]> {
  // Ensure default menus exist if table is fresh
  const existing = await db
    .select()
    .from(appMenus)
    .orderBy(asc(appMenus.groupTitle), asc(appMenus.order), asc(appMenus.title))

  if (existing.length === 0) {
    await seedDefaultMenus(false)
  }

  const allItems = existing.length > 0
    ? existing
    : await db
        .select()
        .from(appMenus)
        .orderBy(asc(appMenus.groupTitle), asc(appMenus.order), asc(appMenus.title))

  // Filter by active and role
  const filtered = allItems.filter((item) => {
    if (!item.isActive) return false
    if (!filterRole) return true
    if (filterRole === "admin") return true // Admin can see all

    const allowedRoles = item.roles.split(",").map((r) => r.trim().toLowerCase())
    return allowedRoles.includes("*") || allowedRoles.includes(filterRole.toLowerCase())
  })

  // Group by groupTitle preserving group order
  const groupMap = new Map<string, { groupIcon: string; items: AppMenu[] }>()

  for (const item of filtered) {
    if (!groupMap.has(item.groupTitle)) {
      groupMap.set(item.groupTitle, {
        groupIcon: item.groupIcon,
        items: [],
      })
    }
    groupMap.get(item.groupTitle)!.items.push(item)
  }

  const result: MenuGroup[] = []
  for (const [groupTitle, { groupIcon, items }] of groupMap.entries()) {
    result.push({
      groupTitle,
      groupIcon,
      items: items.sort((a, b) => a.order - b.order),
    })
  }

  return result
}

export async function getAllMenusList(): Promise<AppMenu[]> {
  return db
    .select()
    .from(appMenus)
    .orderBy(asc(appMenus.groupTitle), asc(appMenus.order), asc(appMenus.title))
}

export async function createMenuAction(input: MenuInput) {
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Hanya admin yang dapat mengelola menu.")
  }

  const validated = menuSchema.parse(input)

  await db.insert(appMenus).values({
    ...validated,
  })

  revalidatePath("/admin")
  revalidatePath("/admin/settings/app-menu")
  return { success: true }
}

export async function updateMenuAction(id: string, input: Partial<MenuInput>) {
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Hanya admin yang dapat mengelola menu.")
  }

  const validated = menuSchema.partial().parse(input)

  await db
    .update(appMenus)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(eq(appMenus.id, id))

  revalidatePath("/admin")
  revalidatePath("/admin/settings/app-menu")
  return { success: true }
}

export async function deleteMenuAction(id: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Hanya admin yang dapat mengelola menu.")
  }

  await db.delete(appMenus).where(eq(appMenus.id, id))

  revalidatePath("/admin")
  revalidatePath("/admin/settings/app-menu")
  return { success: true }
}

export async function resetMenusAction() {
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Hanya admin yang dapat mereset menu.")
  }

  await seedDefaultMenus(true)

  revalidatePath("/admin")
  revalidatePath("/admin/settings/app-menu")
  return { success: true }
}
