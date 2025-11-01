import {
  BASE_ICON_LIBRARY,
  DEFAULT_PAGE_SIZE,
  HIDDEN_GROUP_ICON,
  HIDDEN_GROUP_ID,
} from "./constants";
import { dedupeHiddenIds, ensureUniqueAppIds, sanitizeAppRecord } from "./utils";
import type { LaunchpadApp } from "./types";

export type RawAppResponse = {
  apps: LaunchpadApp[];
};

export function mapCatalogApps(raw: unknown): LaunchpadApp[] {
  if (!Array.isArray(raw)) return [];
  return ensureUniqueAppIds(
    raw
      .map((entry) => sanitizeAppRecord(entry, "catalog"))
      .filter((entry): entry is LaunchpadApp => Boolean(entry))
  );
}

export function buildHiddenAppsGroup(count: number): LaunchpadApp {
  return {
    id: HIDDEN_GROUP_ID,
    name: count === 1 ? "Hidden app" : "Hidden apps",
    description:
      count === 1
        ? "Open to restore the hidden app."
        : "Open to manage hidden apps.",
    icon: HIDDEN_GROUP_ICON,
    origin: "system",
    type: "hidden-group",
    hiddenCount: count,
  };
}

export function isHiddenGroup(app: LaunchpadApp | null | undefined): boolean {
  if (!app) return false;
  return app.id === HIDDEN_GROUP_ID || app.type === "hidden-group";
}

export function splitApps(
  catalog: LaunchpadApp[],
  hiddenIds: string[]
): { visible: LaunchpadApp[]; hidden: LaunchpadApp[] } {
  const deduped = dedupeHiddenIds(hiddenIds, catalog);
  const hiddenSet = new Set(deduped);
  return {
    visible: catalog.filter((app) => !hiddenSet.has(app.id)),
    hidden: catalog.filter((app) => hiddenSet.has(app.id)),
  };
}

export function filterApps(apps: LaunchpadApp[], term: string): LaunchpadApp[] {
  const normalized = term.toLowerCase();
  if (!normalized) {
    return [...apps];
  }

  return apps.filter((app) => {
    const fields = [
      app.name,
      Array.isArray(app.tags) ? app.tags.join(" ") : "",
      app.description ?? "",
    ];
    return fields.some((value) =>
      String(value).toLowerCase().includes(normalized)
    );
  });
}

export function getEffectivePageSize(
  isMobile: boolean,
  total: number,
  desktopPageSize: number
): number {
  if (isMobile) {
    return Math.max(total, 1);
  }
  return desktopPageSize || DEFAULT_PAGE_SIZE;
}

export function getTotalPages(
  filteredApps: LaunchpadApp[],
  isMobile: boolean,
  desktopPageSize: number
): number {
  if (isMobile) return 1;
  const pageSize = desktopPageSize || DEFAULT_PAGE_SIZE;
  return Math.max(1, Math.ceil(filteredApps.length / pageSize));
}

export function paginateApps(
  apps: LaunchpadApp[],
  pageIndex: number,
  pageSize: number
): LaunchpadApp[] {
  const start = pageIndex * pageSize;
  const end = start + pageSize;
  return apps.slice(start, end);
}

export function getIconLibrary(catalogApps: LaunchpadApp[]): string[] {
  const icons = new Set(BASE_ICON_LIBRARY);
  catalogApps.forEach((app) => {
    if (typeof app.icon === "string") {
      icons.add(app.icon);
    }
  });
  return Array.from(icons);
}
