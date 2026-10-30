<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Standar Penulisan Code

Panduan ini dipakai oleh semua agent/kontributor di repo ini. Patuhi kecuali ada alasan kuat.

## Stack

- **Next.js 16** (App Router, Turbopack, React 19.2) + TypeScript strict
- **Tailwind CSS v4** + **shadcn/ui** (style: base-ui)
- **Drizzle ORM** + **Neon Postgres** (`@neondatabase/serverless`, driver `neon-http`)
- **NextAuth (Auth.js v5)** dengan provider Google, session `jwt`, adapter Drizzle
- **Zustand** untuk client state
- **Zod** untuk validasi input

## Perintah

- `npm run dev` — dev server
- `npm run build` — build production
- `npm run lint` / `npm run typecheck` — wajib lulus sebelum selesai
- `npm run db:generate` — generate migration dari `src/db/schema.ts`
- `npm run db:migrate` — apply migration
- `npm run db:push` — sync schema langsung (khusus dev)
- `npm run db:studio` — Drizzle Studio

## Struktur Folder

- `src/app/**` — routing. Server Component secara default.
- `src/components/**` — komponen UI. `src/components/ui/**` = hasil shadcn (jangan diedit manual kecuali perlu).
- `src/db/**` — `schema.ts` (skema) + `index.ts` (koneksi). Semua akses DB lewat sini.
- `src/store/**` — Zustand store, satu store per file (`use-<nama>-store.ts`).
- `src/lib/**` — helper murni (format, util).
- `src/auth.ts` — konfigurasi NextAuth. `src/app/api/auth/[...nextauth]/route.ts` — handler.
- `src/types/**` — deklarasi tipe global (`.d.ts`).

Alias import: pakai `@/*` (contoh `@/db`, `@/components/ui/button`).

## Aturan Next.js 16 (WAJIB)

- **Tidak ada `middleware.ts`.** Konvensi baru adalah `proxy.ts` (export `proxy`, runtime Node) di root atau `src/`. Taruh logika auth/redirect di situ.
- **Async Request APIs.** `cookies()`, `headers()`, `draftMode()`, serta `params`/`searchParams` hanya bisa di-`await`. Jangan akses sinkron.
- **Tipe global.** Gunakan helper `PageProps<'/route'>`, `LayoutProps<'/route'>`, `RouteContext<'/route'>` — tidak perlu import.
- **`cacheComponents` aktif.** Membaca `cookies()`/`headers()` di luar `<Suspense>` = error build. Bungkus UI yang bergantung sesi dalam `<Suspense>`, atau pindahkan pembacaan ke Client Component (`useSession`).
- Jangan pakai `next lint` (dihapus) — lint lewat `npm run lint`.
- `fetch` untuk data: cache eksplisit pakai `use cache` + `cacheTag`/`cacheLife`. Invalidate dengan `revalidateTag(tag, 'max')` atau `updateTag(tag)` di Server Action.

## TypeScript

- `strict: true`. Dilarang `any`; pakai tipe eksplisit atau `unknown` + validasi zod.
- Export komponen dengan **named export** (`export function Foo`), kecuali `page.tsx`/`layout.tsx` yang wajib **default export**.
- Pakai `type` untuk tipe, `interface` untuk kontrak objek yang bisa di-extend.
- `import type { ... }` untuk import tipe saja.

## Server vs Client Component

- Default Server Component. Tambahkan `"use client"` **hanya** kalau butuh hook/event browser.
- Komponen client taruh sedekat mungkin dengan pemakaian (wrapper kecil), bukan di root.
- Jangan import modul server (`db`, `auth` server) ke file `"use client"`.
- Semua akses DB & `auth()` terjadi di server (Server Component, Server Action, Route Handler).

## Database (Drizzle)

- Definisikan/mengubah skema **hanya** di `src/db/schema.ts`.
- Setiap tabel: `id` teks `$defaultFn(() => crypto.randomUUID())`, kolom waktu `timestamp(... { withTimezone: true })`, dan FK dengan `onDelete: "cascade"` bila anak milik induk.
- Export tipe inferred: `type X = typeof x.$inferSelect` dan `type NewX = typeof x.$inferInsert`.
- Akses DB lewat `db` dari `@/db`. Query pakai query builder Drizzle (`db.select()`, `db.insert()`, dst). Hindari raw SQL kecuali terpaksa.
- Setelah ubah skema: `npm run db:generate` lalu `npm run db:migrate` (atau `db:push` di dev).
- Jangan pernah menaruh `DATABASE_URL`/kredensial di kode. Selalu lewat env.

