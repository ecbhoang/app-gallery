import { APPS_SOURCE } from "./constants";
import { mapCatalogApps } from "./apps";
import type { LaunchpadApp } from "./types";

export async function fetchCatalogApps(): Promise<LaunchpadApp[]> {
  const response = await fetch(APPS_SOURCE, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to load apps (${response.status})`);
  }
  const data = await response.json();
  return mapCatalogApps(data);
}
