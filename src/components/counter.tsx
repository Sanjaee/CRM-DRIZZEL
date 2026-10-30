"use client";

import { Button } from "@/components/ui/button";
import { useCounterStore } from "@/store/use-counter-store";

export function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="icon" onClick={decrement}>
        -
      </Button>
      <span className="min-w-8 text-center font-mono text-lg tabular-nums">
        {count}
      </span>
      <Button variant="outline" size="icon" onClick={increment}>
        +
      </Button>
      <Button variant="ghost" size="sm" onClick={reset}>
        Reset
      </Button>
    </div>
  );
}
