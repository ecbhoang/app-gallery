const APPS_SOURCE = "./apps.sample.json";
const DEFAULT_PAGE_SIZE = 28;
const MIN_PAGE_SIZE = 14;
const MAX_PAGE_SIZE = 56;
const PAGE_SIZE_STEP = 7;
const SCROLL_PAGE_THRESHOLD = 60;
const DEFAULT_ICON = "./default-icon.svg";
const SETTINGS_STORAGE_KEY = "launchpad.settings.v1";
const USER_DATA_STORAGE_KEY = "launchpad.userdata.v1";
const MOBILE_BREAKPOINT = "(max-width: 640px)";

const BASE_ICON_LIBRARY = [
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

const PRESET_BACKGROUND_OPTIONS = [
  "./bg-photo-gallery.avif",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1600&q=80",
];

const defaultSettings = {
  backgroundType: "image",
  backgroundImage: "./bg-photo-gallery.avif",
  backgroundColor: "#0f172a",
  overlayOpacity: 0.12,
  blurStrength: 2,
  glassTintColor: "#1e293b",
  glassTintOpacity: 0.55,
  hasCompletedSetup: false,
};

const defaultUserData = {
  hiddenAppIds: [],
  customApps: [],
  pageSize: DEFAULT_PAGE_SIZE,
};

const state = {
  catalogApps: [],
  apps: [],
  filteredApps: [],
  searchTerm: "",
  currentPage: 0,
  activeIndex: 0,
  settings: { ...defaultSettings },
  userData: { ...defaultUserData },
};

const dom = {
  loadingScreen: document.getElementById("loading-screen"),
  searchInput: document.getElementById("search-input"),
  pagesWrapper: document.getElementById("launchpad-pages"),
  paginationControls: document.getElementById("pagination-controls"),
  cardTemplate: document.getElementById("app-card-template"),
  emptyState: document.getElementById("empty-state"),
  gridViewport: document.getElementById("launchpad-grid"),
  backgroundOverlay: document.getElementById("background-overlay"),
  openSettingsButton: document.getElementById("open-settings"),
  settingsModal: document.getElementById("settings-modal"),
  settingsForm: document.getElementById("settings-form"),
  settingsCancel: document.getElementById("settings-cancel"),
  settingsSkip: document.getElementById("settings-skip"),
  backgroundImageFields: document.querySelector("[data-background-image-fields]"),
  backgroundColorFields: document.querySelector("[data-background-color-fields]"),
  backgroundImageCustomFields: document.querySelector(
    "[data-background-image-custom-fields]"
  ),
  backgroundImageCustomInput: document.getElementById(
    "settings-background-image-custom"
  ),
  overlayValue: document.getElementById("overlay-opacity-value"),
  blurValue: document.getElementById("blur-strength-value"),
  glassValue: document.getElementById("glass-opacity-value"),
  pageSizeInput: document.getElementById("settings-page-size"),
  pageSizeValue: document.getElementById("page-size-value"),
  appVisibilityList: document.getElementById("settings-app-visibility"),
  appVisibilityEmpty: document.getElementById("settings-app-visibility-empty"),
  appVisibilitySummary: document.getElementById("app-visibility-summary"),
  customAppNameInput: document.getElementById("custom-app-name"),
  customAppUrlInput: document.getElementById("custom-app-url"),
  customAppDescriptionInput: document.getElementById(
    "custom-app-description"
  ),
  customAppTagsInput: document.getElementById("custom-app-tags"),
  customAppFeedback: document.getElementById("custom-app-feedback"),
  customAppSubmit: document.getElementById("custom-app-submit"),
  customIconOptions: document.querySelector("[data-custom-icon-options]"),
  customIconCustomFields: document.querySelector(
    "[data-custom-icon-custom-fields]"
  ),
  customIconCustomInput: document.getElementById("custom-app-icon-custom"),
};

const mobileLayoutQuery = window.matchMedia(MOBILE_BREAKPOINT);

function isMobileLayout() {
  return mobileLayoutQuery.matches;
}

function getDesktopPageSize() {
  return normalizePageSize(state.userData?.pageSize ?? DEFAULT_PAGE_SIZE);
}

function getTotalPages() {
  if (isMobileLayout()) {
    return 1;
  }

  const pageSize = getDesktopPageSize();
  return Math.max(1, Math.ceil(state.filteredApps.length / pageSize));
}

function getEffectivePageSize() {
  if (isMobileLayout()) {
    return Math.max(state.filteredApps.length, 1);
  }

  return getDesktopPageSize();
}

function loadSettingsFromStorage() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return { ...defaultSettings };
    }
    const parsed = JSON.parse(raw);
    return {
      ...defaultSettings,
      ...parsed,
      backgroundType: parsed.backgroundType === "color" ? "color" : "image",
      overlayOpacity: clampNumber(
        parsed.overlayOpacity,
        0,
        0.6,
        defaultSettings.overlayOpacity
      ),
      blurStrength: clampNumber(
        parsed.blurStrength,
        0,
        20,
        defaultSettings.blurStrength
      ),
      glassTintOpacity: clampNumber(
        parsed.glassTintOpacity,
        0.05,
        0.95,
        defaultSettings.glassTintOpacity
      ),
      glassTintColor: resolveHexColor(
        parsed.glassTintColor,
        defaultSettings.glassTintColor
      ),
      backgroundColor: resolveHexColor(
        parsed.backgroundColor,
        defaultSettings.backgroundColor
      ),
      backgroundImage: sanitizeBackgroundImage(parsed.backgroundImage) || "",
    };
  } catch (error) {
    console.warn("Failed to read settings from storage", error);
    return { ...defaultSettings };
  }
}

function saveSettingsToStorage(settings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn("Failed to save settings", error);
  }
}

