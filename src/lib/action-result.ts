import { z } from "zod"

import type { ActionResult } from "@/lib/crud-types"

export function ok<T>(data?: T, message = "Berhasil"): ActionResult<T> {
  return { ok: true, data, message }
}

export function fail(
  message: string,
  fieldErrors?: Record<string, string[]>,
): ActionResult<never> {
  return { ok: false, message, fieldErrors }
}

export function toActionResult(error: unknown): ActionResult<never> {
  if (error instanceof z.ZodError) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of error.issues) {
      const key = issue.path.join(".") || "_form"
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message]
    }
    return {
      ok: false,
      message: "Validasi gagal. Periksa kembali input.",
      fieldErrors,
    }
  }

  if (error instanceof Error) {
    return { ok: false, message: error.message }
  }

  return { ok: false, message: "Terjadi kesalahan tak terduga." }
}
