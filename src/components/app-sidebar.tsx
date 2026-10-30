"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  ChevronDown,
  LogOut,
  Search,
  Shield,
  User as UserIcon,
} from "lucide-react"

import { DynamicIcon } from "@/components/icon-helper"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { MenuGroup } from "@/lib/menu-actions"

type UserProps = {
  name?: string | null
  email?: string | null
  role?: string | null
  image?: string | null
}

export function AppSidebar({
  user,
  menuGroups = [],
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: UserProps
  menuGroups?: MenuGroup[]
}) {
  const pathname = usePathname()
  const [search, setSearch] = React.useState("")
  const role = user?.role ?? "admin"

  // Track expanded groups
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({
    Bookings: true,
    Products: false,
    Campaigns: false,
    Contents: false,
    "Master Data": false,
    "Customer Management": false,
    "User & Permissions": false,
    Reports: false,
    Tools: false,
    Settings: true,
  })

  const toggleGroup = (groupTitle: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }))
  }

  // Filter groups according to active role and search
  const visibleGroups = React.useMemo(() => {
    return menuGroups
      .map((group) => {
        // Filter items by role
        const roleFilteredItems = group.items.filter((item) => {
          if (!item.isActive) return false
          if (role === "admin") return true
          const allowed = item.roles.split(",").map((r) => r.trim().toLowerCase())
          return allowed.includes("*") || allowed.includes(role.toLowerCase())
        })

        // Filter items by search
        const searchFilteredItems = roleFilteredItems.filter((item) => {
          if (!search.trim()) return true
          const term = search.toLowerCase()
          return (
            item.title.toLowerCase().includes(term) ||
            group.groupTitle.toLowerCase().includes(term)
          )
        })

        return {
          ...group,
          items: searchFilteredItems,
        }
      })
      .filter((group) => group.items.length > 0)
  }, [menuGroups, role, search])

  // Automatically expand groups if searching
  const isSearching = search.trim().length > 0

  return (
    <Sidebar collapsible="offcanvas" className="border-r bg-card" {...props}>
      <SidebarHeader className="border-b px-4 py-3">
        {/* Brand Header */}
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Wahana Admin
            </span>
            <span className="text-[11px] text-muted-foreground">
              Management Portal
            </span>
          </div>
        </div>

        {/* Search Menu Input matching image */}
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search Menu"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-muted/40 focus-visible:bg-background"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        <SidebarMenu className="gap-1">
          {visibleGroups.map((group) => {
            const isOpen = isSearching || Boolean(openGroups[group.groupTitle])

            return (
              <Collapsible
                key={group.groupTitle}
                open={isOpen}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    onClick={() => toggleGroup(group.groupTitle)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground/90 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <div className="flex items-center gap-2.5">
                      <DynamicIcon
                        name={group.groupIcon}
                        className="size-4.5 shrink-0 text-muted-foreground group-hover/collapsible:text-foreground"
                      />
                      <span className="text-xs font-semibold">
                        {group.groupTitle}
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-rose-500 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                        isOpen ? "rotate-0" : "-rotate-90"
                      )}
                    />
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="ml-5 flex flex-col border-l border-border/60 py-1 pl-3 gap-0.5">
                      {group.items.map((item) => {
                        const isActive = pathname === item.url

                        return (
                          <Link
                            key={item.id}
                            href={item.url}
                            className={`flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors ${
                              isActive
                                ? "bg-primary/10 font-semibold text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            <span className="truncate">{item.title}</span>
                            {item.roles !== "admin,user" &&
                              item.roles !== "*" && (
                                <span className="ml-1 rounded bg-muted px-1 text-[9px] font-mono text-muted-foreground">
                                  {item.roles}
                                </span>
                              )}
                          </Link>
                        )
                      })}
                    </div>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          })}

          {visibleGroups.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              Tidak ada menu yang sesuai dengan filter.
            </div>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-xs text-foreground">
              {user?.name?.[0]?.toUpperCase() ?? <UserIcon className="size-4" />}
            </div>
            <div className="flex flex-col truncate">
              <span className="truncate text-xs font-medium text-foreground">
                {user?.name ?? "Admin User"}
              </span>
              <span className="truncate text-[10px] text-muted-foreground">
                {user?.email ?? "admin@example.com"}
              </span>
            </div>
          </div>
          <Badge
            variant={role === "admin" ? "default" : "secondary"}
            className="text-[10px] uppercase font-mono px-1.5 py-0"
          >
            {role}
          </Badge>
        </div>

        <div className="mt-2 flex items-center justify-between pt-2 border-t border-border/40">
          <Link
            href="/admin/settings/app-menu"
            className="text-[11px] text-primary hover:underline font-medium"
          >
            Kelola Menu (CRUD)
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/signin" })}
            className="h-6 gap-1 px-1.5 text-[11px] text-muted-foreground hover:text-destructive"
          >
            <LogOut className="size-3" />
            Keluar
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