function clampNumber(value, min, max, fallback) {
  const number = Number.parseFloat(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.min(Math.max(number, min), max);
}

function normalizePageSize(value) {
  const fallback = defaultUserData.pageSize;
  const clamped = clampNumber(value, MIN_PAGE_SIZE, MAX_PAGE_SIZE, fallback);
  const rounded = Number.isFinite(clamped) ? Math.round(clamped) : fallback;
  if (PAGE_SIZE_STEP <= 1) {
    return Math.min(Math.max(rounded, MIN_PAGE_SIZE), MAX_PAGE_SIZE);
  }
  const stepped = Math.round(rounded / PAGE_SIZE_STEP) * PAGE_SIZE_STEP;
  return Math.min(
    Math.max(stepped, MIN_PAGE_SIZE),
    MAX_PAGE_SIZE
  );
}

function loadUserDataFromStorage() {
  try {
    const raw = localStorage.getItem(USER_DATA_STORAGE_KEY);
    if (!raw) {
      return { ...defaultUserData };
    }
    const parsed = JSON.parse(raw);
    const hiddenAppIds = Array.isArray(parsed.hiddenAppIds)
      ? parsed.hiddenAppIds
          .map((id) => (typeof id === "string" ? id.trim() : ""))
          .filter((id) => id.length > 0)
      : [];
    const customApps = Array.isArray(parsed.customApps)
      ? parsed.customApps.filter((entry) => entry && typeof entry === "object")
      : [];
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

function saveUserDataToStorage(data) {
  try {
    localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to save user data", error);
  }
}

function sanitizeHttpUrl(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed || /^javascript:/i.test(trimmed)) return "";
  if (!/^https?:\/\//i.test(trimmed)) return "";
  return trimmed;
}

function sanitizeIconSource(value) {
  if (typeof value !== "string") return DEFAULT_ICON;
  const trimmed = value.trim();
  if (!trimmed || /^javascript:/i.test(trimmed)) return DEFAULT_ICON;
  if (
    /^https?:\/\//i.test(trimmed) ||
    /^data:image\//i.test(trimmed) ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  return DEFAULT_ICON;
}

function sanitizeTagList(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) => String(tag ?? "").trim())
    .filter((tag) => tag.length > 0);
}

function parseCustomTagString(value) {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

function sanitizeAppRecord(app, origin) {
  if (!app || typeof app !== "object") return null;
  const name = typeof app.name === "string" ? app.name.trim() : "";
  const description =
    typeof app.description === "string" ? app.description.trim() : "";
  const url = sanitizeHttpUrl(app.url);
  const icon = sanitizeIconSource(app.icon);
  const tags = sanitizeTagList(app.tags);
  const id = typeof app.id === "string" ? app.id.trim() : "";

  if (origin === "custom" && (!name || !url)) {
    return null;
  }

  return {
    id,
    name: name || "Untitled app",
    description,
    url,
    icon,
    tags,
    origin,
  };
}

function createSlugId(prefix, name) {
  const baseName = String(name ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const fallback = `${prefix}-${Date.now().toString(36)}`;
  return baseName ? `${prefix}-${baseName}` : fallback;
}

function ensureUniqueAppIds(apps) {
  const seen = new Set();
  return apps.map((app) => {
    let baseId =
      typeof app.id === "string" && app.id.trim().length > 0
        ? app.id.trim()
        : createSlugId(app.origin === "custom" ? "custom" : "app", app.name);
    let uniqueId = baseId;
    let counter = 2;
    while (seen.has(uniqueId)) {
      uniqueId = `${baseId}-${counter}`;
      counter += 1;
    }
    seen.add(uniqueId);
    return { ...app, id: uniqueId };
  });
}

function stripAppForStorage(app) {
  const { origin, ...rest } = app;
  return rest;
}

function dedupeHiddenIds(hiddenIds, apps) {
  if (!Array.isArray(hiddenIds)) return [];
  const validIds = new Set(apps.map((app) => app.id));
  return hiddenIds
    .map((id) => (typeof id === "string" ? id.trim() : ""))
    .filter((id) => id.length > 0 && validIds.has(id));
}

function getIconLibrary() {
  const icons = new Set(BASE_ICON_LIBRARY);
  state.catalogApps.forEach((app) => {
    if (typeof app.icon === "string") {
      const sanitized = sanitizeIconSource(app.icon);
      if (sanitized) {
        icons.add(sanitized);
      }
    }
  });
  return Array.from(icons);
}

function hexToRgb(hex) {
  if (typeof hex !== "string") return null;
  const trimmed = hex.trim();
  if (!trimmed) return null;
  const withoutHash = trimmed.startsWith("#")
    ? trimmed.slice(1)
    : trimmed;
  const normalized =
    withoutHash.length === 3
      ? withoutHash
          .split("")
          .map((char) => char + char)
          .join("")
      : withoutHash;
  if (normalized.length !== 6) return null;
  const value = Number.parseInt(normalized, 16);
  if (Number.isNaN(value)) return null;
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHex(rgb) {
  if (!rgb) return null;
  const toHex = (component) => component.toString(16).padStart(2, "0");
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function rgbToRgba(rgb, alpha) {
  if (!rgb) return "rgba(15, 23, 42, 0.4)";
  const safeAlpha = Math.min(Math.max(alpha, 0), 1);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${safeAlpha})`;
}

function resolveHexColor(value, fallback) {
  const rgb = hexToRgb(value);
  if (rgb) {
    return rgbToHex(rgb);
  }
  const fallbackRgb = hexToRgb(fallback);
  return fallbackRgb ? rgbToHex(fallbackRgb) : fallback;
}

function sanitizeBackgroundImage(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/javascript:/i.test(trimmed)) return "";
  return trimmed;
}

function applySettings(settings) {
  const overlayOpacity = clampNumber(
    settings.overlayOpacity,
    0,
    0.6,
    defaultSettings.overlayOpacity
  );
  const blurStrength = clampNumber(
    settings.blurStrength,
    0,
    20,
    defaultSettings.blurStrength
  );
  const glassOpacity = clampNumber(
    settings.glassTintOpacity,
    0.05,
    0.95,
    defaultSettings.glassTintOpacity
  );
  const glassHex = resolveHexColor(
    settings.glassTintColor,
    defaultSettings.glassTintColor
  );
  const glassRgb = hexToRgb(glassHex) ?? hexToRgb(defaultSettings.glassTintColor);

  document.documentElement.style.setProperty(
    "--overlay-color",
    rgbToRgba(glassRgb, overlayOpacity)
  );
  document.documentElement.style.setProperty(
    "--overlay-blur",
    `${blurStrength}px`
  );
  document.documentElement.style.setProperty(
    "--glass-tint",
    rgbToRgba(glassRgb, glassOpacity)
  );

  if (settings.backgroundType === "color") {
    const backgroundHex = resolveHexColor(
      settings.backgroundColor,
      defaultSettings.backgroundColor
    );
    document.body.style.backgroundImage = "none";
    document.body.style.backgroundColor = backgroundHex;
    document.documentElement.style.setProperty(
      "--fallback-background-color",
      backgroundHex
    );
  } else {
    const source = sanitizeBackgroundImage(settings.backgroundImage);
    if (source) {
      const cssValue = source.includes("(")
        ? source
        : `url("${source.replace(/"/g, '\\"')}")`;
      document.body.style.backgroundImage = cssValue;
    } else {
      document.body.style.backgroundImage = "";
    }
    document.body.style.backgroundColor = "";
    document.documentElement.style.setProperty(
      "--fallback-background-color",
      defaultSettings.backgroundColor
    );
  }
}

function populateSettingsForm(settings) {
  const form = dom.settingsForm;
  if (!form) return;

  const merged = {
    ...defaultSettings,
    ...settings,
  };

  const typeInputs = form.querySelectorAll('input[name="backgroundType"]');
  typeInputs.forEach((input) => {
    input.checked = input.value === merged.backgroundType;
  });

  syncBackgroundImageSelection(merged.backgroundImage ?? "");

  if (form.elements.backgroundColor) {
    form.elements.backgroundColor.value = resolveHexColor(
      merged.backgroundColor,
      defaultSettings.backgroundColor
    );
  }
  if (form.elements.overlayOpacity) {
    form.elements.overlayOpacity.value = clampNumber(
      merged.overlayOpacity,
      0,
      0.6,
      defaultSettings.overlayOpacity
    );
  }
  if (form.elements.blurStrength) {
    form.elements.blurStrength.value = clampNumber(
      merged.blurStrength,
      0,
      20,
      defaultSettings.blurStrength
    );
  }
  if (form.elements.glassTintOpacity) {
    form.elements.glassTintOpacity.value = clampNumber(
      merged.glassTintOpacity,
      0.05,
      0.95,
      defaultSettings.glassTintOpacity
    );
  }
  if (form.elements.glassTintColor) {
    form.elements.glassTintColor.value = resolveHexColor(
      merged.glassTintColor,
      defaultSettings.glassTintColor
    );
  }

  syncBackgroundFieldVisibility(merged.backgroundType);
  updateSettingsIndicators(merged);

  if (dom.pageSizeInput) {
    const pageSize = getDesktopPageSize();
    dom.pageSizeInput.value = String(pageSize);
    updatePageSizeIndicator(pageSize);
  }

  renderAppVisibilityList();
  renderCustomIconOptions();
  updateAppVisibilitySummary();
}

function syncBackgroundFieldVisibility(backgroundType) {
  if (!dom.backgroundImageFields || !dom.backgroundColorFields) return;
  if (backgroundType === "color") {
    dom.backgroundImageFields.classList.add("hidden");
    dom.backgroundColorFields.classList.remove("hidden");
  } else {
    dom.backgroundImageFields.classList.remove("hidden");
    dom.backgroundColorFields.classList.add("hidden");
  }
}

function syncBackgroundImageSelection(currentValue) {
  if (!dom.settingsForm) return;

  const choiceInputs = dom.settingsForm.querySelectorAll(
    'input[name="backgroundImageChoice"]'
  );

  const normalized = sanitizeBackgroundImage(currentValue);
  const matchedChoice = PRESET_BACKGROUND_OPTIONS.includes(normalized)
    ? normalized
    : normalized
    ? "custom"
    : PRESET_BACKGROUND_OPTIONS[0];

  choiceInputs.forEach((input) => {
    input.checked = input.value === matchedChoice;
  });

  if (dom.backgroundImageCustomInput) {
    dom.backgroundImageCustomInput.value =
      matchedChoice === "custom" ? normalized : "";
  }

  syncBackgroundImageCustomVisibility(matchedChoice);
}

function syncBackgroundImageCustomVisibility(choiceValue) {
  if (!dom.backgroundImageCustomFields) return;
  if (choiceValue === "custom") {
    dom.backgroundImageCustomFields.classList.remove("hidden");
    dom.backgroundImageCustomInput?.removeAttribute("disabled");
  } else {
    dom.backgroundImageCustomFields.classList.add("hidden");
    dom.backgroundImageCustomInput?.setAttribute("disabled", "true");
  }
}

function updateSettingsIndicators(settings) {
  if (dom.overlayValue) {
    const percent = Math.round(
      clampNumber(
        settings.overlayOpacity,
        0,
        0.6,
        defaultSettings.overlayOpacity
      ) * 100
    );
    dom.overlayValue.textContent = `${percent}%`;
  }
  if (dom.blurValue) {
    const blur = Math.round(
      clampNumber(
        settings.blurStrength,
        0,
        20,
        defaultSettings.blurStrength
      )
    );
    dom.blurValue.textContent = `${blur}px`;
  }
  if (dom.glassValue) {
    const opacityPercent = Math.round(
      clampNumber(
        settings.glassTintOpacity,
        0.05,
        0.95,
        defaultSettings.glassTintOpacity
      ) * 100
    );
    dom.glassValue.textContent = `${opacityPercent}%`;
  }
}

function updatePageSizeIndicator(value) {
  if (!dom.pageSizeValue) return;
  const numeric = Number.parseInt(
    value ?? dom.pageSizeInput?.value ?? getDesktopPageSize(),
    10
  );
  if (Number.isFinite(numeric)) {
    dom.pageSizeValue.textContent = `${numeric}`;
  }
}

function updateAppVisibilitySummary() {
  if (!dom.appVisibilitySummary) return;
  const total = state.catalogApps.length;
  if (total === 0) {
    dom.appVisibilitySummary.textContent = "No apps yet";
    return;
  }
  const hidden = state.userData.hiddenAppIds.length;
  const visible = Math.max(total - hidden, 0);
  const hiddenSuffix = hidden > 0 ? ` · ${hidden} hidden` : "";
  dom.appVisibilitySummary.textContent = `Visible ${visible} of ${total}${hiddenSuffix}`;
}

function renderAppVisibilityList() {
  if (!dom.appVisibilityList) return;
  const container = dom.appVisibilityList;
  container.innerHTML = "";

  const apps = [...state.catalogApps];
  const hiddenSet = new Set(state.userData.hiddenAppIds);

  if (apps.length === 0) {
    dom.appVisibilityEmpty?.classList.remove("hidden");
    updateAppVisibilitySummary();
    return;
  }

  dom.appVisibilityEmpty?.classList.add("hidden");

  apps
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
    .forEach((app) => {
      const label = document.createElement("label");
      label.className = [
        "group",
        "flex",
        "items-center",
        "gap-3",
        "rounded-2xl",
        "border",
        "border-white/10",
        "bg-white/5",
        "px-4",
        "py-3",
        "text-sm",
        "text-slate-200",
        "transition",
        "hover:border-white/20",
        "hover:bg-white/10",
      ].join(" ");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "h-4 w-4 rounded border-slate-600 text-sky-400 focus:ring-sky-500/50";
      checkbox.dataset.appId = app.id;
      checkbox.checked = !hiddenSet.has(app.id);
      label.appendChild(checkbox);

      const content = document.createElement("div");
      content.className = "flex flex-1 flex-col overflow-hidden";

      const title = document.createElement("span");
      title.className = "font-medium text-slate-100 truncate";
      title.textContent = app.name;
      content.appendChild(title);

      if (app.description) {
        const subtitle = document.createElement("span");
        subtitle.className = "text-xs text-slate-400 truncate";
        subtitle.textContent = app.description;
        content.appendChild(subtitle);
      }

      if (app.tags && app.tags.length > 0) {
        const tags = document.createElement("span");
        tags.className = "text-[10px] uppercase tracking-wide text-slate-500 truncate";
        tags.textContent = app.tags.join(", ");
        content.appendChild(tags);
      }

      label.appendChild(content);

      const badge = document.createElement("span");
      badge.className = "rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400";
      badge.textContent = app.origin === "custom" ? "Custom" : "Preset";
      label.appendChild(badge);

      container.appendChild(label);
    });

  updateAppVisibilitySummary();
}

function syncCustomIconCustomVisibility(choiceValue) {
  if (!dom.customIconCustomFields) return;
  if (choiceValue === "custom") {
    dom.customIconCustomFields.classList.remove("hidden");
    dom.customIconCustomInput?.removeAttribute("disabled");
  } else {
    dom.customIconCustomFields.classList.add("hidden");
    dom.customIconCustomInput?.setAttribute("disabled", "true");
  }
}

function renderCustomIconOptions(preferredValue) {
  if (!dom.customIconOptions) return;
  const container = dom.customIconOptions;
  const currentSelection = container.querySelector(
    'input[name="customAppIconChoice"]:checked'
  );
  const selectedValue = preferredValue ?? currentSelection?.value ?? null;

  container.innerHTML = "";
  const icons = getIconLibrary();
  let hasMatched = false;

  icons.forEach((icon, index) => {
    const label = document.createElement("label");
    label.className = [
      "group",
      "flex",
      "cursor-pointer",
      "flex-col",
      "items-center",
      "gap-3",
      "rounded-2xl",
      "border",
      "border-white/10",
      "bg-white/5",
      "p-3",
      "text-xs",
      "text-slate-200",
      "transition",
      "hover:border-white/20",
      "hover:bg-white/10",
    ].join(" ");

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "customAppIconChoice";
    input.value = icon;
    input.className = "peer sr-only";
    if (!hasMatched && selectedValue === icon) {
      input.checked = true;
      hasMatched = true;
    }
    label.appendChild(input);

    const preview = document.createElement("span");
    preview.className = "flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 p-3 transition peer-checked:border-sky-400/60 peer-checked:bg-slate-800/60";
    const image = document.createElement("img");
    image.src = icon;
    image.alt = "";
    image.loading = "lazy";
    image.className = "h-full w-full object-contain";
    image.addEventListener("error", () => {
      image.src = DEFAULT_ICON;
    });
    preview.appendChild(image);
    label.appendChild(preview);

    const caption = document.createElement("span");
    caption.className = "text-[10px] font-semibold uppercase tracking-wide text-slate-400";
    caption.textContent = "Preset";
    label.appendChild(caption);

    container.appendChild(label);

    if (!hasMatched && !selectedValue && index === 0) {
      input.checked = true;
      hasMatched = true;
    }
  });

  const customLabel = document.createElement("label");
  customLabel.className = [
    "group",
    "flex",
    "cursor-pointer",
    "flex-col",
    "items-center",
    "gap-3",
    "rounded-2xl",
    "border",
    "border-dashed",
    "border-white/20",
    "bg-white/5",
    "p-3",
    "text-xs",
    "text-slate-200",
    "transition",
    "hover:border-white/30",
    "hover:bg-white/10",
  ].join(" ");

  const customInput = document.createElement("input");
  customInput.type = "radio";
  customInput.name = "customAppIconChoice";
  customInput.value = "custom";
  customInput.className = "peer sr-only";
  customLabel.appendChild(customInput);

  const customPreview = document.createElement("div");
  customPreview.className = "flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 text-[10px] uppercase tracking-wide text-slate-400 transition peer-checked:border-sky-400/60 peer-checked:text-sky-200";
  customPreview.textContent = "Custom";
  customLabel.appendChild(customPreview);

  const customCaption = document.createElement("span");
  customCaption.className = "text-[10px] font-semibold uppercase tracking-wide text-slate-400";
  customCaption.textContent = "Paste link";
  customLabel.appendChild(customCaption);

  container.appendChild(customLabel);

  if (!hasMatched && selectedValue === "custom") {
    customInput.checked = true;
    hasMatched = true;
  }

  if (!hasMatched && icons.length === 0) {
    customInput.checked = true;
    hasMatched = true;
  }

  if (!hasMatched && icons.length > 0) {
    const first = container.querySelector('input[name="customAppIconChoice"]');
    if (first && first instanceof HTMLInputElement) {
      first.checked = true;
    }
  }

  const finalSelection = container.querySelector(
    'input[name="customAppIconChoice"]:checked'
  );
  syncCustomIconCustomVisibility(finalSelection?.value ?? "custom");
}

function showCustomAppFeedback(message, variant = "info") {
  if (!dom.customAppFeedback) return;
  dom.customAppFeedback.textContent = message;
  dom.customAppFeedback.classList.remove(
    "text-emerald-400",
    "text-rose-400",
    "text-slate-500"
  );
  if (variant === "success") {
    dom.customAppFeedback.classList.add("text-emerald-400");
  } else if (variant === "error") {
    dom.customAppFeedback.classList.add("text-rose-400");
  } else {
    dom.customAppFeedback.classList.add("text-slate-500");
  }
}

function resetCustomAppForm() {
  dom.customAppNameInput && (dom.customAppNameInput.value = "");
  dom.customAppUrlInput && (dom.customAppUrlInput.value = "");
  dom.customAppDescriptionInput && (dom.customAppDescriptionInput.value = "");
  dom.customAppTagsInput && (dom.customAppTagsInput.value = "");
  dom.customIconCustomInput && (dom.customIconCustomInput.value = "");
  renderCustomIconOptions();
}

function getSelectedCustomIconChoice() {
  if (!dom.customIconOptions) return null;
  const selected = dom.customIconOptions.querySelector(
    'input[name="customAppIconChoice"]:checked'
  );
  if (selected instanceof HTMLInputElement) {
    return selected.value;
  }
  return null;
}

function handleAppVisibilityChange(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  const appId = target.dataset.appId;
  if (!appId) return;

  const hiddenSet = new Set(state.userData.hiddenAppIds);
  if (target.checked) {
    hiddenSet.delete(appId);
  } else {
    hiddenSet.add(appId);
  }

  state.userData.hiddenAppIds = Array.from(hiddenSet);
  saveUserDataToStorage(state.userData);
  updateVisibleApps();
  applyFilter(state.searchTerm ?? "");
  renderAppVisibilityList();
}

function handleCustomIconOptionChange(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.name !== "customAppIconChoice") return;
  syncCustomIconCustomVisibility(target.value);
  if (target.value === "custom") {
    window.setTimeout(() => {
      dom.customIconCustomInput?.focus({ preventScroll: true });
    }, 0);
  }
}

function handleAddCustomApp() {
  if (!dom.customAppNameInput || !dom.customAppUrlInput) return;

  const name = dom.customAppNameInput.value.trim();
  const url = sanitizeHttpUrl(dom.customAppUrlInput.value);
  const description = dom.customAppDescriptionInput?.value?.trim() ?? "";
  const tags = parseCustomTagString(dom.customAppTagsInput?.value ?? "");
  const iconChoice = getSelectedCustomIconChoice();

  if (!name) {
    showCustomAppFeedback("Please enter a name for the app.", "error");
    dom.customAppNameInput.focus({ preventScroll: true });
    return;
  }

  if (!url) {
    showCustomAppFeedback(
      "Please enter a valid link that starts with https://",
      "error"
    );
    dom.customAppUrlInput.focus({ preventScroll: true });
    return;
  }

  let icon = DEFAULT_ICON;
  if (iconChoice === "custom") {
    const customValue = dom.customIconCustomInput?.value ?? "";
    if (!customValue.trim()) {
      showCustomAppFeedback("Paste an icon URL or pick a preset.", "error");
      dom.customIconCustomInput?.focus({ preventScroll: true });
      return;
    }
    icon = sanitizeIconSource(customValue);
    const normalized = customValue.trim();
    const looksRelative = normalized.startsWith("./") || normalized.startsWith("/");
    const looksHttp = /^https?:\/\//i.test(normalized);
    if (icon === DEFAULT_ICON && !looksHttp && !looksRelative) {
      showCustomAppFeedback("Please use a valid image URL.", "error");
      dom.customIconCustomInput?.focus({ preventScroll: true });
      return;
    }
  } else if (typeof iconChoice === "string") {
    icon = sanitizeIconSource(iconChoice);
  }

  const existingIds = new Set(state.catalogApps.map((app) => app.id));
  const baseId = createSlugId("custom", name);
  let newId = baseId;
  let counter = 2;
  while (existingIds.has(newId)) {
    newId = `${baseId}-${counter}`;
    counter += 1;
  }

  const newApp = {
    id: newId,
    name,
    description,
    url,
    icon,
    tags,
    origin: "custom",
  };

  state.catalogApps = [...state.catalogApps, newApp];
  state.userData.customApps = [
    ...state.userData.customApps,
    stripAppForStorage(newApp),
  ];
  state.userData.hiddenAppIds = dedupeHiddenIds(
    state.userData.hiddenAppIds,
    state.catalogApps
  );
  saveUserDataToStorage(state.userData);

  updateVisibleApps();
  applyFilter(state.searchTerm ?? "");
  renderAppVisibilityList();
  updateAppVisibilitySummary();

  resetCustomAppForm();
  showCustomAppFeedback("App added to your launchpad.", "success");
}

function refreshAppManagementUI() {
  renderAppVisibilityList();
  renderCustomIconOptions();
  updateAppVisibilitySummary();
  updatePageSizeIndicator();
}

function setupSettingsUI() {
  if (!dom.settingsForm) return;

  populateSettingsForm(state.settings);

  dom.settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleSettingsSubmit();
  });

  const backgroundTypeInputs = dom.settingsForm.querySelectorAll(
    'input[name="backgroundType"]'
  );
  backgroundTypeInputs.forEach((input) => {
    input.addEventListener("change", () => {
      syncBackgroundFieldVisibility(input.value);
    });
  });

  const backgroundChoiceInputs = dom.settingsForm.querySelectorAll(
    'input[name="backgroundImageChoice"]'
  );
  backgroundChoiceInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        syncBackgroundImageCustomVisibility(input.value);
        if (input.value === "custom") {
          window.setTimeout(() => {
            dom.backgroundImageCustomInput?.focus({ preventScroll: true });
          }, 0);
        }
      }
    });
  });

  const overlayRange = dom.settingsForm.elements.overlayOpacity;
  if (overlayRange) {
    overlayRange.addEventListener("input", (event) => {
      const value = clampNumber(
        event.target.value,
        0,
        0.6,
        defaultSettings.overlayOpacity
      );
      updateSettingsIndicators({ ...state.settings, overlayOpacity: value });
    });
  }

  const blurRange = dom.settingsForm.elements.blurStrength;
  if (blurRange) {
    blurRange.addEventListener("input", (event) => {
      const value = clampNumber(
        event.target.value,
        0,
        20,
        defaultSettings.blurStrength
      );
      updateSettingsIndicators({ ...state.settings, blurStrength: value });
    });
  }

  const glassRange = dom.settingsForm.elements.glassTintOpacity;
  if (glassRange) {
    glassRange.addEventListener("input", (event) => {
      const value = clampNumber(
        event.target.value,
        0.05,
        0.95,
        defaultSettings.glassTintOpacity
      );
      updateSettingsIndicators({ ...state.settings, glassTintOpacity: value });
    });
  }

  if (dom.pageSizeInput) {
    dom.pageSizeInput.addEventListener("input", (event) => {
      updatePageSizeIndicator(event.target.value);
    });
  }

  dom.appVisibilityList?.addEventListener("change", handleAppVisibilityChange);
  dom.customIconOptions?.addEventListener("change", handleCustomIconOptionChange);
  dom.customAppSubmit?.addEventListener("click", (event) => {
    event.preventDefault();
    handleAddCustomApp();
  });

  dom.openSettingsButton?.addEventListener("click", () => {
    showSettingsModal({ autofocus: true });
  });

  dom.settingsCancel?.addEventListener("click", () => {
    closeSettingsModal({ markCompleted: true });
  });

  dom.settingsSkip?.addEventListener("click", () => {
    closeSettingsModal({ markCompleted: true });
  });

  dom.settingsModal?.addEventListener("click", (event) => {
    if (event.target === dom.settingsModal) {
      closeSettingsModal({ markCompleted: true });
    }
  });
}

