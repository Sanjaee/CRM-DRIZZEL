import { Suspense } from "react"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { MenuManagerSkeleton } from "@/components/skeletons/menu-manager-skeleton"
import { getAllMenusList } from "@/lib/menu-actions"
import { MenuManager } from "./menu-manager"

export default function AppMenuPage() {
  return (
    <Suspense fallback={<MenuManagerSkeleton />}>
      <AppMenuContent />
    </Suspense>
  )
}

async function AppMenuContent() {
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") {
    redirect("/signin")
  }

  const allMenus = await getAllMenusList()

  return <MenuManager initialMenus={allMenus} />
}