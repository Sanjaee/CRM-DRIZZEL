export type ActionResult<T = unknown> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> }

export type ColumnKind = "text" | "mono" | "badge" | "boolean" | "badgeList" | "date"

export type ColumnDef = {
  key: string
  header: string
  className?: string
  kind?: ColumnKind
  emptyText?: string
  badgeVariants?: Record<string, "default" | "secondary" | "destructive" | "outline">
}

export type FieldType = "text" | "textarea" | "number" | "date" | "select" | "checkbox" | "hidden"

export type FieldOption = { label: string; value: string }

export type FieldDef = {
  name: string
  label: string
  type: FieldType
  placeholder?: string
  options?: FieldOption[]
  required?: boolean
  description?: string
  defaultValue?: string | number | boolean
  colSpan?: 1 | 2
}

export type FormValues = Record<string, unknown>

export type CrudRow = Record<string, unknown>