function showSettingsModal(options = {}) {
  if (!dom.settingsModal) return;
  populateSettingsForm(state.settings);
  resetCustomAppForm();
  showCustomAppFeedback("", "info");
  dom.settingsModal.classList.remove("hidden");
  dom.settingsModal.classList.add("flex");
  dom.settingsModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("overflow-hidden");

  if (options.autofocus !== false) {
    window.setTimeout(() => {
      if (!dom.settingsForm) return;
      const preferred = Array.from(
        dom.settingsForm.querySelectorAll("[data-autofocus]")
      );
      const fallbacks = Array.from(
        dom.settingsForm.querySelectorAll("input, select, textarea, button")
      );
      const candidates = [...preferred, ...fallbacks];
      const target = candidates.find(
        (element) =>
          element instanceof HTMLElement &&
          !element.hasAttribute("disabled") &&
          element.offsetParent !== null
      );
      target?.focus({ preventScroll: true });
    }, 0);
  }
}

function closeSettingsModal(options = {}) {
  if (!dom.settingsModal) return;
  dom.settingsModal.classList.add("hidden");
  dom.settingsModal.classList.remove("flex");
  dom.settingsModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("overflow-hidden");
  populateSettingsForm(state.settings);

  if (options.markCompleted) {
    state.settings = {
      ...state.settings,
      hasCompletedSetup: true,
    };
    saveSettingsToStorage(state.settings);
  }
}

