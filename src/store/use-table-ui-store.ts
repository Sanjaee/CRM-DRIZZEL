import { create } from "zustand"

type TableUi = {
  search: string
  page: number
  pageSize: number
}

type TableUiStore = {
  tables: Record<string, TableUi>
  setSearch: (tableId: string, search: string) => void
  setPage: (tableId: string, page: number) => void
  reset: (tableId: string) => void
}

const DEFAULT_PAGE_SIZE = 10

const initialState: TableUi = {
  search: "",
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
}

export const useTableUiStore = create<TableUiStore>((set) => ({
  tables: {},
  setSearch: (tableId, search) =>
    set((state) => ({
      tables: {
        ...state.tables,
        [tableId]: {
          ...(state.tables[tableId] ?? initialState),
          search,
          page: 1,
        },
      },
    })),
  setPage: (tableId, page) =>
    set((state) => ({
      tables: {
        ...state.tables,
        [tableId]: {
          ...(state.tables[tableId] ?? initialState),
          page,
        },
      },
    })),
  reset: (tableId) =>
    set((state) => ({
      tables: { ...state.tables, [tableId]: initialState },
    })),
}))
