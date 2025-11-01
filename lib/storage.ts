import {
  SETTINGS_STORAGE_KEY,
  USER_DATA_STORAGE_KEY,
  defaultSettings,
  defaultUserData,
} from "./constants";
import {
  mergeUserData,
  normalizePageSize,
  sanitizeAppRecord,
  updateSettingsFromForm,
} from "./utils";
import type { LaunchpadApp, LaunchpadSettings, LaunchpadUserData } from "./types";

const isBrowser = typeof window !== "undefined";

export function loadSettingsFromStorage(): LaunchpadSettings {
  if (!isBrowser) return { ...defaultSettings };
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return { ...defaultSettings };
    }
    const parsed = JSON.parse(raw);
    return updateSettingsFromForm(defaultSettings, parsed);
  } catch (error) {
    console.warn("Failed to read settings from storage", error);
    return { ...defaultSettings };
  }
}

export function saveSettingsToStorage(settings: LaunchpadSettings): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(settings)
    );
  } catch (error) {
    console.warn("Failed to save settings", error);
  }
}

type RawUserData = {
  hiddenAppIds?: unknown;
  customApps?: unknown;
  pageSize?: unknown;
};

export function loadUserDataFromStorage(): LaunchpadUserData {
  if (!isBrowser) return { ...defaultUserData };
  try {
    const raw = window.localStorage.getItem(USER_DATA_STORAGE_KEY);
    if (!raw) {
      return { ...defaultUserData };
    }
    const parsed = JSON.parse(raw) as RawUserData;
    const hiddenAppIds = Array.isArray(parsed.hiddenAppIds)
      ? parsed.hiddenAppIds
      : defaultUserData.hiddenAppIds;
    const customApps = Array.isArray(parsed.customApps)
      ? parsed.customApps
          .map((entry) => sanitizeAppRecord(entry, "custom"))
          .filter((entry): entry is LaunchpadApp => Boolean(entry))
      : defaultUserData.customApps;
    const pageSize = normalizePageSize(parsed.pageSize);
    return {
      hiddenAppIds,
      customApps,
      pageSize,
    };
  } catch (error) {
    console.warn("Failed to read user data from storage", error);
    return { ...defaultUserData };
  }
}

export function saveUserDataToStorage(data: LaunchpadUserData): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(
      USER_DATA_STORAGE_KEY,
      JSON.stringify(data)
    );
  } catch (error) {
    console.warn("Failed to save user data", error);
  }
}

export function persistSettings(
  next: Partial<LaunchpadSettings>
): LaunchpadSettings {
  const merged = updateSettingsFromForm(defaultSettings, next);
  saveSettingsToStorage(merged);
  return merged;
}

export function persistUserData(
  base: LaunchpadUserData,
  next: Partial<LaunchpadUserData>
): LaunchpadUserData {
  const merged = mergeUserData(base, next);
  saveUserDataToStorage(merged);
  return merged;
}
