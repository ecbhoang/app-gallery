import clsx from "clsx";

type LoadingOverlayProps = {
  visible: boolean;
};

export function LoadingOverlay({ visible }: LoadingOverlayProps) {
  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-3xl transition-opacity duration-500",
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="loading-dot h-3 w-3 animate-bounce rounded-full bg-slate-100" />
        <span
          className="loading-dot h-3 w-3 animate-bounce rounded-full bg-slate-100"
          style={{ animationDelay: "-0.16s" }}
        />
        <span
          className="loading-dot h-3 w-3 animate-bounce rounded-full bg-slate-100"
          style={{ animationDelay: "-0.32s" }}
        />
      </div>
    </div>
  );
}
