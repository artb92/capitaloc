import { useEffect, useState } from "react";

/** Current time, refreshed every animation frame while `active`, otherwise every second. */
export function useNow(active: boolean, onFrame?: () => void): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) {
      const id = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(id);
    }
    let raf = 0;
    const loop = () => {
      onFrame?.();
      setNow(Date.now());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, onFrame]);
  return now;
}