function isSettingsModalOpen() {
  return Boolean(
    dom.settingsModal && !dom.settingsModal.classList.contains("hidden")
  );
}

function handleSettingsSubmit() {
  if (!dom.settingsForm) return;
  const formData = new FormData(dom.settingsForm);
  const backgroundType =
    formData.get("backgroundType") === "color" ? "color" : "image";

  const rawChoice = formData.get("backgroundImageChoice");
  const backgroundChoice =
    typeof rawChoice === "string" && rawChoice
      ? rawChoice
      : PRESET_BACKGROUND_OPTIONS[0];

  const backgroundImage =
    backgroundChoice === "custom"
      ? sanitizeBackgroundImage(formData.get("backgroundImageCustom"))
      : sanitizeBackgroundImage(backgroundChoice);

  const nextSettings = {
    backgroundType,
    backgroundImage,
    backgroundColor: resolveHexColor(
      formData.get("backgroundColor"),
      defaultSettings.backgroundColor
    ),
    overlayOpacity: clampNumber(
      formData.get("overlayOpacity"),
      0,
      0.6,
      defaultSettings.overlayOpacity
    ),
    blurStrength: clampNumber(
      formData.get("blurStrength"),
      0,
      20,
      defaultSettings.blurStrength
    ),
    glassTintColor: resolveHexColor(
      formData.get("glassTintColor"),
      defaultSettings.glassTintColor
    ),
    glassTintOpacity: clampNumber(
      formData.get("glassTintOpacity"),
      0.05,
      0.95,
      defaultSettings.glassTintOpacity
    ),
    hasCompletedSetup: true,
  };

  state.settings = nextSettings;
  applySettings(state.settings);
  saveSettingsToStorage(state.settings);
  const pageSize = normalizePageSize(formData.get("pageSize"));
  state.userData = {
    ...state.userData,
    pageSize,
  };
  saveUserDataToStorage(state.userData);
  updateVisibleApps();
  applyFilter(state.searchTerm ?? "");
  updatePageSizeIndicator(pageSize);
  closeSettingsModal({ markCompleted: true });
}

