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
  isDimmed: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onContextMenu: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp: () => void;
  onFocus: () => void;
  glassTint: GlassTintStyle;
  layoutVariant: "grid" | "list";
};

export function AppCard({
  app,
  isActive,
  isDimmed,
  onClick,
  onDoubleClick,
  onContextMenu,
  onPointerDown,
  onPointerUp,
  onFocus,
  glassTint,
  layoutVariant,
}: AppCardProps) {
  const classes = clsx(
    "app-card group select-none rounded-2xl text-slate-100 transition-all duration-300 focus-visible:outline-none focus-visible:ring-0",
    layoutVariant === "grid" &&
      "flex flex-col items-center justify-center gap-3 sm:px-4 sm:py-2 hover:-translate-y-1",
    layoutVariant === "list" &&
      "flex w-full items-center gap-4 px-4 py-3 text-left hover:border-white/20",
    layoutVariant === "grid" && isActive && "translate-y-1 scale-105",
    layoutVariant === "list" && isActive && "shadow-lg",
    isDimmed && "pointer-events-none opacity-40 blur-sm"
  );

  const iconWrapperClasses = clsx(
    "relative flex items-center justify-center border border-white/10 bg-white/10 transition duration-300",
    layoutVariant === "grid" && "h-16 w-16 rounded-3xl p-3 group-hover:scale-105",
    layoutVariant === "list" && "h-12 w-12 rounded-2xl p-2 group-hover:scale-105 flex-shrink-0"
  );

  const labelClasses = clsx(
    "truncate text-sm font-medium",
    layoutVariant === "grid" && "max-w-full text-center",
    layoutVariant === "list" && "flex-1 text-left h-full items-center justify-start flex border-b border-white/10"
  );

  return (
    <button
      type="button"
      className={classes}
      disabled={isDimmed}
      aria-disabled={isDimmed}
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
        className={iconWrapperClasses}
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
        {app.type === "hidden-group" && (
          <span className="text-xs text-center text-slate-400 absolute -top-2 -right-2 pointer-events-none aspect-square w-8 h-8 mx-auto z-30 rounded-full bg-slate-950/20 p-2 text-[10px] font-medium uppercase tracking-[0.24em] text-slate-200/25 backdrop-blur-md">
            {app.hiddenCount}
          </span>
        )}
      </span>
      <span className={labelClasses}>{app.name}</span>
    </button>
  );
}
