/* eslint-disable @next/next/no-img-element */
import clsx from "clsx";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import type { LaunchpadApp } from "@lib/types";
import { DEFAULT_ICON } from "@lib/constants";
import type { GlassTintStyle } from "@hooks/useLaunchpadView";

type AppCardProps = {
  app: LaunchpadApp;
  isActive: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onContextMenu: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp: () => void;
  onFocus: () => void;
  glassTint: GlassTintStyle;
};

export function AppCard({
  app,
  isActive,
  onClick,
  onDoubleClick,
  onContextMenu,
  onPointerDown,
  onPointerUp,
  onFocus,
  glassTint,
}: AppCardProps) {
  const classes = clsx(
    "app-card group flex select-none flex-col items-center justify-center gap-3 rounded-2xl px-4 py-6 text-slate-100 transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-0",
    isActive && "translate-y-1 scale-105"
  );

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onPointerCancel={onPointerUp}
      onFocus={onFocus}
      data-app-id={app.id}
    >
      <span
        className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/10 p-3 transition duration-300 group-hover:scale-105"
        style={glassTint}
      >
        <img
          src={app.icon}
          alt={`${app.name} icon`}
          className="h-full w-full rounded-xl object-contain"
          onError={(event) => {
            event.currentTarget.src = DEFAULT_ICON;
          }}
        />
      </span>
      <span className="max-w-full truncate text-center text-sm font-medium">
        {app.name}
      </span>
      {app.type === "hidden-group" && (
        <span className="text-xs text-slate-400">
          {app.hiddenCount} hidden
        </span>
      )}
    </button>
  );
}
