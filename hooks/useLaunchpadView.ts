import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { getEffectivePageSize, paginateApps } from "@lib/apps";
import {
  LONG_PRESS_DURATION_MS,
  SCROLL_PAGE_THRESHOLD,
  BASE_PATH,
} from "@lib/constants";
import type { LaunchpadApp } from "@lib/types";
import type { LaunchpadController } from "@hooks/useLaunchpadState";

type PointerInfo = {
  pointerId: number;
  startX: number;
};

export type GlassTintStyle = CSSProperties & {
  ["--glass-bg"]: string;
  ["--glass-border"]: string;
};

type LaunchpadCardSource = "grid" | "hidden";

type UseLaunchpadViewParams = {
  controller: LaunchpadController;
  isMobileLayout: boolean;
  searchRef: RefObject<HTMLInputElement>;
  pagesWrapperRef: RefObject<HTMLDivElement>;
  gridViewportRef: RefObject<HTMLDivElement>;
  contextMenuRef: RefObject<HTMLDivElement>;
};

type UseLaunchpadViewResult = {
  overlayStyle: CSSProperties;
  glassTint: GlassTintStyle;
  pages: LaunchpadApp[][];
  handleCardContextMenu: (
    event: ReactMouseEvent<HTMLButtonElement>,
    app: LaunchpadApp,
    source: LaunchpadCardSource
  ) => void;
  handleCardPointerDown: (
    event: ReactPointerEvent<HTMLButtonElement>,
    app: LaunchpadApp,
    source: LaunchpadCardSource
  ) => void;
  handleCardPointerUp: () => void;
};

