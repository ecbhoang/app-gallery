import { useIsPwa } from "@/hooks/useIsPwa";
import { APP_VERSION } from "@lib/version";

export function VersionBadge(): JSX.Element {
  const isPwa = useIsPwa();

  return (
    <button className="pointer-events-none w-fit mx-auto my-2 z-30 rounded-full bg-slate-950/20 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-slate-200/25 backdrop-blur-md">
      {isPwa ? `P_${APP_VERSION}` : `v${APP_VERSION}`}
    </button>
  );
}
