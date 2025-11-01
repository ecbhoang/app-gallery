"use client";

import { useEffect, useRef, useState } from "react";
import { useLaunchpadState } from "@hooks/useLaunchpadState";
import { useLaunchpadView } from "@hooks/useLaunchpadView";
import { useMediaQuery } from "@hooks/useMediaQuery";
import { MOBILE_BREAKPOINT, VERSION_STORAGE_KEY } from "@lib/constants";
import { APP_VERSION } from "@lib/version";
import { AppCard } from "@components/launchpad/AppCard";
import { ContextMenu } from "@components/launchpad/ContextMenu";
import { EmptyState } from "@components/launchpad/EmptyState";
import { ErrorBanner } from "@components/launchpad/ErrorBanner";
import { HiddenAppsModal } from "@components/launchpad/HiddenAppsModal";
import { LaunchpadHeader } from "@components/launchpad/Header";
import { LoadingOverlay } from "@components/launchpad/LoadingOverlay";
import { PaginationDots } from "@components/launchpad/PaginationDots";
import { AddAppModal } from "@components/launchpad/AddAppModal";
import { SettingsModal } from "@components/launchpad/SettingsModal";
import { VersionBadge } from "@components/launchpad/VersionBadge";
import { ChangeLogModal } from "@components/launchpad/ChangeLogModal";

export function LaunchpadApp(): JSX.Element {
  const isMobileLayout = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);
  const controller = useLaunchpadState(isMobileLayout);

  const searchRef = useRef<HTMLInputElement>(null);
  const pagesWrapperRef = useRef<HTMLDivElement>(null);
  const gridViewportRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [isChangeLogOpen, setIsChangeLogOpen] = useState(false);

  const {
    overlayStyle,
    glassTint,
    pages,
    handleCardContextMenu,
    handleCardPointerDown,
    handleCardPointerUp,
  } = useLaunchpadView({
    controller,
    isMobileLayout,
    searchRef,
    pagesWrapperRef,
    gridViewportRef,
    contextMenuRef,
  });

  const {
    filteredApps,
    activeIndex,
    openApp,
    setActiveIndex,
    setSearchTerm,
    searchTerm,
    currentPage,
    totalPages,
    setPage,
    desktopPageSize,
    closeContextMenu,
    contextMenu,
  } = controller;

  const isContextMenuOpen = Boolean(contextMenu.appId);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cachedVersion = window.localStorage.getItem(VERSION_STORAGE_KEY);
    if (cachedVersion !== APP_VERSION) {
      setIsChangeLogOpen(true);
    }
  }, []);

  const handleCloseChangeLog = () => {
    setIsChangeLogOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
    }
  };

  return (
    <div className="relative min-h-screen w-full select-none">
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-500"
        style={overlayStyle}
      />

      <LoadingOverlay visible={controller.isLoading} />

      <main className="relative z-10 flex min-h-screen w-full flex-col items-center px-4 pb-8 pt-12 sm:pt-16">
        <LaunchpadHeader
          searchRef={searchRef}
          defaultValue={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenAddApp={controller.openAddApp}
          onOpenSettings={controller.openSettings}
          glassTint={glassTint}
        />

        {controller.error && <ErrorBanner message={controller.error.message} />}

        <section
          ref={gridViewportRef}
          className="relative flex w-full max-w-5xl flex-1 flex-col gap-10 overflow-hidden"
        >
          <div
            ref={pagesWrapperRef}
            className={`flex flex-1 transition-transform duration-500 ease-out ${
              isMobileLayout ? "flex-col" : "flex-row"
            }`}
          >
            {pages.map((page, pageIndex) => (
              <div
                key={pageIndex}
                className={`flex w-full items-stretch justify-center ${
                  isMobileLayout ? "" : "h-full shrink-0"
                }`}
              >
                <div
                  className={`grid w-full gap-6 ${
                    isMobileLayout
                      ? "grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-7"
                      : "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-7"
                  }`}
                >
                  {page.map((app, index) => {
                    const globalIndex = isMobileLayout
                      ? index
                      : pageIndex * desktopPageSize + index;
                    const isActive = activeIndex === globalIndex;
                    return (
                      <AppCard
                        key={app.id}
                        app={app}
                        isActive={isActive}
                        onClick={() => openApp(app)}
                        onDoubleClick={() => openApp(app)}
                        onContextMenu={(event) =>
                          handleCardContextMenu(event, app, "grid")
                        }
                        onPointerDown={(event) =>
                          handleCardPointerDown(event, app, "grid")
                        }
                        onPointerUp={handleCardPointerUp}
                        onFocus={() => setActiveIndex(globalIndex)}
                        glassTint={glassTint}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <PaginationDots
            currentPage={currentPage}
            totalPages={totalPages}
            onNavigate={setPage}
            hidden={isMobileLayout || totalPages <= 1}
          />

          <EmptyState visible={filteredApps.length === 0} />
        </section>
      </main>

      <SettingsModal controller={controller} />
      <AddAppModal controller={controller} />
      <HiddenAppsModal
        controller={controller}
        onContextMenu={handleCardContextMenu}
        onPointerDown={handleCardPointerDown}
        onPointerUp={handleCardPointerUp}
        glassTint={glassTint}
      />
      {isContextMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onPointerDown={closeContextMenu}
          onContextMenu={(event) => event.preventDefault()}
        />
      )}
      <ContextMenu controller={controller} ref={contextMenuRef} />
      <VersionBadge />
      <ChangeLogModal
        version={APP_VERSION}
        open={isChangeLogOpen}
        onClose={handleCloseChangeLog}
      />
    </div>
  );
}
