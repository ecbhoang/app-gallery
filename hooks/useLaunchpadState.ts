import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCatalogApps } from "@lib/api";
import {
  buildHiddenAppsGroup,
  filterApps,
  getIconLibrary,
  getTotalPages,
  splitApps,
} from "@lib/apps";
import { DEFAULT_ICON, defaultSettings, defaultUserData } from "@lib/constants";
import {
  createSlugId,
  dedupeHiddenIds,
  ensureUniqueAppIds,
  normalizePageSize,
  parseCustomTagString,
  sanitizeAppRecord,
  sanitizeHttpUrl,
  sanitizeIconSource,
  updateSettingsFromForm,
} from "@lib/utils";
import {
  loadSettingsFromStorage,
  loadUserDataFromStorage,
  saveSettingsToStorage,
  saveUserDataToStorage,
} from "@lib/storage";
import type {
  LaunchpadApp,
  LaunchpadContextMenuState,
  LaunchpadSettings,
  LaunchpadUserData,
} from "@lib/types";

type ContextMenuSource = "grid" | "hidden";

export type LaunchpadError = {
  message: string;
};

export type CustomAppInput = {
  id?: string;
  name: string;
  url: string;
  description?: string;
  tagsInput?: string;
  iconChoice?: string;
  iconCustom?: string;
};

export type SettingsFormInput = {
  backgroundType: "image" | "color";
  backgroundImageChoice: string;
  backgroundImageCustom?: string;
  backgroundColor: string;
  overlayOpacity: number;
  blurStrength: number;
  glassTintColor: string;
  glassTintOpacity: number;
  pageSize: number;
};

type LaunchpadModalState = {
  settings: boolean;
  addApp: boolean;
  hiddenApps: boolean;
};

type HydrationState = "pending" | "ready";

export type LaunchpadController = {
  hydration: HydrationState;
  settings: LaunchpadSettings;
  userData: LaunchpadUserData;
  catalogApps: LaunchpadApp[];
  visibleApps: LaunchpadApp[];
  hiddenApps: LaunchpadApp[];
  filteredApps: LaunchpadApp[];
  searchTerm: string;
  currentPage: number;
  totalPages: number;
  activeIndex: number;
  isLoading: boolean;
  error: LaunchpadError | null;
  modals: LaunchpadModalState;
  contextMenu: LaunchpadContextMenuState;
  editingApp: LaunchpadApp | null;
  iconLibrary: string[];
  desktopPageSize: number;
  setSearchTerm: (term: string) => void;
  setPage: (page: number) => void;
  setActiveIndex: (index: number) => void;
  advanceActiveIndex: (delta: number) => void;
  openApp: (app: LaunchpadApp) => void;
  openSettings: () => void;
  closeSettings: (options?: { markCompleted?: boolean }) => void;
  submitSettings: (input: SettingsFormInput) => void;
  openAddApp: (app?: LaunchpadApp | null) => void;
  closeAddApp: () => void;
  submitCustomApp: (input: CustomAppInput) => { success: boolean; message?: string };
  openHiddenApps: () => void;
  closeHiddenApps: () => void;
  hideApp: (appId: string) => void;
  showApp: (appId: string) => void;
  openContextMenu: (
    app: LaunchpadApp,
    source: ContextMenuSource,
    position: { x: number; y: number }
  ) => void;
  closeContextMenu: () => void;
  resetActiveIndex: () => void;
};

const initialContextMenu: LaunchpadContextMenuState = {
  appId: null,
  source: null,
  position: null,
};

function findAppById(apps: LaunchpadApp[], id: string | null): LaunchpadApp | null {
  if (!id) return null;
  return apps.find((app) => app.id === id) ?? null;
}

