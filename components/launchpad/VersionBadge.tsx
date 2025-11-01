import { APP_VERSION } from "@lib/version";

export function VersionBadge(): JSX.Element {
  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-30 rounded-full bg-slate-950/20 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-slate-200/25 backdrop-blur-md">
      v{APP_VERSION}
    </div>
  );
}
