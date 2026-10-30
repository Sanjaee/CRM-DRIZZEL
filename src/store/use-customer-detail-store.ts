import { create } from "zustand"

type CustomerDetailState = {
  tab: string
  setTab: (tab: string) => void
}

export const useCustomerDetailStore = create<CustomerDetailState>((set) => ({
  tab: "profil",
  setTab: (tab) => set({ tab }),
}))
