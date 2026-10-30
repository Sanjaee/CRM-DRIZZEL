export function formatDate(
  value: Date | string | null | undefined,
  locale = "id-ID",
): string {
  if (!value) return "-"
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date)
}

export function formatDateTime(
  value: Date | string | null | undefined,
  locale = "id-ID",
): string {
  if (!value) return "-"
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export function formatCurrencyIDR(
  value: string | number | null | undefined,
): string {
  if (value === null || value === undefined || value === "") return "-"
  const num = typeof value === "string" ? Number(value) : value
  if (Number.isNaN(num)) return "-"
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num)
}
