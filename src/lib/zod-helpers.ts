import { z } from "zod"

export const optionalNumber = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? undefined : value,
  z.coerce.number().optional(),
)

export const requiredNumber = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? undefined : value,
  z.coerce.number(),
)

export const optionalInt = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? undefined : value,
  z.coerce.number().int().optional(),
)

export const optionalText = z
  .string()
  .optional()
  .transform((value) => value?.trim() ?? "")

export const booleanField = z.coerce.boolean().default(false)
