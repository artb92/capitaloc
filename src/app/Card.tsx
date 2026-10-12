import type { ReactNode } from "react";

/** Panel floating over the dimmed map. */
export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink-950/40 p-4 backdrop-blur-[2px]">
      <div className="max-h-full w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 text-ink-900 shadow-[0_30px_80px_-24px_rgb(13_30_44/0.7)] motion-safe:animate-rise sm:p-8">
        {children}
      </div>
    </div>
  );
}