async function init() {
  state.settings = loadSettingsFromStorage();
  state.userData = loadUserDataFromStorage();
  state.userData.pageSize = normalizePageSize(state.userData.pageSize);
  saveUserDataToStorage(state.userData);
  applySettings(state.settings);
  setupSettingsUI();

  await loadApps();
  updateVisibleApps();
  refreshAppManagementUI();
  attachGlobalListeners();
  applyFilter("");
  state.activeIndex = -1;

  window.setTimeout(() => {
    hideLoadingScreen();
  }, 600);
}

async function loadApps() {
  showLoadingScreen();

  let remoteData = [];
  try {
    const response = await fetch(APPS_SOURCE, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    remoteData = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to load apps.json:", error);
    remoteData = [];
  }

  const remoteApps = remoteData
    .map((app) => sanitizeAppRecord(app, "preset"))
    .filter(Boolean);

  const storedCustomApps = (state.userData.customApps ?? [])
    .map((app) => sanitizeAppRecord(app, "custom"))
    .filter(Boolean);

  const combined = ensureUniqueAppIds([...remoteApps, ...storedCustomApps]);

  state.catalogApps = combined;
  state.userData.customApps = combined
    .filter((app) => app.origin === "custom")
    .map(stripAppForStorage);
  state.userData.hiddenAppIds = dedupeHiddenIds(
    state.userData.hiddenAppIds,
    combined
  );
  state.userData.pageSize = normalizePageSize(state.userData.pageSize);
  saveUserDataToStorage(state.userData);
}

function showLoadingScreen() {
  dom.loadingScreen.classList.remove("opacity-0", "pointer-events-none");
}

function hideLoadingScreen() {
  dom.loadingScreen.classList.add("opacity-0", "pointer-events-none");
  window.setTimeout(() => {
    dom.loadingScreen.style.display = "none";
  }, 500);
}

function attachGlobalListeners() {
  dom.searchInput.addEventListener("input", (event) => {
    applyFilter(event.target.value.trim());
  });

  dom.searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      openActiveApp();
    }
  });

  document.addEventListener(
    "keydown",
    (event) => {
      const key = event.key;
      if (isSettingsModalOpen()) {
        if (key === "Escape") {
          event.preventDefault();
          closeSettingsModal({ markCompleted: true });
        }
        return;
      }
      const isSearchFocused = document.activeElement === dom.searchInput;
      const normalizedKey = typeof key === "string" ? key.toLowerCase() : "";

      if (key === "Escape") {
        event.preventDefault();
        if (dom.searchInput.value !== "") {
          dom.searchInput.value = "";
          applyFilter("");
        }
        return;
      }

      if (event.metaKey && normalizedKey === "k") {
        event.preventDefault();
        dom.searchInput.focus({ preventScroll: true });
        dom.searchInput.select();
        return;
      }

      if (event.ctrlKey && normalizedKey === "k") {
        event.preventDefault();
        dom.searchInput.focus({ preventScroll: true });
        dom.searchInput.select();
        return;
      }

      if (key === "Tab") {
        event.preventDefault();
        advanceActiveIndex(event.shiftKey ? -1 : 1);
        return;
      }

      if (key === "Enter") {
        if (!isSearchFocused) {
          openActiveApp();
        }
        return;
      }

      if (key === "ArrowRight") {
        event.preventDefault();
        setPage(state.currentPage + 1);
        return;
      }

      if (key === "ArrowLeft") {
        event.preventDefault();
        setPage(state.currentPage - 1);
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (key === "Backspace" || key === "Delete") {
        if (!isSearchFocused) {
          event.preventDefault();
          removeCharacterFromSearch(key === "Backspace" ? "backspace" : "delete");
        }
        return;
      }

      if (key.length === 1 && !event.isComposing) {
        if (!isSearchFocused) {
          event.preventDefault();
          insertCharacterIntoSearch(key);
        }
        return;
      }
    },
    true
  );

  setupSwipePaging();
  setupWheelPaging();
}

