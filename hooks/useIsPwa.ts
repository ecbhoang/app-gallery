import { useEffect, useState } from "react";
import { isPwaEnvironment, subscribeToPwaChanges } from "@lib/pwa";

/**
 * React hook that reports whether the app is running as an installed PWA
 * across supported browsers and platforms.
 */
export function useIsPwa(): boolean {
  const [isPwa, setIsPwa] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return isPwaEnvironment();
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const update = () => setIsPwa(isPwaEnvironment());
    const unsubscribe = subscribeToPwaChanges(update);

    // Initial sync in case environment changed between render and effect.
    update();

    return () => {
      unsubscribe();
    };
  }, []);

  return isPwa;
}
