"use client"

import * as React from "react"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Search,
  Settings2,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ColumnDef, CrudRow } from "@/lib/crud-types"
import { formatDate } from "@/lib/format"
import { useTableUiStore } from "@/store/use-table-ui-store"

type CrudTableProps = {
  tableId: string
  columns: ColumnDef[]
  rows: CrudRow[]
  searchKeys: string[]
  searchPlaceholder?: string
  emptyMessage?: string
  detailHrefPrefix?: string
  onEdit?: (row: CrudRow) => void
  onDelete?: (row: CrudRow) => void
}

function CellValue({
  column,
  row,
}: {
  column: ColumnDef
  row: CrudRow
}) {
  const value = row[column.key]

  switch (column.kind) {
    case "boolean": {
      const active = Boolean(value)
      return (
        <Badge
          variant="outline"
          className={
            active
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
              : "text-muted-foreground"
          }
        >
          {active ? "Ya" : "Tidak"}
        </Badge>
      )
    }
    case "mono":
      return (
        <span className="font-mono text-xs text-muted-foreground">
          {value == null || value === ""
            ? (column.emptyText ?? "-")
            : String(value)}
        </span>
      )
    case "date":
      return (
        <span className="text-xs text-muted-foreground">
          {formatDate(value as string | Date | null)}
        </span>
      )
    case "badge": {
      const text = value == null || value === "" ? "-" : String(value)
      const variant =
        column.badgeVariants?.[text] ??
        (column.badgeVariants?.default as
          | "default"
          | "secondary"
          | "destructive"
          | "outline"
          | undefined)
      return (
        <Badge variant={variant ?? "secondary"} className="font-mono text-[11px]">
          {text}
        </Badge>
      )
    }
    case "badgeList": {
      const items = String(value ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
      if (items.length === 0) return <span>-</span>
      return (
        <div className="flex flex-wrap gap-1">
          {items.map((item) => (
            <Badge key={item} variant="secondary" className="text-[10px]">
              {item}
            </Badge>
          ))}
        </div>
      )
    }
    default:
      return (
        <span>
          {value == null || value === ""
            ? (column.emptyText ?? "-")
            : String(value)}
        </span>
      )
  }
}

export function CrudTable({
  tableId,
  columns,
  rows,
  searchKeys,
  searchPlaceholder = "Cari...",
  emptyMessage = "Belum ada data.",
  detailHrefPrefix,
  onEdit,
  onDelete,
}: CrudTableProps) {
  const search = useTableUiStore((state) => state.tables[tableId]?.search ?? "")
  const page = useTableUiStore((state) => state.tables[tableId]?.page ?? 1)
  const pageSize = useTableUiStore(
    (state) => state.tables[tableId]?.pageSize ?? 10,
  )
  const setSearch = useTableUiStore((state) => state.setSearch)
  const setPage = useTableUiStore((state) => state.setPage)

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return rows
    return rows.filter((row) =>
      searchKeys.some((key) =>
        String(row[key] ?? "")
          .toLowerCase()
          .includes(term),
      ),
    )
  }, [rows, search, searchKeys])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const pageRows = filtered.slice(start, start + pageSize)
  const hasActions = Boolean(onEdit) || Boolean(onDelete) || Boolean(detailHrefPrefix)

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => setSearch(tableId, event.target.value)}
          className="h-8 pl-8 text-xs"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
              {hasActions ? (
                <TableHead className="w-24 text-right">Aksi</TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row, index) => (
                <TableRow key={String(row.id ?? index)}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      <CellValue column={column} row={row} />
                    </TableCell>
                  ))}
                  {hasActions ? (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {detailHrefPrefix ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            nativeButton={false}
                            render={
                              <Link
                                href={`${detailHrefPrefix}/${String(row.id)}`}
                              />
                            }
                            className="size-7 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Settings2 className="size-3.5" />
                          </Button>
                        ) : null}
                        {onEdit ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(row)}
                            className="size-7 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                        ) : null}
                        {onDelete ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(row)}
                            className="size-7 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filtered.length > pageSize ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {start + 1}–{Math.min(start + pageSize, filtered.length)} dari{" "}
            {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage <= 1}
              onClick={() => setPage(tableId, currentPage - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span>
              {currentPage}/{totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(tableId, currentPage + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
