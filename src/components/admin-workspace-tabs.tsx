"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  FolderKanban,
  LayoutDashboard,
  RefreshCw,
  Settings,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  useWorkspaceTabsStore,
  type WorkspaceTab,
} from "@/store/use-workspace-tabs-store"

const ROUTE_META: Record<string, { title: string; icon: string }> = {
  "/admin": { title: "Dashboard", icon: "LayoutDashboard" },
  "/admin/settings/app-menu": { title: "Kelola Menu", icon: "Settings" },
  "/admin/master-data": { title: "Master Data", icon: "FolderKanban" },
}

export function AdminWorkspaceTabs() {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const tabs = useWorkspaceTabsStore((s) => s.tabs)
  const openTab = useWorkspaceTabsStore((s) => s.openTab)
  const closeTabAction = useWorkspaceTabsStore((s) => s.closeTab)

  // Sync active route to external Zustand store
  React.useEffect(() => {
    if (!pathname.startsWith("/admin")) return

    const meta = ROUTE_META[pathname] ?? {
      title:
        pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") ?? "Page",
      icon: "FolderKanban",
    }

    const formattedTitle = meta.title
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")

    const newTab: WorkspaceTab = {
      id: pathname,
      title: formattedTitle,
      url: pathname,
      icon: meta.icon,
      closable: pathname !== "/admin",
    }

    openTab(newTab)
  }, [pathname, openTab])

  const handleClose = (e: React.MouseEvent, tabUrl: string) => {
    e.preventDefault()
    e.stopPropagation()

    const adjacentTab = closeTabAction(tabUrl)
    if (pathname === tabUrl && adjacentTab) {
      router.push(adjacentTab.url)
    }
  }

  // Background silent refresh without re-triggering Suspense skeleton
  const handleBackgroundRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="flex h-9 w-full items-center justify-between border-b bg-muted/30 px-3 text-xs select-none">
      {/* Scrollable Tab List */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
        {tabs.map((tab) => {
          const isActive = pathname === tab.url

          return (
            <Link
              key={tab.url}
              href={tab.url}
              className={cn(
                "group relative flex h-7 items-center gap-1.5 rounded-md px-2.5 font-medium transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]",
                isActive
                  ? "bg-background text-foreground shadow-xs border border-border/80 font-semibold"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {tab.url === "/admin" ? (
                <LayoutDashboard className="size-3.5 shrink-0 text-primary" />
              ) : tab.url.includes("menu") ? (
                <Settings className="size-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
              ) : (
                <FolderKanban className="size-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
              )}

              <span className="truncate max-w-[120px]">{tab.title}</span>

              {tab.closable && (
                <button
                  type="button"
                  onClick={(e) => handleClose(e, tab.url)}
                  title="Tutup tab"
                  className={cn(
                    "ml-1 flex size-3.5 items-center justify-center rounded-sm transition-colors hover:bg-destructive/15 hover:text-destructive",
                    isActive
                      ? "opacity-60 hover:opacity-100"
                      : "opacity-0 group-hover:opacity-60 hover:!opacity-100"
                  )}
                >
                  <X className="size-2.5" />
                </button>
              )}
            </Link>
          )
        })}
      </div>

      {/* Background Silent Refresh Button */}
      <div className="flex items-center gap-1.5 pl-2">
        <button
          type="button"
          onClick={handleBackgroundRefresh}
          disabled={isPending}
          title="Segarkan data di background (tanpa loading)"
          className="flex h-6 items-center gap-1 rounded px-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95 disabled:opacity-50"
        >
          <RefreshCw
            className={cn("size-3", isPending && "animate-spin text-primary")}
          />
          <span className="hidden sm:inline">
            {isPending ? "Menyinkronkan..." : "Sinkron"}
          </span>
        </button>
      </div>
    </div>
  )
}
