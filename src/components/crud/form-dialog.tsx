"use client"

import * as React from "react"
import { toast } from "sonner"

import { FormFields } from "./form-fields"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ActionResult, FieldDef, FormValues } from "@/lib/crud-types"

type FormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  fields: FieldDef[]
  initialValues?: FormValues
  submitLabel?: string
  onSubmit: (values: FormValues) => Promise<ActionResult>
  onSuccess?: () => void
}

function buildValues(
  fields: FieldDef[],
  initial?: FormValues,
): FormValues {
  const values: FormValues = {}
  for (const field of fields) {
    const current = initial?.[field.name]
    if (current !== undefined && current !== null) {
      values[field.name] = current
    } else if (field.defaultValue !== undefined) {
      values[field.name] = field.defaultValue
    } else {
      values[field.name] = field.type === "checkbox" ? false : ""
    }
  }
  return values
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initialValues,
  submitLabel = "Simpan",
  onSubmit,
  onSuccess,
}: FormDialogProps) {
  const [values, setValues] = React.useState<FormValues>(() =>
    buildValues(fields, initialValues),
  )
  const [errors, setErrors] = React.useState<Record<string, string[]>>({})
  const [pending, setPending] = React.useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setPending(true)
    setErrors({})
    try {
      const result = await onSubmit(values)
      if (result.ok) {
        toast.success(result.message ?? "Berhasil disimpan")
        onOpenChange(false)
        onSuccess?.()
      } else {
        setErrors(result.fieldErrors ?? {})
        toast.error(result.message)
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>

          <FormFields
            fields={fields}
            values={values}
            errors={errors}
            onChange={(name, value) =>
              setValues((prev) => ({ ...prev, [name]: value }))
            }
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