export function useLaunchpadState(isMobileLayout: boolean): LaunchpadController {
  const [hydration, setHydration] = useState<HydrationState>("pending");
  const [settings, setSettings] = useState<LaunchpadSettings>({
    ...defaultSettings,
  });
  const [userData, setUserData] = useState<LaunchpadUserData>({
    ...defaultUserData,
  });
  const [baseCatalog, setBaseCatalog] = useState<LaunchpadApp[]>([]);
  const [searchTerm, setSearchTermState] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [activeIndex, setActiveIndexState] = useState(-1);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<LaunchpadError | null>(null);
  const [modals, setModals] = useState<LaunchpadModalState>({
    settings: false,
    addApp: false,
    hiddenApps: false,
  });
  const [contextMenu, setContextMenu] =
    useState<LaunchpadContextMenuState>(initialContextMenu);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);

  useEffect(() => {
    setHydration("ready");
    setSettings(loadSettingsFromStorage());
    const storedUserData = loadUserDataFromStorage();
    setUserData(storedUserData);
  }, []);

  useEffect(() => {
    if (hydration !== "ready") return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const catalog = await fetchCatalogApps();
        if (cancelled) return;
        setBaseCatalog(catalog);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Unknown error loading apps";
        setError({ message });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [hydration]);

  const catalogApps = useMemo(() => {
    const allApps = [...baseCatalog, ...userData.customApps];
    return ensureUniqueAppIds(
      allApps.map((app) => ({
        ...app,
        origin: app.origin ?? "catalog",
      }))
    );
  }, [baseCatalog, userData.customApps]);

  const { visible: visibleApps, hidden: hiddenApps } = useMemo(
    () => splitApps(catalogApps, userData.hiddenAppIds),
    [catalogApps, userData.hiddenAppIds]
  );

  const filteredVisibleApps = useMemo(
    () => filterApps(visibleApps, searchTerm),
    [visibleApps, searchTerm]
  );

  const filteredApps = useMemo(() => {
    if (searchTerm.trim().length === 0 && hiddenApps.length > 0) {
      return [...filteredVisibleApps, buildHiddenAppsGroup(hiddenApps.length)];
    }
    return filteredVisibleApps;
  }, [filteredVisibleApps, hiddenApps.length, searchTerm]);

  const totalPages = useMemo(
    () =>
      getTotalPages(
        filteredApps,
        isMobileLayout,
        userData.pageSize ?? defaultUserData.pageSize
      ),
    [filteredApps, isMobileLayout, userData.pageSize]
  );

  useEffect(() => {
    setCurrentPage((previous) => {
      if (isMobileLayout) return 0;
      if (previous >= totalPages) {
        return Math.max(totalPages - 1, 0);
      }
      return previous;
    });
  }, [totalPages, isMobileLayout]);

  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setActiveIndexState(-1);
      return;
    }
    if (filteredApps.length > 0) {
      setActiveIndexState(0);
    } else {
      setActiveIndexState(-1);
    }
  }, [filteredApps.length, searchTerm]);

  useEffect(() => {
    if (contextMenu.appId) {
      const stillExists =
        findAppById(catalogApps, contextMenu.appId) !== null ||
        findAppById(hiddenApps, contextMenu.appId) !== null;
      if (!stillExists) {
        setContextMenu(initialContextMenu);
      }
    }
  }, [catalogApps, hiddenApps, contextMenu.appId]);

  const iconLibrary = useMemo(
    () => getIconLibrary(catalogApps),
    [catalogApps]
  );

  const desktopPageSize = useMemo(
    () => normalizePageSize(userData.pageSize),
    [userData.pageSize]
  );

  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
    setCurrentPage(0);
  }, []);

  const setPage = useCallback(
    (page: number) => {
      if (isMobileLayout) {
        setCurrentPage(0);
        return;
      }
      const clamped = Math.min(Math.max(page, 0), totalPages - 1);
      setCurrentPage(clamped);
    },
    [isMobileLayout, totalPages]
  );

  const setActiveIndex = useCallback(
    (index: number) => {
      if (!filteredApps.length) {
        setActiveIndexState(-1);
        return;
      }
      const maxIndex = filteredApps.length - 1;
      const clamped = Math.min(Math.max(index, 0), maxIndex);
      setActiveIndexState(clamped);

      if (!isMobileLayout && filteredApps.length > 0) {
        const perPage = desktopPageSize;
        const targetPage = Math.floor(clamped / perPage);
        setCurrentPage(targetPage);
      }
    },
    [filteredApps, isMobileLayout, desktopPageSize]
  );

  const advanceActiveIndex = useCallback(
    (delta: number) => {
      if (!filteredApps.length) return;
      setActiveIndexState((previous) => {
        if (previous === -1) {
          const next = delta > 0 ? 0 : filteredApps.length - 1;
          if (!isMobileLayout) {
            const perPage = desktopPageSize;
            setCurrentPage(Math.floor(next / perPage));
          }
          return next;
        }
        const nextIndex =
          (previous + delta + filteredApps.length) % filteredApps.length;
        if (!isMobileLayout) {
          const perPage = desktopPageSize;
          setCurrentPage(Math.floor(nextIndex / perPage));
        }
        return nextIndex;
      });
    },
    [filteredApps, isMobileLayout, desktopPageSize]
  );

  const openApp = useCallback((app: LaunchpadApp) => {
    if (!app) return;
    if (app.type === "hidden-group") {
      setModals((prev) => ({ ...prev, hiddenApps: true }));
      return;
    }
    if (app.url) {
      window.open(app.url, "_blank", "noopener,noreferrer");
    }
  }, []);

  const openSettings = useCallback(() => {
    setModals((prev) => ({ ...prev, settings: true }));
  }, []);

  const closeSettings = useCallback(
    (options?: { markCompleted?: boolean }) => {
      setModals((prev) => ({ ...prev, settings: false }));
      if (options?.markCompleted) {
        setSettings((prev) => {
          const next = {
            ...prev,
            hasCompletedSetup: true,
          };
          saveSettingsToStorage(next);
          return next;
        });
      }
    },
    []
  );

  const submitSettings = useCallback(
    (input: SettingsFormInput) => {
      const backgroundImage =
        input.backgroundImageChoice === "custom"
          ? input.backgroundImageCustom ?? ""
          : input.backgroundImageChoice;

      const nextSettings = updateSettingsFromForm(settings, {
        backgroundType: input.backgroundType,
        backgroundImage,
        backgroundColor: input.backgroundColor,
        overlayOpacity: input.overlayOpacity,
        blurStrength: input.blurStrength,
        glassTintColor: input.glassTintColor,
        glassTintOpacity: input.glassTintOpacity,
        hasCompletedSetup: true,
      });

      const nextPageSize = normalizePageSize(input.pageSize);

      setSettings(nextSettings);
      saveSettingsToStorage(nextSettings);

      setUserData((prev) => {
        const next = {
          ...prev,
          pageSize: nextPageSize,
        };
        saveUserDataToStorage(next);
        return next;
      });

      setCurrentPage(0);
      closeSettings({ markCompleted: true });
    },
    [settings, closeSettings]
  );

  const openAddApp = useCallback((app?: LaunchpadApp | null) => {
    if (app) {
      setEditingAppId(app.id);
    } else {
      setEditingAppId(null);
    }
    setModals((prev) => ({ ...prev, addApp: true }));
  }, []);

  const closeAddApp = useCallback(() => {
    setModals((prev) => ({ ...prev, addApp: false }));
    setEditingAppId(null);
  }, []);

  const hideApp = useCallback(
    (appId: string) => {
      if (!appId) return;
      setUserData((prev) => {
        const hiddenSet = new Set(prev.hiddenAppIds);
        hiddenSet.add(appId);
        const deduped = dedupeHiddenIds(Array.from(hiddenSet), catalogApps);
        const next = {
          ...prev,
          hiddenAppIds: deduped,
        };
        saveUserDataToStorage(next);
        return next;
      });
    },
    [catalogApps]
  );

  const showApp = useCallback(
    (appId: string) => {
      if (!appId) return;
      setUserData((prev) => {
        const hiddenSet = new Set(prev.hiddenAppIds);
        hiddenSet.delete(appId);
        const deduped = dedupeHiddenIds(Array.from(hiddenSet), catalogApps);
        const next = {
          ...prev,
          hiddenAppIds: deduped,
        };
        saveUserDataToStorage(next);
        return next;
      });
    },
    [catalogApps]
  );

  const submitCustomApp = useCallback(
    (input: CustomAppInput) => {
      const trimmedName = input.name.trim();
      if (!trimmedName) {
        return { success: false, message: "Please enter a name." };
      }

      const sanitizedUrl = sanitizeHttpUrl(input.url);
      if (!sanitizedUrl) {
        return {
          success: false,
          message: "Please enter a valid link that starts with https://",
        };
      }

      let icon = DEFAULT_ICON;
      if (input.iconChoice === "custom") {
        const customValue = input.iconCustom ?? "";
        if (!customValue.trim()) {
          return {
            success: false,
            message: "Paste an icon URL or pick a preset.",
          };
        }
        icon = sanitizeIconSource(customValue);
      } else if (typeof input.iconChoice === "string") {
        icon = sanitizeIconSource(input.iconChoice);
      }

      const baseApp = sanitizeAppRecord(
        {
          id: input.id,
          name: trimmedName,
          description: input.description?.trim() ?? "",
          url: sanitizedUrl,
          icon,
          tags: input.tagsInput
            ? parseCustomTagString(input.tagsInput)
            : [],
        },
        "custom"
      );

      if (!baseApp) {
        return {
          success: false,
          message: "Unable to create the app. Please check the fields again.",
        };
      }

      setUserData((prev) => {
        const previousId = input.id?.trim() || baseApp.id;
        const reservedIds = new Set(catalogApps.map((app) => app.id));
        if (previousId) {
          reservedIds.delete(previousId);
        }

        let targetId = previousId ?? "";
        if (!targetId) {
          const baseId = createSlugId("custom", baseApp.name);
          targetId = baseId;
          let counter = 2;
          while (reservedIds.has(targetId)) {
            targetId = `${baseId}-${counter}`;
            counter += 1;
          }
        } else {
          targetId = targetId.trim();
        }

        const prepared: LaunchpadApp = {
          ...baseApp,
          id: targetId,
          origin: "custom",
        };

        const withoutPrevious = prev.customApps.filter(
          (app) => app.id !== previousId && app.id !== prepared.id
        );

        const updatedCustomApps = [...withoutPrevious, prepared];

        const nextHiddenIds = prev.hiddenAppIds.filter(
          (hiddenId) => hiddenId !== previousId && hiddenId !== prepared.id
        );

        const next = {
          ...prev,
          customApps: updatedCustomApps,
          hiddenAppIds: nextHiddenIds,
        };
        saveUserDataToStorage(next);
        return next;
      });

      setEditingAppId(null);
      setModals((prev) => ({ ...prev, addApp: false }));

      return {
        success: true,
        message: input.id ? "App updated successfully." : "App saved successfully.",
      };
    },
    [catalogApps]
  );

  const openHiddenApps = useCallback(() => {
    setModals((prev) => ({ ...prev, hiddenApps: true }));
  }, []);

  const closeHiddenApps = useCallback(() => {
    setModals((prev) => ({ ...prev, hiddenApps: false }));
  }, []);

  const openContextMenu = useCallback(
    (
      app: LaunchpadApp,
      source: ContextMenuSource,
      position: { x: number; y: number }
    ) => {
      if (app.type === "hidden-group") return;
      setContextMenu({
        appId: app.id,
        source,
        position,
      });
    },
    []
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu(initialContextMenu);
  }, []);

  const resetActiveIndex = useCallback(() => {
    setActiveIndexState(-1);
  }, []);

  const editingApp = useMemo(
    () => findAppById(catalogApps, editingAppId),
    [catalogApps, editingAppId]
  );

  return {
    hydration,
    settings,
    userData,
    catalogApps,
    visibleApps,
    hiddenApps,
    filteredApps,
    searchTerm,
    currentPage,
    totalPages,
    activeIndex,
    isLoading,
    error,
    modals,
    contextMenu,
    editingApp,
    iconLibrary,
    desktopPageSize,
    setSearchTerm,
    setPage,
    setActiveIndex,
    advanceActiveIndex,
    openApp,
    openSettings,
    closeSettings,
    submitSettings,
    openAddApp,
    closeAddApp,
    submitCustomApp,
    openHiddenApps,
    closeHiddenApps,
    hideApp,
    showApp,
    openContextMenu,
    closeContextMenu,
    resetActiveIndex,
  };
}
