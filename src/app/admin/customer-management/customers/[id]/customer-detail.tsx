"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { CrudManager } from "@/components/crud/crud-manager"
import { FormDialog } from "@/components/crud/form-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Customer } from "@/db/schema"
import {
  setCustomerLabelsAction,
  updateCustomerAction,
  updateCustomerStatusAction,
} from "@/lib/customer-actions"
import {
  createAgreementAction,
  deleteAgreementAction,
  updateAgreementAction,
} from "@/lib/customer-agreement-actions"
import {
  createCustomerPicAction,
  deleteCustomerPicAction,
  updateCustomerPicAction,
} from "@/lib/customer-pic-actions"
import {
  createRefundAccountAction,
  deleteRefundAccountAction,
  updateRefundAccountAction,
} from "@/lib/customer-refund-account-actions"
import {
  createCustomerRuleAction,
  deleteCustomerRuleAction,
  updateCustomerRuleAction,
} from "@/lib/customer-rule-actions"
import {
  grantCreditOverUseAction,
  recordCreditMovementAction,
  recordDepositMovementAction,
  updateCreditLimitAction,
} from "@/lib/customer-credit-actions"
import type { ActionResult, ColumnDef, CrudRow, FieldDef, FormValues } from "@/lib/crud-types"
import { formatCurrencyIDR, formatDateTime } from "@/lib/format"
import { useCustomerDetailStore } from "@/store/use-customer-detail-store"

type LabelItem = {
  id: string
  name: string
  color: string | null
  isPublic: boolean | null
}

type CustomerDetailProps = {
  customer: Customer
  groupName: string | null
  pics: CrudRow[]
  agreements: CrudRow[]
  refundAccounts: CrudRow[]
  rules: CrudRow[]
  creditMovements: CrudRow[]
  depositMovements: CrudRow[]
  labels: LabelItem[]
  assignedLabelIds: string[]
}

type DialogState = {
  key: string
  title: string
  description?: string
  fields: FieldDef[]
  values: FormValues
  submitLabel?: string
  onSubmit: (values: FormValues) => Promise<ActionResult>
}

const statusOptions = [
  "Draft",
  "PendingVerification",
  "Active",
  "Suspended",
  "Inactive",
]

const ruleTypeOptions = [
  { label: "Booking Restriction", value: "BookingRestriction" },
  { label: "Fare Rule", value: "FareRule" },
  { label: "Discount Rule", value: "DiscountRule" },
]

const operatorOptions = [
  { label: "Sama dengan (=)", value: "eq" },
  { label: "Tidak sama (!=)", value: "ne" },
  { label: "Lebih besar (>)", value: "gt" },
  { label: "Lebih kecil (<)", value: "lt" },
  { label: "Mengandung", value: "contains" },
]

