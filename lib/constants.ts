import type { LaunchpadSettings, LaunchpadUserData } from "./types";

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const withBasePath = (path: string) => `${BASE_PATH}${path}`;

export const APPS_SOURCE = withBasePath("/data/apps.json");
export const DEFAULT_ICON = withBasePath("/default-icon.svg");
export const HIDDEN_GROUP_ID = "__hidden_group__";
export const HIDDEN_GROUP_ICON =
  "https://img.icons8.com/ios-filled/100/ffffff/invisible.png";
export const LONG_PRESS_DURATION_MS = 500;
export const CONTEXT_MENU_MARGIN = 12;
export const SETTINGS_STORAGE_KEY = "launchpad.settings.v1";
export const USER_DATA_STORAGE_KEY = "launchpad.userdata.v1";
export const MOBILE_BREAKPOINT = 640;
export const SCROLL_PAGE_THRESHOLD = 60;

export const DEFAULT_PAGE_SIZE = 28;
export const MIN_PAGE_SIZE = 14;
export const MAX_PAGE_SIZE = 56;
export const PAGE_SIZE_STEP = 7;

export const BASE_ICON_LIBRARY: string[] = [
  "https://img.icons8.com/ios-filled/100/ffffff/mac-os.png",
  "https://img.icons8.com/ios-filled/100/ffffff/calendar.png",
  "https://img.icons8.com/ios-filled/100/ffffff/apple-mail.png",
  "https://img.icons8.com/ios-filled/100/ffffff/compass.png",
  "https://img.icons8.com/ios-filled/100/ffffff/note.png",
  "https://img.icons8.com/ios-filled/100/ffffff/reminders.png",
  "https://img.icons8.com/ios-filled/100/ffffff/imessage.png",
  "https://img.icons8.com/ios-filled/100/ffffff/facetime.png",
  "https://img.icons8.com/ios-filled/100/ffffff/picture.png",
  "https://img.icons8.com/ios-filled/100/ffffff/apple-music.png",
  "https://img.icons8.com/ios-filled/100/ffffff/podcast.png",
  "https://img.icons8.com/ios-filled/100/ffffff/tv.png",
  "https://img.icons8.com/ios-filled/100/ffffff/apple-maps.png",
  "https://img.icons8.com/ios-filled/100/ffffff/partly-cloudy-day.png",
  "https://img.icons8.com/ios-filled/100/ffffff/news.png",
  "https://img.icons8.com/ios-filled/100/ffffff/opened-folder.png",
  "https://img.icons8.com/ios-filled/100/ffffff/contacts.png",
  "https://img.icons8.com/ios-filled/100/ffffff/calculator.png",
  "https://img.icons8.com/ios-filled/100/ffffff/console.png",
  "https://img.icons8.com/ios-filled/100/ffffff/settings.png",
  "https://img.icons8.com/ios-filled/100/ffffff/xcode.png",
  "https://img.icons8.com/ios-filled/100/ffffff/numbers.png",
  "https://img.icons8.com/ios-filled/100/ffffff/pages.png",
  "https://img.icons8.com/ios-filled/100/ffffff/keynote.png",
  "https://img.icons8.com/ios-filled/100/ffffff/shortcut.png",
  "https://img.icons8.com/ios-filled/100/ffffff/home-automation.png",
  "https://img.icons8.com/ios-filled/100/ffffff/real-time-traffic.png",
  "https://img.icons8.com/ios-filled/100/ffffff/microphone.png",
  "https://img.icons8.com/ios-filled/100/ffffff/apple-books.png",
  "https://img.icons8.com/ios-filled/100/ffffff/joystick.png",
  DEFAULT_ICON,
];

export const PRESET_BACKGROUND_OPTIONS: string[] = [
  withBasePath("/bg-photo-gallery.avif"),
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1600&q=80",
];

export const defaultSettings: LaunchpadSettings = {
  backgroundType: "image",
  backgroundImage: withBasePath("/bg-photo-gallery.avif"),
  backgroundColor: "#0f172a",
  overlayOpacity: 0.12,
  blurStrength: 2,
  glassTintColor: "#1e293b",
  glassTintOpacity: 0.55,
  hasCompletedSetup: false,
};

export const defaultUserData: LaunchpadUserData = {
  hiddenAppIds: [],
  customApps: [],
  pageSize: DEFAULT_PAGE_SIZE,
};
