"use client"

import { cn } from "cn"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FieldDef, FormValues } from "@/lib/crud-types"

type FormFieldsProps = {
  fields: FieldDef[]
  values: FormValues
  errors?: Record<string, string[]>
  onChange: (name: string, value: unknown) => void
}

export function FormFields({
  fields,
  values,
  errors,
  onChange,
}: FormFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const error = errors?.[field.name]?.[0]
        const span = field.colSpan === 2 ? "sm:col-span-2" : ""

        if (field.type === "hidden") {
          return null
        }

        if (field.type === "checkbox") {
          return (
            <label
              key={field.name}
              className={cn(
                "flex items-center gap-2 pt-1 text-sm font-medium",
                span,
              )}
            >
              <Checkbox
                checked={Boolean(values[field.name])}
                onCheckedChange={(checked) => onChange(field.name, checked)}
              />
              <span>{field.label}</span>
            </label>
          )
        }

        return (
          <div key={field.name} className={cn("flex flex-col gap-1.5", span)}>
            <Label htmlFor={field.name}>
              {field.label}
              {field.required ? (
                <span className="text-destructive"> *</span>
              ) : null}
            </Label>

            {field.type === "select" ? (
              <Select
                value={
                  values[field.name] ? String(values[field.name]) : ""
                }
                onValueChange={(value) => onChange(field.name, value)}
              >
                <SelectTrigger id={field.name} className="w-full">
                  <SelectValue placeholder={field.placeholder ?? "Pilih..."} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === "textarea" ? (
              <textarea
                id={field.name}
                rows={3}
                value={String(values[field.name] ?? "")}
                placeholder={field.placeholder}
                onChange={(event) => onChange(field.name, event.target.value)}
                className="flex min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              />
            ) : (
              <Input
                id={field.name}
                type={
                  field.type === "number"
                    ? "number"
                    : field.type === "date"
                      ? "date"
                      : "text"
                }
                value={String(values[field.name] ?? "")}
                placeholder={field.placeholder}
                onChange={(event) => onChange(field.name, event.target.value)}
              />
            )}

            {field.description ? (
              <p className="text-xs text-muted-foreground">
                {field.description}
              </p>
            ) : null}
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>
        )
      })}
    </div>
  )
}
