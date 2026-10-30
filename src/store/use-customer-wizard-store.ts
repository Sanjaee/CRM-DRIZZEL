import { create } from "zustand"

import type { FormValues } from "@/lib/crud-types"

type CustomerWizardState = {
  step: number
  values: FormValues
  setStep: (step: number) => void
  next: () => void
  prev: () => void
  setValue: (name: string, value: unknown) => void
  setValues: (values: FormValues) => void
  reset: () => void
}

const initialValues: FormValues = {
  name: "",
  alias: "",
  customerType: "Corporate",
  businessType: "",
  businessNature: "",
  taxIdType: "",
  taxIdNo: "",
  taxPayerName: "",
  emailAddress: "",
  phoneNo: "",
  officeAddress: "",
  officeAddressCity: "",
  officeAddressCountry: "ID",
  currencyCode: "IDR",
  customerGroupId: "",
  status: "Active",
  creditLimit: 0,
  dueDays: 30,
  gracePeriod: 7,
}

export const useCustomerWizardStore = create<CustomerWizardState>((set) => ({
  step: 1,
  values: { ...initialValues },
  setStep: (step) => set({ step }),
  next: () => set((state) => ({ step: Math.min(state.step + 1, 3) })),
  prev: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
  setValue: (name, value) =>
    set((state) => ({ values: { ...state.values, [name]: value } })),
  setValues: (values) =>
    set((state) => ({ values: { ...state.values, ...values } })),
  reset: () => set({ step: 1, values: { ...initialValues } }),
}))
