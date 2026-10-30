import { AuthButtons } from "@/components/auth-buttons";
import { Counter } from "@/components/counter";
import { FontFamilyInfo } from "@/components/font-family-info";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 p-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Next.js + Drizzle + NextAuth + Zustand
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Starter siap pakai. Ubah <code>src/app/page.tsx</code> untuk mulai
          membangun.
        </p>
        <FontFamilyInfo />
      </header>

      <section className="flex flex-col items-center gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Auth
        </h2>
        <AuthButtons />
      </section>

      <section className="flex flex-col items-center gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Zustand (tersimpan di localStorage)
        </h2>
        <Counter />
      </section>
    </main>
  );
}
