"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check } from "lucide-react"
import { toast } from "sonner"

import { FormFields } from "@/components/crud/form-fields"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type {
  ActionResult,
  FieldDef,
  FieldOption,
  FormValues,
} from "@/lib/crud-types"
import { useCustomerWizardStore } from "@/store/use-customer-wizard-store"

const profileFields: FieldDef[] = [
  { name: "name", label: "Nama Customer", type: "text", required: true, colSpan: 2 },
  { name: "alias", label: "Alias", type: "text" },
  {
    name: "customerType",
    label: "Tipe Customer",
    type: "select",
    defaultValue: "Corporate",
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
  {
    name: "officeAddress",
    label: "Alamat Kantor",
    type: "textarea",
    colSpan: 2,
  },
  { name: "officeAddressCity", label: "Kota", type: "text" },
  { name: "officeAddressCountry", label: "Negara", type: "text" },
  { name: "currencyCode", label: "Mata Uang", type: "text", defaultValue: "IDR" },
]

const creditFields: FieldDef[] = [
  { name: "creditLimit", label: "Credit Limit", type: "number", defaultValue: 0 },
  { name: "dueDays", label: "Due Days", type: "number", defaultValue: 30 },
  { name: "gracePeriod", label: "Grace Period (hari)", type: "number", defaultValue: 7 },
]

const STEP_TITLES = ["Profil & Legalitas", "Klasifikasi", "Kredit & Termin"]

export function CustomerWizard({
  groups,
  createAction,
}: {
  groups: FieldOption[]
  createAction: (input: FormValues) => Promise<ActionResult>
}) {
  const router = useRouter()
  const step = useCustomerWizardStore((state) => state.step)
  const values = useCustomerWizardStore((state) => state.values)
  const setStep = useCustomerWizardStore((state) => state.setStep)
  const setValue = useCustomerWizardStore((state) => state.setValue)
  const reset = useCustomerWizardStore((state) => state.reset)
  const [errors, setErrors] = React.useState<Record<string, string[]>>({})
  const [pending, setPending] = React.useState(false)

  const classificationFields: FieldDef[] = [
    {
      name: "customerGroupId",
      label: "Grup Customer",
      type: "select",
      placeholder: "Pilih grup",
      options: groups,
    },
    {
      name: "status",
      label: "Status Awal",
      type: "select",
      defaultValue: "Active",
      options: [
        { label: "Active", value: "Active" },
        { label: "Pending Verification", value: "PendingVerification" },
      ],
    },
  ]

  const handleNext = () => {
    if (step === 1 && !String(values.name ?? "").trim()) {
      setErrors({ name: ["Nama customer wajib diisi"] })
      return
    }
    setErrors({})
    setStep(Math.min(step + 1, 3))
  }

  const handleSubmit = async () => {
    setPending(true)
    setErrors({})
    try {
      const result = await createAction(values)
      if (result.ok) {
        toast.success(result.message ?? "Customer dibuat")
        reset()
        const created = result.data as { id?: string } | undefined
        router.push(
          created?.id
            ? `/admin/customer-management/customers/${created.id}`
            : "/admin/customer-management/customers",
        )
      } else {
        setErrors(result.fieldErrors ?? {})
        toast.error(result.message)
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div>
        <Link
          href="/admin/customer-management/customers"
          className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Kembali ke Customers
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Tambah Customer
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Langkah {step} dari 3 — {STEP_TITLES[step - 1]}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STEP_TITLES.map((title, index) => {
          const index1 = index + 1
          const active = index1 === step
          const done = index1 < step
          return (
            <div
              key={title}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                active
                  ? "border-primary bg-primary/10 text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <span
                className={`flex size-4 items-center justify-center rounded-full text-[10px] ${
                  active || done ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {done ? <Check className="size-3" /> : index1}
              </span>
              {title}
            </div>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{STEP_TITLES[step - 1]}</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <FormFields
              fields={profileFields}
              values={values}
              errors={errors}
              onChange={setValue}
            />
          ) : step === 2 ? (
            <FormFields
              fields={classificationFields}
              values={values}
              errors={errors}
              onChange={setValue}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <FormFields
                fields={creditFields}
                values={values}
                errors={errors}
                onChange={setValue}
              />
              <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Ringkasan</p>
                <p>Nama: {String(values.name ?? "-")}</p>
                <p>Grup: {String(values.customerGroupId ?? "-") || "-"}</p>
                <p>Status: {String(values.status ?? "-")}</p>
                <p>Credit Limit: {String(values.creditLimit ?? 0)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(step - 1, 1))}
          disabled={step === 1 || pending}
          className="h-8 text-xs"
        >
          Sebelumnya
        </Button>
        {step < 3 ? (
          <Button onClick={handleNext} className="h-8 text-xs">
            Selanjutnya
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={pending} className="h-8 text-xs">
            {pending ? "Menyimpan..." : "Simpan Customer"}
          </Button>
        )}
      </div>
    </div>
  )
}
