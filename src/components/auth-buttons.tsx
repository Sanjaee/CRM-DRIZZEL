"use client";

import { signIn, signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-sm text-muted-foreground">Memuat sesi...</p>;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          Halo, {session.user.name ?? session.user.email}
        </span>
        <Button variant="outline" onClick={() => signOut()}>
          Keluar
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => signIn("google", { redirectTo: "/" })}>
      Masuk dengan Google
    </Button>
  );
}