## Auth (NextAuth v5)

- Server: `const session = await auth()` dari `@/auth`. Client: `useSession` dari `next-auth/react`.
- **Selalu verifikasi ulang sesi di Server Action dan Route Handler** — jangan percaya UI.
- Halaman/komponen yang membaca sesi di server harus di dalam `<Suspense>` (karena `cacheComponents`).
- Untuk menambah field sesi (mis. `user.id`), ubah `callbacks` di `src/auth.ts` dan deklarasikan tipe di `src/types/next-auth.d.ts`.

## Zustand

- Satu store per file di `src/store/`, nama file `use-<nama>-store.ts`, nama hook `use<Nama>Store`.
- Consume dengan **selector** (`useStore((s) => s.value)`), hindari mengambil seluruh state.
- Persist bila perlu: `persist(..., { name: "..." })`. Jangan simpan data sensitif/token di store.

## Styling

- Pakai utility Tailwind + `cn()` dari `@/lib/utils` untuk conditional class.
- Tambah komponen lewat `npx shadcn@latest add <komponen>`, jangan bikin ulang dari nol.
- Warna via token (`bg-background`, `text-muted-foreground`) — jangan hardcode hex.

## Validasi & Error

- Validasi input (form/route body) dengan zod; parse sebelum dipakai.
- Route Handler: kembalikan `Response.json(...)` dengan status yang tepat (401/400/404/500). Jangan bocorkan detail error internal ke client.
- Server Action: panggil `revalidateTag`/`updateTag`/`refresh` setelah mutasi.

## Git & Umum

- Jangan commit `.env.local` (sudah di-ignore). Update `.env.example` bila menambah env baru.
- Jalankan `npm run lint` dan `npm run typecheck` sebelum menyelesaikan tugas.
- Jangan tambah komentar kecuali diminta. Fokus perubahan minimal & sesuai konvensi yang ada.

## Pola CRUD Standar (Kit + RBAC)

Setiap fitur admin memakai pola yang sama:

- **Halaman**: `src/app/admin/<grup>/<fitur>/page.tsx` — Server Component. Bungkus konten yang membaca sesi/DB dengan `<Suspense fallback={<CrudTableSkeleton />}>`, cek `session?.user?.role !== "admin"` → `redirect("/signin")`, lalu render `<CrudManager />` (atau manager khusus).
- **Manager generik**: `src/components/crud/crud-manager.tsx` + `crud-table.tsx` + `form-fields.tsx` + `confirm-dialog.tsx`. Kolom/field dikirim sebagai data serializable (`ColumnDef`, `FieldDef`). Server Action dikirim sebagai prop dari page ke manager.
- **State tabel (client)**: Zustand `src/store/use-table-ui-store.ts` (search/page per `tableId`). Jangan pakai TanStack table untuk CRUD baru — tabel dibuat ringan manual.
- **Server Actions**: `src/lib/<modul>-actions.ts` (`"use server"`). Setiap aksi: `await requirePermission("resource.action")` → `schema.parse(input)` → query Drizzle → `writeAuditLog(...)` → `revalidatePath(...)`. Kembalikan `ActionResult` via `ok()`/`toActionResult()` (`src/lib/action-result.ts`), bukan throw.
- **Alerts**: pakai `toast` dari `sonner` (Toaster sudah di `providers.tsx`).
- **RBAC**: katalog izin `src/lib/permissions.ts` + seed `src/db/seed-permissions.ts` (jalankan `npm run db:seed`). User `role === "admin"` tanpa `adminUserRole` = akses penuh; jika punya `adminUserRole`, izin mengikuti matriks role.
- **Storage**: `src/lib/storage.ts` (default Local Disk → `public/uploads`, sudah di-ignore). Adapter R2/ImageKit menyusul.
- Perintah: `npm run db:generate`, `npm run db:push`, `npm run db:seed`.
