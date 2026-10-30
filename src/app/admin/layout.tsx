import { Suspense } from "react"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { AdminWorkspaceTabs } from "@/components/admin-workspace-tabs"
import { AppSidebar } from "@/components/app-sidebar"
import { NotificationBell } from "@/components/notification-bell"
import { SiteHeader } from "@/components/site-header"
import { AppSidebarSkeleton } from "@/components/skeletons/app-sidebar-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getAppMenus } from "@/lib/menu-actions"
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notification-actions"
import { getMyNotifications } from "@/lib/notifications"

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <Suspense fallback={<AppSidebarSkeleton />}>
        <AdminSidebar />
      </Suspense>
      <SidebarInset>
        <SiteHeader>
          <Suspense fallback={<Skeleton className="size-7 rounded-md" />}>
            <NotificationBellContainer />
          </Suspense>
        </SiteHeader>
        <Suspense fallback={<div className="h-9 w-full border-b bg-muted/20" />}>
          <AdminWorkspaceTabs />
        </Suspense>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

async function AdminSidebar() {
  const session = await auth()
  if (!session?.user) {
    redirect("/signin")
  }

  const menuGroups = await getAppMenus(session.user.role)

  return (
    <AppSidebar variant="inset" user={session.user} menuGroups={menuGroups} />
  )
}

async function NotificationBellContainer() {
  const notifications = await getMyNotifications()
  const unreadCount = notifications.filter((item) => !item.isRead).length

  return (
    <NotificationBell
      notifications={notifications}
      unreadCount={unreadCount}
      markReadAction={markNotificationReadAction}
      markAllReadAction={markAllNotificationsReadAction}
    />
  )
}
