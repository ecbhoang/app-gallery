import { forwardRef, useEffect, useRef } from "react";
import type { LaunchpadController } from "@hooks/useLaunchpadState";
import { CONTEXT_MENU_MARGIN } from "@lib/constants";
import type { LaunchpadApp } from "@lib/types";
import EditIcon from "@icons/EditIcon";
import EyeIcon from "@icons/EyeIcon";
import OpenIcon from "@icons/OpenIcon";
import CloseIcon from "@icons/CloseIcon";

type ContextMenuProps = {
  controller: LaunchpadController;
};

export const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(
  ({ controller }, forwardedRef) => {
    const elementRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (!elementRef.current || !controller.contextMenu.position) return;
      const menu = elementRef.current;
      const { width, height } = menu.getBoundingClientRect();
      let { x, y } = controller.contextMenu.position;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (x + width + CONTEXT_MENU_MARGIN > viewportWidth) {
        x = viewportWidth - width - CONTEXT_MENU_MARGIN;
      }
      if (y + height + CONTEXT_MENU_MARGIN > viewportHeight) {
        y = viewportHeight - height - CONTEXT_MENU_MARGIN;
      }
      x = Math.max(CONTEXT_MENU_MARGIN, x);
      y = Math.max(CONTEXT_MENU_MARGIN, y);

      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
    }, [controller.contextMenu.position]);

    const setRefs = (node: HTMLDivElement | null) => {
      elementRef.current = node;
      if (!forwardedRef) return;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else {
        forwardedRef.current = node;
      }
    };

    if (!controller.contextMenu.appId || !controller.contextMenu.position) {
      return null;
    }

    const app = findContextTarget(controller);
    if (!app || app.type === "hidden-group") {
      return null;
    }

    return (
      <div
        ref={setRefs}
        className="fixed z-50 min-w-[220px] rounded-2xl border border-white/10 bg-slate-950/95 p-2 text-sm text-slate-100 shadow-xl"
      >
        <button
          type="button"
          className="context-menu-item flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-white/10"
          onClick={() => {
            controller.closeContextMenu();
            controller.openApp(app);
          }}
        >
          <OpenIcon className="h-4 w-4" />
          <span>Open</span>
        </button>
        <button
          type="button"
          className="context-menu-item flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-white/10"
          onClick={() => {
            controller.closeContextMenu();
            if (controller.contextMenu.source === "hidden") {
              controller.showApp(app.id);
            } else {
              controller.hideApp(app.id);
            }
          }}
        >
          <EyeIcon className="h-4 w-4" />
          <span>
            {controller.contextMenu.source === "hidden"
              ? "Show on launchpad"
              : "Hide from launchpad"}
          </span>
        </button>
        {app.origin === "custom" && (
          <button
            type="button"
            className="context-menu-item flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-white/10"
            onClick={() => {
              controller.closeContextMenu();
              controller.openAddApp(app);
            }}
          >
            <EditIcon className="h-4 w-4" />
            <span>Edit</span>
          </button>
        )}
        {app.origin === "custom" && (
          <button
            type="button"
            className="context-menu-item flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-rose-300 hover:bg-rose-500/10"
            onClick={() => {
              controller.closeContextMenu();
              controller.removeCustomApp(app.id);
            }}
          >
            <CloseIcon className="h-4 w-4" />
            <span>Delete</span>
          </button>
        )}
      </div>
    );
  }
);

ContextMenu.displayName = "ContextMenu";

function findContextTarget(controller: LaunchpadController): LaunchpadApp | null {
  const appId = controller.contextMenu.appId;
  if (!appId) return null;
  return (
    controller.catalogApps.find((item) => item.id === appId) ??
    controller.hiddenApps.find((item) => item.id === appId) ??
    null
  );
}
