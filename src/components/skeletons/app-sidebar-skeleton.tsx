import { Skeleton } from "@/components/ui/skeleton"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebarSkeleton() {
  return (
    <Sidebar variant="inset" collapsible="offcanvas" className="border-r bg-card">
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-lg" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        </div>
        <Skeleton className="mt-2 h-8 w-full" />
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        <SidebarMenu className="gap-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <SidebarMenuItem key={index}>
              <div className="flex items-center gap-2.5 px-3 py-2">
                <Skeleton className="size-4 rounded" />
                <Skeleton
                  className="h-3"
                  style={{ width: `${60 + ((index * 13) % 40)}%` }}
                />
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2.5 w-32" />
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-12" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}