function LedgerTable({
  rows,
  columns,
  emptyMessage,
}: {
  rows: CrudRow[]
  columns: { key: string; label: string; money?: boolean; date?: boolean }[]
  emptyMessage: string
}) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-8 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow key={String(row.id ?? index)}>
                {columns.map((column) => (
                  <TableCell key={column.key} className="text-xs">
                    {column.money
                      ? formatCurrencyIDR(row[column.key] as string)
                      : column.date
                        ? formatDateTime(row[column.key] as string | Date)
                        : String(row[column.key] ?? "-")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export function CustomerDetail({
  customer,
  groupName,
  pics,
  agreements,
  refundAccounts,
  rules,
  creditMovements,
  depositMovements,
  labels,
  assignedLabelIds,
}: CustomerDetailProps) {
  const router = useRouter()
  const tab = useCustomerDetailStore((state) => state.tab)
  const setTab = useCustomerDetailStore((state) => state.setTab)
  const [dialog, setDialog] = React.useState<DialogState | null>(null)
  const [selectedLabels, setSelectedLabels] =
    React.useState<string[]>(assignedLabelIds)
  const [savingLabels, setSavingLabels] = React.useState(false)

  const openDialog = (state: Omit<DialogState, "key">) =>
    setDialog({ ...state, key: `${state.title}-${Date.now()}` })

  const profileValues: FormValues = {
    name: customer.name ?? "",
    alias: customer.alias ?? "",
    customerType: customer.customerType ?? "Corporate",
    businessType: customer.businessType ?? "",
    businessNature: customer.businessNature ?? "",
    taxIdType: customer.taxIdType ?? "",
    taxIdNo: customer.taxIdNo ?? "",
    taxPayerName: customer.taxPayerName ?? "",
    emailAddress: customer.emailAddress ?? "",
    phoneNo: customer.phoneNo ?? "",
    officeAddress: customer.officeAddress ?? "",
    officeAddressCity: customer.officeAddressCity ?? "",
    officeAddressCountry: customer.officeAddressCountry ?? "",
    currencyCode: customer.currencyCode ?? "IDR",
    dueDays: customer.dueDays ?? 30,
    gracePeriod: customer.gracePeriod ?? 7,
    status: customer.status ?? "Active",
  }

  const profileFields: FieldDef[] = [
    { name: "name", label: "Nama Customer", type: "text", required: true, colSpan: 2 },
    { name: "alias", label: "Alias", type: "text" },
    {
      name: "customerType",
      label: "Tipe Customer",
      type: "select",
      options: [
        { label: "Corporate", value: "Corporate" },
        { label: "Individual", value: "Individual" },
      ],
    },
    { name: "businessType", label: "Bidang Usaha", type: "text" },
    { name: "businessNature", label: "Sifat Bisnis", type: "text" },
    { name: "taxIdType", label: "Tipe NPWP", type: "text" },
    { name: "taxIdNo", label: "No. NPWP", type: "text" },
    { name: "taxPayerName", label: "Nama Wajib Pajak", type: "text" },
    { name: "emailAddress", label: "Email", type: "text" },
    { name: "phoneNo", label: "Telepon", type: "text" },
    { name: "officeAddress", label: "Alamat Kantor", type: "textarea", colSpan: 2 },
    { name: "officeAddressCity", label: "Kota", type: "text" },
    { name: "officeAddressCountry", label: "Negara", type: "text" },
    { name: "currencyCode", label: "Mata Uang", type: "text" },
    { name: "dueDays", label: "Due Days", type: "number" },
    { name: "gracePeriod", label: "Grace Period", type: "number" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: statusOptions.map((status) => ({ label: status, value: status })),
    },
  ]

  const picFields: FieldDef[] = [
    { name: "customerId", label: "", type: "hidden", defaultValue: customer.id },
    { name: "name", label: "Nama PIC", type: "text", required: true },
    { name: "title", label: "Title", type: "text" },
    { name: "position", label: "Jabatan", type: "text" },
    { name: "division", label: "Divisi", type: "text" },
    { name: "emailAddress", label: "Email", type: "text" },
    { name: "phoneNo", label: "Telepon", type: "text" },
    { name: "mobilePhoneNo", label: "HP", type: "text" },
    { name: "userNo", label: "User No", type: "text" },
    { name: "isActive", label: "Aktif", type: "checkbox", defaultValue: true },
    { name: "isHeadOfficer", label: "Head Officer", type: "checkbox", defaultValue: false },
  ]
  const picColumns: ColumnDef[] = [
    { key: "name", header: "Nama" },
    { key: "position", header: "Jabatan" },
    { key: "division", header: "Divisi" },
    { key: "emailAddress", header: "Email", kind: "mono" },
    { key: "phoneNo", header: "Telepon" },
    { key: "isHeadOfficer", header: "Head", kind: "boolean", className: "w-20" },
    { key: "isActive", header: "Aktif", kind: "boolean", className: "w-20" },
  ]

  const agreementFields: FieldDef[] = [
    { name: "customerId", label: "", type: "hidden", defaultValue: customer.id },
    { name: "documentNo", label: "No. Dokumen", type: "text", required: true },
    { name: "title", label: "Judul", type: "text", required: true },
    { name: "startDate", label: "Mulai", type: "date", required: true },
    { name: "endDate", label: "Berakhir", type: "date", required: true },
    { name: "fileUrl", label: "URL File", type: "text", colSpan: 2 },
    { name: "isActive", label: "Agreement Aktif", type: "checkbox", defaultValue: true },
  ]
  const agreementColumns: ColumnDef[] = [
    { key: "documentNo", header: "No. Dokumen", kind: "mono" },
    { key: "title", header: "Judul" },
    { key: "startDate", header: "Mulai", kind: "date", className: "w-32" },
    { key: "endDate", header: "Berakhir", kind: "date", className: "w-32" },
    { key: "isActive", header: "Aktif", kind: "boolean", className: "w-20" },
  ]

  const refundFields: FieldDef[] = [
    { name: "customerId", label: "", type: "hidden", defaultValue: customer.id },
    { name: "bankName", label: "Nama Bank", type: "text", required: true },
    { name: "bankBranch", label: "Cabang", type: "text" },
    { name: "accountNo", label: "No. Rekening", type: "text", required: true },
    { name: "accountHolderName", label: "Pemilik", type: "text", required: true },
    { name: "isPrimary", label: "Utama", type: "checkbox", defaultValue: false },
  ]
  const refundColumns: ColumnDef[] = [
    { key: "bankName", header: "Bank" },
    { key: "accountNo", header: "No. Rekening", kind: "mono" },
    { key: "accountHolderName", header: "Pemilik" },
    { key: "isPrimary", header: "Utama", kind: "boolean", className: "w-20" },
  ]

  const ruleFields: FieldDef[] = [
    { name: "customerId", label: "", type: "hidden", defaultValue: customer.id },
    {
      name: "ruleType",
      label: "Tipe Rule",
      type: "select",
      defaultValue: "BookingRestriction",
      options: ruleTypeOptions,
    },
    { name: "conditionKey", label: "Condition Key", type: "text", required: true },
    {
      name: "conditionOperator",
      label: "Operator",
      type: "select",
      defaultValue: "eq",
      options: operatorOptions,
    },
    { name: "conditionValue", label: "Value", type: "text", required: true },
    { name: "isActive", label: "Aktif", type: "checkbox", defaultValue: true },
  ]
  const ruleColumns: ColumnDef[] = [
    { key: "ruleType", header: "Tipe", kind: "badge", className: "w-44" },
    { key: "conditionKey", header: "Key", kind: "mono" },
    { key: "conditionOperator", header: "Operator", kind: "mono", className: "w-28" },
    { key: "conditionValue", header: "Value" },
    { key: "isActive", header: "Aktif", kind: "boolean", className: "w-20" },
  ]

  const handleStatusChange = async (value: string) => {
    const result = await updateCustomerStatusAction(customer.id, value)
    if (result.ok) {
      toast.success(result.message ?? "Status diperbarui")
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  const handleSaveLabels = async () => {
    setSavingLabels(true)
    try {
      const result = await setCustomerLabelsAction(customer.id, selectedLabels)
      if (result.ok) {
        toast.success(result.message ?? "Label disimpan")
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } finally {
      setSavingLabels(false)
    }
  }

  const creditCards = [
    { label: "Limit", value: customer.creditLimit },
    { label: "Tersedia", value: customer.creditAvailable },
    { label: "Terpakai", value: customer.creditInUsed },
    { label: "On Hold", value: customer.creditOnHold },
    { label: "Deposit", value: customer.depositBalance },
    { label: "Deposit Tersedia", value: customer.depositAvailable },
  ]

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/customer-management/customers"
            className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Kembali ke Customers
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {customer.name}
            </h1>
            <Badge variant="outline" className="font-mono text-[10px]">
              {customer.customerNo}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {groupName ?? "Tanpa grup"} · {customer.customerType ?? "-"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={customer.status ?? "Active"}
            onValueChange={(value) => value && handleStatusChange(value)}
          >
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="h-8 text-xs"
            onClick={() =>
              openDialog({
                title: "Ubah Profil Customer",
                fields: profileFields,
                values: profileValues,
                onSubmit: async (values) => {
                  const result = await updateCustomerAction(customer.id, values)
                  if (result.ok) router.refresh()
                  return result
                },
              })
            }
          >
            Ubah Profil
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="credit">Credit & Deposit</TabsTrigger>
          <TabsTrigger value="pic">PIC</TabsTrigger>
          <TabsTrigger value="agreement">Agreement</TabsTrigger>
          <TabsTrigger value="refund">Rek. Refund</TabsTrigger>
          <TabsTrigger value="labels">Labels</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="profil" className="pt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Alias", customer.alias],
              ["Tipe", customer.customerType],
              ["Bidang Usaha", customer.businessType],
              ["Sifat Bisnis", customer.businessNature],
              ["NPWP", customer.taxIdNo],
              ["Nama WP", customer.taxPayerName],
              ["Email", customer.emailAddress],
              ["Telepon", customer.phoneNo],
              ["Kota", customer.officeAddressCity],
              ["Negara", customer.officeAddressCountry],
              ["Mata Uang", customer.currencyCode],
              ["Due Days", customer.dueDays],
              ["Grace Period", customer.gracePeriod],
              ["Status", customer.status],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-lg border bg-card p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
                <p className="text-sm">
                  {value === null || value === undefined || value === ""
                    ? "-"
                    : String(value)}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="credit" className="flex flex-col gap-4 pt-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {creditCards.map((card) => (
              <div key={card.label} className="rounded-lg border bg-card p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {card.label}
                </p>
                <p className="text-sm font-medium">
                  {formatCurrencyIDR(card.value)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="h-8 text-xs"
              onClick={() =>
                openDialog({
                  title: "Ubah Limit Kredit",
                  fields: [
                    {
                      name: "creditLimit",
                      label: "Credit Limit",
                      type: "number",
                      required: true,
                    },
                  ],
                  values: { creditLimit: customer.creditLimit ?? "0" },
                  onSubmit: async (values) => {
                    const result = await updateCreditLimitAction(
                      customer.id,
                      values,
                    )
                    if (result.ok) router.refresh()
                    return result
                  },
                })
              }
            >
              Ubah Limit
            </Button>
            <Button
              variant="outline"
              className="h-8 text-xs"
              onClick={() =>
                openDialog({
                  title: "Over-Use Kredit",
                  fields: [
                    {
                      name: "allowCreditOverUse",
                      label: "Izinkan Over-Use",
                      type: "checkbox",
                    },
                    {
                      name: "maxCreditOverUseAmount",
                      label: "Max Over-Use",
                      type: "number",
                    },
                    {
                      name: "creditOverUseValidUntil",
                      label: "Berlaku Sampai",
                      type: "date",
                    },
                  ],
                  values: {
                    allowCreditOverUse: customer.allowCreditOverUse ?? false,
                    maxCreditOverUseAmount:
                      customer.maxCreditOverUseAmount ?? "0",
                    creditOverUseValidUntil: customer.creditOverUseValidUntil
                      ? new Date(customer.creditOverUseValidUntil)
                          .toISOString()
                          .slice(0, 10)
                      : "",
                  },
                  onSubmit: async (values) => {
                    const result = await grantCreditOverUseAction(
                      customer.id,
                      values,
                    )
                    if (result.ok) router.refresh()
                    return result
                  },
                })
              }
            >
              Over-Use
            </Button>
            <Button
              variant="outline"
              className="h-8 text-xs"
              onClick={() =>
                openDialog({
                  title: "Mutasi Kredit",
                  fields: [
                    {
                      name: "movementType",
                      label: "Tipe",
                      type: "select",
                      defaultValue: "Usage",
                      options: [
                        { label: "Usage (pakai kredit)", value: "Usage" },
                        { label: "Repayment (bayar)", value: "Repayment" },
                        { label: "Adjustment", value: "Adjustment" },
                        { label: "Reversal", value: "Reversal" },
                      ],
                    },
                    { name: "amount", label: "Nominal", type: "number", required: true },
                    { name: "referenceDoc", label: "No. Referensi", type: "text" },
                    { name: "notes", label: "Catatan", type: "text" },
                  ],
                  values: { movementType: "Usage", amount: "" },
                  onSubmit: async (values) => {
                    const result = await recordCreditMovementAction(
                      customer.id,
                      values,
                    )
                    if (result.ok) router.refresh()
                    return result
                  },
                })
              }
            >
              Mutasi Kredit
            </Button>
            <Button
              variant="outline"
              className="h-8 text-xs"
              onClick={() =>
                openDialog({
                  title: "Mutasi Deposit",
                  fields: [
                    {
                      name: "movementType",
                      label: "Tipe",
                      type: "select",
                      defaultValue: "Deposit",
                      options: [
                        { label: "Deposit (masuk)", value: "Deposit" },
                        { label: "Refund (keluar)", value: "Refund" },
                        { label: "Adjustment", value: "Adjustment" },
                      ],
                    },
                    { name: "amount", label: "Nominal", type: "number", required: true },
                    { name: "referenceDoc", label: "No. Referensi", type: "text" },
                    { name: "notes", label: "Catatan", type: "text" },
                  ],
                  values: { movementType: "Deposit", amount: "" },
                  onSubmit: async (values) => {
                    const result = await recordDepositMovementAction(
                      customer.id,
                      values,
                    )
                    if (result.ok) router.refresh()
                    return result
                  },
                })
              }
            >
              Mutasi Deposit
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ledger Kredit
              </p>
              <LedgerTable
                rows={creditMovements}
                emptyMessage="Belum ada mutasi kredit."
                columns={[
                  { key: "movementType", label: "Tipe" },
                  { key: "balanceBefore", label: "Sebelum", money: true },
                  { key: "amount", label: "Nominal", money: true },
                  { key: "balanceAfter", label: "Sesudah", money: true },
                  { key: "movementDate", label: "Tanggal", date: true },
                ]}
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ledger Deposit
              </p>
              <LedgerTable
                rows={depositMovements}
                emptyMessage="Belum ada mutasi deposit."
                columns={[
                  { key: "movementType", label: "Tipe" },
                  { key: "balanceBefore", label: "Sebelum", money: true },
                  { key: "amount", label: "Nominal", money: true },
                  { key: "balanceAfter", label: "Sesudah", money: true },
                  { key: "movementDate", label: "Tanggal", date: true },
                ]}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pic" className="pt-4">
          <CrudManager
            tableId={`customer-${customer.id}-pics`}
            title="PIC / Kontak"
            entityLabel="PIC"
            addLabel="Tambah PIC"
            columns={picColumns}
            fields={picFields}
            searchKeys={["name", "position", "emailAddress"]}
            initialRows={pics}
            createAction={createCustomerPicAction}
            updateAction={updateCustomerPicAction}
            deleteAction={deleteCustomerPicAction}
          />
        </TabsContent>

        <TabsContent value="agreement" className="pt-4">
          <CrudManager
            tableId={`customer-${customer.id}-agreements`}
            title="Agreement Documents"
            entityLabel="Agreement"
            addLabel="Tambah Agreement"
            columns={agreementColumns}
            fields={agreementFields}
            searchKeys={["documentNo", "title"]}
            initialRows={agreements}
            createAction={createAgreementAction}
            updateAction={updateAgreementAction}
            deleteAction={deleteAgreementAction}
          />
        </TabsContent>

        <TabsContent value="refund" className="pt-4">
          <CrudManager
            tableId={`customer-${customer.id}-refunds`}
            title="Rekening Refund"
            entityLabel="Rekening"
            addLabel="Tambah Rekening"
            columns={refundColumns}
            fields={refundFields}
            searchKeys={["bankName", "accountNo", "accountHolderName"]}
            initialRows={refundAccounts}
            createAction={createRefundAccountAction}
            updateAction={updateRefundAccountAction}
            deleteAction={deleteRefundAccountAction}
          />
        </TabsContent>

        <TabsContent value="labels" className="flex flex-col gap-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Label Customer</h2>
            <Button
              className="h-8 text-xs"
              onClick={handleSaveLabels}
              disabled={savingLabels}
            >
              {savingLabels ? "Menyimpan..." : "Simpan Label"}
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {labels.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada label. Tambahkan di menu Cust. Labels.
              </p>
            ) : (
              labels.map((label) => (
                <label
                  key={label.id}
                  className="flex items-center gap-2 rounded-lg border bg-card p-3 text-sm"
                >
                  <Checkbox
                    checked={selectedLabels.includes(label.id)}
                    onCheckedChange={(checked) =>
                      setSelectedLabels((prev) =>
                        checked
                          ? [...new Set([...prev, label.id])]
                          : prev.filter((id) => id !== label.id),
                      )
                    }
                  />
                  <span
                    className="inline-block size-3 rounded-full"
                    style={{ backgroundColor: label.color ?? "#3b82f6" }}
                  />
                  <span>{label.name}</span>
                  {!label.isPublic ? (
                    <Badge variant="secondary" className="ml-auto text-[10px]">
                      private
                    </Badge>
                  ) : null}
                </label>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="pt-4">
          <CrudManager
            tableId={`customer-${customer.id}-rules`}
            title="Customer Rules"
            entityLabel="Rule"
            addLabel="Tambah Rule"
            columns={ruleColumns}
            fields={ruleFields}
            searchKeys={["ruleType", "conditionKey", "conditionValue"]}
            initialRows={rules}
            createAction={createCustomerRuleAction}
            updateAction={updateCustomerRuleAction}
            deleteAction={deleteCustomerRuleAction}
          />
        </TabsContent>
      </Tabs>

      {dialog ? (
        <FormDialog
          key={dialog.key}
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null)
          }}
          title={dialog.title}
          description={dialog.description}
          fields={dialog.fields}
          initialValues={dialog.values}
          submitLabel={dialog.submitLabel}
          onSubmit={dialog.onSubmit}
        />
      ) : null}
    </div>
  )
}
