"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const error = searchParams.get("error");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Masuk</h1>
        <p className="text-sm text-muted-foreground">
          Gunakan akun Google untuk melanjutkan.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          Gagal autentikasi ({error}). Silakan coba masuk kembali.
        </div>
      )}

      <Button onClick={() => signIn("google", { redirectTo: callbackUrl })}>
        Masuk dengan Google
      </Button>
    </div>
  );
}