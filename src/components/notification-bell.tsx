"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ActionResult } from "@/lib/crud-types"
import type { MyNotification } from "@/lib/notifications"

type NotificationBellProps = {
  notifications: MyNotification[]
  unreadCount: number
  markReadAction: (id: string) => Promise<ActionResult>
  markAllReadAction: () => Promise<ActionResult>
}

function formatWhen(value: Date | null): string {
  if (!value) return ""
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function NotificationBell({
  notifications,
  unreadCount,
  markReadAction,
  markAllReadAction,
}: NotificationBellProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)

  const handleRead = async (id: string) => {
    setPending(true)
    try {
      const result = await markReadAction(id)
      if (result.ok) router.refresh()
      else toast.error(result.message)
    } finally {
      setPending(false)
    }
  }

  const handleReadAll = async () => {
    setPending(true)
    try {
      const result = await markAllReadAction()
      if (result.ok) {
        toast.success(result.message ?? "Ditandai dibaca")
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        className="relative"
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
        <span className="sr-only">Notifikasi</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notifikasi</DialogTitle>
            <DialogDescription>
              {unreadCount > 0
                ? `${unreadCount} notifikasi belum dibaca.`
                : "Semua notifikasi sudah dibaca."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Belum ada notifikasi.
              </p>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => !item.isRead && handleRead(item.id)}
                  disabled={pending}
                  className={`flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors ${
                    item.isRead
                      ? "bg-card"
                      : "border-primary/30 bg-primary/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{item.header}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatWhen(item.createdDate)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.message}
                  </span>
                </button>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleReadAll}
              disabled={pending || unreadCount === 0}
            >
              Tandai semua dibaca
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
