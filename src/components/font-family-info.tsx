"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

const getSnapshot = () =>
  getComputedStyle(document.documentElement).fontFamily;

const getServerSnapshot = () => null;

export function FontFamilyInfo() {
  const family = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <p className="text-sm text-muted-foreground">
      Font terdeteksi:{" "}
      <span className="font-mono text-foreground">
        {family ?? "mendeteksi..."}
      </span>
    </p>
  );
}