function setupSwipePaging() {
  let pointerId = null;
  let startX = 0;

  dom.gridViewport.style.touchAction = "pan-y";

  dom.gridViewport.addEventListener("pointerdown", (event) => {
    if (isMobileLayout()) return;
    pointerId = event.pointerId;
    startX = event.clientX;
    dom.gridViewport.setPointerCapture(pointerId);
  });

  dom.gridViewport.addEventListener("pointerup", (event) => {
    if (pointerId !== event.pointerId) return;
    if (isMobileLayout()) {
      pointerId = null;
      return;
    }
    const delta = event.clientX - startX;
    if (Math.abs(delta) > SCROLL_PAGE_THRESHOLD) {
      if (delta < 0) {
        setPage(state.currentPage + 1);
      } else {
        setPage(state.currentPage - 1);
      }
    }
    pointerId = null;
  });

  dom.gridViewport.addEventListener("pointercancel", () => {
    pointerId = null;
  });
}

function setupWheelPaging() {
  let accumulated = 0;
  const threshold = SCROLL_PAGE_THRESHOLD * 2;

  dom.gridViewport.addEventListener(
    "wheel",
    (event) => {
      const totalPages = getTotalPages();
      if (isMobileLayout() || totalPages <= 1) return;

      const dominantDelta =
        Math.abs(event.deltaX) >= Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      if (!dominantDelta) return;

      event.preventDefault();

      accumulated += dominantDelta;

      if (Math.abs(accumulated) < threshold) return;

      if (accumulated > 0) {
        setPage(state.currentPage + 1);
      } else {
        setPage(state.currentPage - 1);
      }

      accumulated = 0;
    },
    { passive: false }
  );
}