export function useLaunchpadView({
  controller,
  isMobileLayout,
  searchRef,
  pagesWrapperRef,
  gridViewportRef,
  contextMenuRef,
}: UseLaunchpadViewParams): UseLaunchpadViewResult {
  const {
    settings,
    modals,
    contextMenu,
    filteredApps,
    totalPages,
    desktopPageSize,
    currentPage,
    activeIndex,
    openContextMenu,
  closeContextMenu,
  closeSettings,
  closeAddApp,
  closeHiddenApps,
  setPage,
  openApp,
  setSearchTerm,
  resetActiveIndex,
  advanceActiveIndex,
} = controller;

  const longPressTimerRef = useRef<number | null>(null);
  const pointerInfoRef = useRef<PointerInfo | null>(null);
  const wheelAccumulatorRef = useRef(0);

  const overlayStyle = useMemo<CSSProperties>(() => {
    return {
      backgroundColor: `rgba(15, 23, 42, ${settings.overlayOpacity.toFixed(2)})`,
      backdropFilter: `blur(${settings.blurStrength}px)`,
    };
  }, [settings.overlayOpacity, settings.blurStrength]);

  const glassTint = useMemo<GlassTintStyle>(() => {
    return {
      ["--glass-bg" as const]: `color-mix(in oklab, ${settings.glassTintColor} ${
        settings.glassTintOpacity * 100
      }%, transparent)`,
      ["--glass-border" as const]: `color-mix(in oklab, ${settings.glassTintColor} 70%, white)`,
    };
  }, [settings.glassTintColor, settings.glassTintOpacity]);

  const pages = useMemo(() => {
    const effectivePageSize = getEffectivePageSize(
      isMobileLayout,
      filteredApps.length,
      desktopPageSize
    );
    if (isMobileLayout) {
      return [filteredApps];
    }
    return Array.from({ length: totalPages }, (_, index) =>
      paginateApps(filteredApps, index, effectivePageSize)
    );
  }, [filteredApps, totalPages, desktopPageSize, isMobileLayout]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.body;
    if (settings.backgroundType === "color") {
      body.style.backgroundImage = "none";
      body.style.backgroundColor = settings.backgroundColor;
    } else {
      body.style.backgroundImage = settings.backgroundImage
        ? `url(${settings.backgroundImage})`
        : "none";
      body.style.backgroundColor = settings.backgroundColor;
      body.style.backgroundPosition = "center";
      body.style.backgroundRepeat = "no-repeat";
      body.style.backgroundSize = "cover";
      body.style.backgroundAttachment = "fixed";
    }
    return () => {
      body.style.backgroundImage = "";
      body.style.backgroundColor = "";
      body.style.backgroundPosition = "";
      body.style.backgroundRepeat = "";
      body.style.backgroundSize = "";
      body.style.backgroundAttachment = "";
    };
  }, [
    settings.backgroundType,
    settings.backgroundImage,
    settings.backgroundColor,
  ]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const hasModalOpen = modals.settings || modals.addApp || modals.hiddenApps;
    if (hasModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [modals.settings, modals.addApp, modals.hiddenApps]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register(`${BASE_PATH}/service-worker.js`)
        .catch((error) => {
          console.warn("Service worker registration failed", error);
        });
    }
  }, []);

  useEffect(() => {
    if (!pagesWrapperRef.current) return;
    if (isMobileLayout) {
      pagesWrapperRef.current.style.transform = "none";
      return;
    }
    pagesWrapperRef.current.style.transform = `translateX(-${currentPage * 100}%)`;
  }, [currentPage, isMobileLayout, pagesWrapperRef]);

  useEffect(() => {
    const viewport = gridViewportRef.current;
    if (!viewport) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (isMobileLayout) return;
      if (!gridViewportRef.current?.contains(event.target as Node)) return;
      pointerInfoRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
      };
      try {
        viewport.setPointerCapture(event.pointerId);
      } catch {
        // Ignore pointer capture failures
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      const info = pointerInfoRef.current;
      if (!info || info.pointerId !== event.pointerId) return;
      if (isMobileLayout) {
        pointerInfoRef.current = null;
        return;
      }
      const delta = event.clientX - info.startX;
      if (Math.abs(delta) > SCROLL_PAGE_THRESHOLD) {
        setPage(delta < 0 ? currentPage + 1 : currentPage - 1);
      }
      pointerInfoRef.current = null;
    };

    const handlePointerCancel = () => {
      pointerInfoRef.current = null;
    };

    viewport.addEventListener("pointerdown", handlePointerDown, { passive: true });
    viewport.addEventListener("pointerup", handlePointerUp, { passive: true });
    viewport.addEventListener("pointercancel", handlePointerCancel, {
      passive: true,
    });

    return () => {
      viewport.removeEventListener("pointerdown", handlePointerDown);
      viewport.removeEventListener("pointerup", handlePointerUp);
      viewport.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [gridViewportRef, isMobileLayout, setPage, currentPage]);

  useEffect(() => {
    const viewport = gridViewportRef.current;
    if (!viewport) return;

    const handleWheel = (event: WheelEvent) => {
      if (isMobileLayout) return;
      if (!gridViewportRef.current?.contains(event.target as Node)) return;
      const dominantDelta =
        Math.abs(event.deltaX) >= Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      if (!dominantDelta) return;
      event.preventDefault();
      wheelAccumulatorRef.current += dominantDelta;
      if (Math.abs(wheelAccumulatorRef.current) < SCROLL_PAGE_THRESHOLD * 2) {
        return;
      }
      setPage(
        wheelAccumulatorRef.current > 0 ? currentPage + 1 : currentPage - 1
      );
      wheelAccumulatorRef.current = 0;
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener("wheel", handleWheel);
    };
  }, [gridViewportRef, isMobileLayout, setPage, currentPage]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const hasModalOpen = modals.settings || modals.addApp || modals.hiddenApps;
      if (hasModalOpen) {
        if (event.key === "Escape") {
          event.preventDefault();
          if (modals.settings) {
            closeSettings();
          } else if (modals.addApp) {
            closeAddApp();
          } else if (modals.hiddenApps) {
            closeHiddenApps();
          }
        }
        return;
      }

      if (contextMenu.appId && event.key === "Escape") {
        event.preventDefault();
        closeContextMenu();
        return;
      }

      const searchElement = searchRef.current;
      const isSearchFocused = document.activeElement === searchElement;
      const normalizedKey = event.key.toLowerCase();

      if ((event.metaKey || event.ctrlKey) && normalizedKey === "k") {
        event.preventDefault();
        searchElement?.focus({ preventScroll: true });
        searchElement?.select();
        return;
      }

      if (event.key === "Escape" && searchElement) {
        if (searchElement.value !== "") {
          setSearchTerm("");
          searchElement.value = "";
          resetActiveIndex();
        }
        return;
      }

      if (event.key === "Tab") {
        event.preventDefault();
        advanceActiveIndex(event.shiftKey ? -1 : 1);
        return;
      }

      if (event.key === "Enter" && !isSearchFocused) {
        const app = filteredApps[activeIndex];
        if (app) {
          openApp(app);
        }
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setPage(currentPage + 1);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setPage(currentPage - 1);
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if ((event.key === "Backspace" || event.key === "Delete") && !isSearchFocused) {
        event.preventDefault();
        if (!searchElement) return;
        const currentValue = searchElement.value ?? "";
        if (!currentValue) return;
        const nextValue =
          event.key === "Backspace"
            ? currentValue.slice(0, -1)
            : currentValue.slice(1);
        setSearchTerm(nextValue);
        searchElement.value = nextValue;
        return;
      }

      if (event.key.length === 1 && !event.isComposing && !isSearchFocused) {
        event.preventDefault();
        if (!searchElement) return;
        const nextValue = `${searchElement.value ?? ""}${event.key}`;
        setSearchTerm(nextValue);
        searchElement.value = nextValue;
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [
    modals.settings,
    modals.addApp,
    modals.hiddenApps,
    closeSettings,
    closeAddApp,
    closeHiddenApps,
    contextMenu.appId,
    closeContextMenu,
    searchRef,
    setSearchTerm,
    resetActiveIndex,
    advanceActiveIndex,
    filteredApps,
    activeIndex,
    openApp,
    setPage,
    currentPage,
  ]);

  useEffect(() => {
    const handleGlobalPointerDown = (event: PointerEvent) => {
      if (!contextMenu.appId) return;
      if (contextMenuRef.current?.contains(event.target as Node)) {
        return;
      }
      closeContextMenu();
    };

    window.addEventListener("pointerdown", handleGlobalPointerDown);
    window.addEventListener("blur", closeContextMenu);
    window.addEventListener("scroll", closeContextMenu, true);
    return () => {
      window.removeEventListener("pointerdown", handleGlobalPointerDown);
      window.removeEventListener("blur", closeContextMenu);
      window.removeEventListener("scroll", closeContextMenu, true);
    };
  }, [contextMenu.appId, contextMenuRef, closeContextMenu]);

  const handleCardContextMenu = useCallback(
    (
      event: ReactMouseEvent<HTMLButtonElement>,
      app: LaunchpadApp,
      source: LaunchpadCardSource
    ) => {
      event.preventDefault();
      openContextMenu(app, source, {
        x: event.clientX,
        y: event.clientY,
      });
    },
    [openContextMenu]
  );

  const handleCardPointerDown = useCallback(
    (
      event: ReactPointerEvent<HTMLButtonElement>,
      app: LaunchpadApp,
      source: LaunchpadCardSource
    ) => {
      if (event.pointerType === "mouse") return;
      if (longPressTimerRef.current) {
        window.clearTimeout(longPressTimerRef.current);
      }
      longPressTimerRef.current = window.setTimeout(() => {
        openContextMenu(app, source, {
          x: event.clientX,
          y: event.clientY,
        });
      }, LONG_PRESS_DURATION_MS);
    },
    [openContextMenu]
  );

  const handleCardPointerUp = useCallback(() => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const handleContextMenu = (event: MouseEvent) => {
      if (event.defaultPrevented) return;

      const path = event.composedPath();
      const allowsCustomMenu = path.some(
        (node) =>
          node instanceof HTMLElement &&
          (node.dataset.appId || node.dataset.launchpadContextMenu === "allow")
      );

      if (allowsCustomMenu) {
        return;
      }

      event.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu, {
      capture: true,
    });
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, {
        capture: true,
      } as EventListenerOptions);
    };
  }, []);

  return {
    overlayStyle,
    glassTint,
    pages,
    handleCardContextMenu,
    handleCardPointerDown,
    handleCardPointerUp,
  };
}
