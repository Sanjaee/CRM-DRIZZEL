import { create } from "zustand"
import { persist } from "zustand/middleware"

export type WorkspaceTab = {
  id: string
  title: string
  url: string
  icon?: string
  closable?: boolean
}

const DEFAULT_TABS: WorkspaceTab[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    url: "/admin",
    icon: "LayoutDashboard",
    closable: false,
  },
]

type WorkspaceTabsState = {
  tabs: WorkspaceTab[]
  openTab: (tab: WorkspaceTab) => void
  closeTab: (url: string) => WorkspaceTab | undefined
}

export const useWorkspaceTabsStore = create<WorkspaceTabsState>()(
  persist(
    (set, get) => ({
      tabs: DEFAULT_TABS,

      openTab: (newTab) => {
        const { tabs } = get()
        if (tabs.some((t) => t.url === newTab.url)) return

        set({ tabs: [...tabs, newTab] })
      },

      closeTab: (url) => {
        const { tabs } = get()
        const index = tabs.findIndex((t) => t.url === url)
        if (index === -1) return undefined

        const nextTabs = tabs.filter((t) => t.url !== url)
        const adjacentTab =
          nextTabs[Math.max(0, index - 1)] ?? DEFAULT_TABS[0]

        set({ tabs: nextTabs.length > 0 ? nextTabs : DEFAULT_TABS })
        return adjacentTab
      },
    }),
    {
      name: "wahana-admin-workspace-tabs",
    }
  )
)
