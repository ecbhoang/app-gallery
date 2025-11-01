/* eslint-disable @next/next/no-img-element */
import clsx from "clsx";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import type { LaunchpadController } from "@hooks/useLaunchpadState";
import type { GlassTintStyle } from "@hooks/useLaunchpadView";
import type { LaunchpadApp } from "@lib/types";
import { DEFAULT_ICON } from "@lib/constants";
import CloseIcon from "@icons/CloseIcon";
import { Modal } from "@components/launchpad/Modal";

type HiddenAppsModalProps = {
  controller: LaunchpadController;
  onContextMenu: (
    event: ReactMouseEvent<HTMLButtonElement>,
    app: LaunchpadApp,
    source: "hidden"
  ) => void;
  onPointerDown: (
    event: ReactPointerEvent<HTMLButtonElement>,
    app: LaunchpadApp,
    source: "hidden"
  ) => void;
  onPointerUp: () => void;
  glassTint: GlassTintStyle;
};

export function HiddenAppsModal({
  controller,
  onContextMenu,
  onPointerDown,
  onPointerUp,
  glassTint,
}: HiddenAppsModalProps) {
  const isContextMenuOpen = Boolean(controller.contextMenu.appId);
  const shouldDimHiddenItems =
    isContextMenuOpen && controller.contextMenu.source === "hidden";
  const contextMenuTargetId = controller.contextMenu.appId;

  return (
    <Modal
      open={controller.modals.hiddenApps}
      onClose={() => controller.closeHiddenApps()}
      ariaLabel="Hidden applications"
    >
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Hidden applications</h2>
            <p className="text-xs text-slate-400">
              Restore apps to the main launchpad at any time.
            </p>
          </div>
          <button
            type="button"
            onClick={() => controller.closeHiddenApps()}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-6">
          {controller.hiddenApps.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/20 bg-slate-900/40 px-4 py-6 text-center text-sm text-slate-400">
              No hidden apps yet.
            </div>
          ) : (
            <div className="grid gap-3">
              {controller.hiddenApps.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  className={clsx(
                    "group flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-left transition hover:border-white/20 hover:bg-slate-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40",
                    shouldDimHiddenItems &&
                      app.id !== contextMenuTargetId &&
                      "pointer-events-none opacity-40 blur-sm"
                  )}
                  disabled={
                    shouldDimHiddenItems && app.id !== contextMenuTargetId
                  }
                  aria-disabled={
                    shouldDimHiddenItems && app.id !== contextMenuTargetId
                  }
                  onClick={() => controller.showApp(app.id)}
                  onContextMenu={(event) => onContextMenu(event, app, "hidden")}
                  onPointerDown={(event) => onPointerDown(event, app, "hidden")}
                  onPointerUp={onPointerUp}
                  onPointerLeave={onPointerUp}
                  onPointerCancel={onPointerUp}
                  data-app-id={app.id}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-2"
                      style={glassTint}
                    >
                      <img
                        src={app.icon}
                        alt=""
                        className="h-full w-full object-contain"
                        onError={(event) => {
                          event.currentTarget.src = DEFAULT_ICON;
                        }}
                      />
                    </span>
                    <div>
                      <div className="font-medium text-slate-100">{app.name}</div>
                      {app.description && (
                        <div className="text-xs text-slate-400">{app.description}</div>
                      )}
                    </div>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    Show
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