function applyFilter(term) {
  state.searchTerm = term;
  const normalized = term.toLowerCase();

  if (!normalized) {
    state.filteredApps = [...state.apps];
  } else {
    state.filteredApps = state.apps.filter((app) => {
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

  state.currentPage = 0;
  if (!normalized) {
    state.activeIndex = -1;
  } else if (state.filteredApps.length > 0) {
    state.activeIndex = 0;
  } else {
    state.activeIndex = -1;
  }
  render();
}

function updateVisibleApps() {
  const hiddenSet = new Set(state.userData.hiddenAppIds);
  state.apps = state.catalogApps.filter((app) => !hiddenSet.has(app.id));
}

function render() {
  renderPages();
  renderPagination();
  updateEmptyState();
  updateActiveCard();
}

function renderPages() {
  dom.pagesWrapper.innerHTML = "";

  const isMobile = isMobileLayout();
  const totalPages = getTotalPages();
  const safePageIndex = Math.min(state.currentPage, totalPages - 1);

  if (safePageIndex !== state.currentPage) {
    state.currentPage = safePageIndex;
  }

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
    const page = document.createElement("div");
    page.className = isMobile
      ? "flex w-full items-stretch justify-center"
      : "flex h-full w-full shrink-0 items-stretch justify-center";

    const grid = document.createElement("div");
    grid.className = isMobile
      ? "grid w-full grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-7"
      : "grid h-full w-full grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-7";

    const desktopPageSize = getDesktopPageSize();
    const pageSize = isMobile ? state.filteredApps.length : desktopPageSize;
    const start = isMobile ? 0 : pageIndex * pageSize;
    const end = isMobile ? state.filteredApps.length : start + pageSize;
    const slice = state.filteredApps.slice(start, end);

    slice.forEach((app, sliceIndex) => {
      const absoluteIndex = isMobile ? sliceIndex : start + sliceIndex;
      const card = createAppCard(app, absoluteIndex);
      grid.appendChild(card);
    });

    if (!isMobile) {
      const placeholders = Math.max(desktopPageSize - slice.length, 0);
      for (let i = 0; i < placeholders; i += 1) {
        const filler = document.createElement("div");
        filler.className = "hidden md:block";
        grid.appendChild(filler);
      }
    }

    page.appendChild(grid);
    dom.pagesWrapper.appendChild(page);
  }

  if (isMobile) {
    dom.pagesWrapper.style.transform = "none";
    if (dom.gridViewport) {
      dom.gridViewport.scrollTop = 0;
    }
  } else {
    dom.pagesWrapper.style.transform = `translateX(-${
      state.currentPage * 100
    }%)`;
  }
}

function createAppCard(app, absoluteIndex) {
  const clone = dom.cardTemplate.content.firstElementChild.cloneNode(true);
  const nameEl = clone.querySelector("[data-app-name]");
  const iconEl = clone.querySelector("[data-app-icon]");

  clone.dataset.appId = app.id;
  clone.dataset.index = String(absoluteIndex);
  clone.title = app.description ?? app.name;
  nameEl.textContent = app.name;
  iconEl.src = resolveIconSource(app.icon);
  iconEl.alt = `${app.name} icon`;
  iconEl.dataset.fallbackApplied = "false";
  iconEl.addEventListener("error", () => applyIconFallback(iconEl));

  clone.addEventListener("click", () => openApp(app));

  clone.addEventListener("dblclick", () => openApp(app));

  clone.addEventListener("focus", () => {
    const idx = Number.parseInt(clone.dataset.index, 10);
    if (!Number.isNaN(idx)) {
      setActiveIndex(idx, { syncPage: true });
    }
  });

  return clone;
}

function focusSearchInput() {
  dom.searchInput.focus({ preventScroll: true });
}

function insertCharacterIntoSearch(char) {
  focusSearchInput();
  const input = dom.searchInput;
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const nextValue =
    input.value.slice(0, start) + char + input.value.slice(end);

  input.value = nextValue;
  const cursor = start + char.length;
  input.setSelectionRange(cursor, cursor);
  applyFilter(input.value.trim());
}

function removeCharacterFromSearch(mode) {
  focusSearchInput();
  const input = dom.searchInput;
  let start = input.selectionStart ?? input.value.length;
  let end = input.selectionEnd ?? input.value.length;

  if (start === end) {
    if (mode === "backspace" && start > 0) {
      start -= 1;
    } else if (mode === "delete" && end < input.value.length) {
      end += 1;
    } else {
      return;
    }
  }

  const nextValue = input.value.slice(0, start) + input.value.slice(end);
  input.value = nextValue;
  input.setSelectionRange(start, start);
  applyFilter(input.value.trim());
}

function resolveIconSource(source) {
  return sanitizeIconSource(source);
}

function applyIconFallback(image) {
  if (image.dataset.fallbackApplied === "true") return;
  image.dataset.fallbackApplied = "true";
  image.src = DEFAULT_ICON;
}

function renderPagination() {
  dom.paginationControls.innerHTML = "";

  const totalPages = getTotalPages();

  if (isMobileLayout() || totalPages <= 1) {
    dom.paginationControls.classList.add("hidden");
    dom.paginationControls.classList.add("invisible");
    return;
  }

  dom.paginationControls.classList.remove("hidden");
  dom.paginationControls.classList.remove("invisible");

  for (let i = 0; i < totalPages; i += 1) {
    const indicator = document.createElement("button");
    indicator.type = "button";
    indicator.className = [
      "h-2 rounded-full transition-all duration-300",
      i === state.currentPage
        ? "pagination-indicator-active"
        : "pagination-indicator-inactive",
    ].join(" ");
    indicator.setAttribute("aria-label", `Go to page ${i + 1}`);
    indicator.addEventListener("click", () => {
      setPage(i);
    });
    dom.paginationControls.appendChild(indicator);
  }
}

function updateEmptyState() {
  if (state.filteredApps.length === 0) {
    dom.emptyState.classList.remove("hidden");
  } else {
    dom.emptyState.classList.add("hidden");
  }
}

function setPage(pageIndex, options = {}) {
  if (isMobileLayout()) {
    state.currentPage = 0;
    dom.pagesWrapper.style.transform = "none";
    return;
  }

  const totalPages = getTotalPages();
  const clamped = Math.min(Math.max(pageIndex, 0), totalPages - 1);
  if (clamped === state.currentPage) return;

  state.currentPage = clamped;
  dom.pagesWrapper.style.transform = `translateX(-${clamped * 100}%)`;
  renderPagination();

  if (!options.skipActiveSync && state.activeIndex !== -1) {
    const firstIndex = clamped * getDesktopPageSize();
    setActiveIndex(firstIndex, { syncPage: false });
  }
}

function setActiveIndex(index, options = {}) {
  if (state.filteredApps.length === 0) {
    state.activeIndex = -1;
    updateActiveCard();
    return;
  }
  const maxIndex = state.filteredApps.length - 1;
  const clamped = Math.min(Math.max(index, 0), maxIndex);
  state.activeIndex = clamped;

  if (options.syncPage !== false) {
    if (state.activeIndex >= 0) {
      const pageSize = getEffectivePageSize();
      const targetPage = Math.floor(clamped / pageSize);
      state.currentPage = targetPage;
      if (isMobileLayout()) {
        dom.pagesWrapper.style.transform = "none";
      } else {
        dom.pagesWrapper.style.transform = `translateX(-${targetPage * 100}%)`;
      }
      renderPagination();
    }
  }

  updateActiveCard();
}

function advanceActiveIndex(delta) {
  if (state.filteredApps.length === 0) return;
  if (state.activeIndex === -1) {
    setActiveIndex(delta > 0 ? 0 : state.filteredApps.length - 1);
    return;
  }
  const nextIndex =
    (state.activeIndex + delta + state.filteredApps.length) %
    state.filteredApps.length;
  setActiveIndex(nextIndex);
}

function updateActiveCard() {
  const buttons = dom.pagesWrapper.querySelectorAll(".app-card");
  buttons.forEach((button) => {
    button.classList.remove("translate-y-1", "scale-105");
    button.setAttribute("tabindex", "-1");
  });

  if (state.filteredApps.length === 0 || state.activeIndex === -1) return;

  const activeId = state.filteredApps[state.activeIndex]?.id;
  if (!activeId) return;

  const activeButton = dom.pagesWrapper.querySelector(
    `.app-card[data-app-id="${CSS.escape(activeId)}"]`
  );
  if (!activeButton) return;

  activeButton.classList.add("translate-y-1","scale-105");
  activeButton.setAttribute("tabindex", "0");

  if (
    document.activeElement !== dom.searchInput &&
    !dom.pagesWrapper.contains(document.activeElement)
  ) {
    activeButton.focus({ preventScroll: true });
  }
}

function openActiveApp() {
  if (!state.filteredApps.length) return;
  const app = state.filteredApps[state.activeIndex];
  if (app?.url) {
    window.open(app.url, "_blank", "noopener,noreferrer");
  }
}

function openApp(app) {
  const index = state.filteredApps.findIndex((item) => item.id === app.id);
  if (index !== -1) {
    setActiveIndex(index, { syncPage: true });
  }

  if (app.url) {
    window.open(app.url, "_blank", "noopener,noreferrer");
  }
}

function handleLayoutChange() {
  state.currentPage = 0;

  if (isMobileLayout()) {
    dom.pagesWrapper.style.transform = "none";
  }

  render();
  if (dom.gridViewport) {
    dom.gridViewport.scrollTop = 0;
  }
}

if (typeof mobileLayoutQuery.addEventListener === "function") {
  mobileLayoutQuery.addEventListener("change", handleLayoutChange);
} else if (typeof mobileLayoutQuery.addListener === "function") {
  mobileLayoutQuery.addListener(handleLayoutChange);
}

init();
