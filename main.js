const APPS_SOURCE = "./apps.sample.json";
const DEFAULT_PAGE_SIZE = 28;
const MIN_PAGE_SIZE = 14;
const MAX_PAGE_SIZE = 56;
const PAGE_SIZE_STEP = 7;
const SCROLL_PAGE_THRESHOLD = 60;
const DEFAULT_ICON = "./default-icon.svg";
const HIDDEN_GROUP_ID = "__hidden_group__";
const HIDDEN_GROUP_ICON =
  "https://img.icons8.com/ios-filled/100/ffffff/invisible.png";
const LONG_PRESS_DURATION_MS = 500;
const CONTEXT_MENU_MARGIN = 12;
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

class LaunchpadApp {
  constructor() {
    this.defaultSettings = { ...defaultSettings };
    this.defaultUserData = { ...defaultUserData };
    this.state = {
      catalogApps: [],
      apps: [],
      hiddenApps: [],
      filteredApps: [],
      searchTerm: "",
      currentPage: 0,
      activeIndex: 0,
      settings: { ...this.defaultSettings },
      userData: { ...this.defaultUserData },
      editingAppId: null,
      contextMenu: {
        appId: null,
        source: null,
      },
    };
    this.dom = {
      loadingScreen: document.getElementById("loading-screen"),
      searchInput: document.getElementById("search-input"),
      pagesWrapper: document.getElementById("launchpad-pages"),
      paginationControls: document.getElementById("pagination-controls"),
      cardTemplate: document.getElementById("app-card-template"),
      emptyState: document.getElementById("empty-state"),
      gridViewport: document.getElementById("launchpad-grid"),
      backgroundOverlay: document.getElementById("background-overlay"),
      openSettingsButton: document.getElementById("open-settings"),
      openAddAppButton: document.getElementById("open-add-app"),
      settingsModal: document.getElementById("settings-modal"),
      settingsForm: document.getElementById("settings-form"),
      settingsCancel: document.getElementById("settings-cancel"),
      settingsSkip: document.getElementById("settings-skip"),
      addAppModal: document.getElementById("add-app-modal"),
      addAppForm: document.getElementById("add-app-form"),
      addAppClose: document.getElementById("add-app-close"),
      addAppCancel: document.getElementById("add-app-cancel"),
      addAppTitle: document.getElementById("add-app-modal-title"),
      addAppCaption: document.getElementById("add-app-modal-caption"),
      hiddenAppsModal: document.getElementById("hidden-apps-modal"),
      hiddenAppsClose: document.getElementById("hidden-apps-close"),
      hiddenAppsList: document.getElementById("hidden-apps-list"),
      hiddenAppsEmpty: document.getElementById("hidden-apps-empty"),
      contextMenu: document.getElementById("app-context-menu"),
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
      customAppNameInput: document.getElementById("custom-app-name"),
      customAppUrlInput: document.getElementById("custom-app-url"),
      customAppDescriptionInput: document.getElementById(
        "custom-app-description"
      ),
      customAppTagsInput: document.getElementById("custom-app-tags"),
      customAppFeedback: document.getElementById("custom-app-feedback"),
      customIconOptions: document.querySelector("[data-custom-icon-options]"),
      customIconCustomFields: document.querySelector(
        "[data-custom-icon-custom-fields]"
      ),
      customIconCustomInput: document.getElementById("custom-app-icon-custom"),
    };
    this.mobileLayoutQuery = window.matchMedia(MOBILE_BREAKPOINT);
    this.appSource = APPS_SOURCE;
  }


  isMobileLayout = () => {
    return this.mobileLayoutQuery.matches;
  }

  getDesktopPageSize = () => {
    return this.normalizePageSize(this.state.userData?.pageSize ?? DEFAULT_PAGE_SIZE);
  }

  getTotalPages = () => {
    if (this.isMobileLayout()) {
      return 1;
    }

    const pageSize = this.getDesktopPageSize();
    return Math.max(1, Math.ceil(this.state.filteredApps.length / pageSize));
  }

  getEffectivePageSize = () => {
    if (this.isMobileLayout()) {
      return Math.max(this.state.filteredApps.length, 1);
    }

    return this.getDesktopPageSize();
  }

  loadSettingsFromStorage = () => {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) {
        return { ...this.defaultSettings };
      }
      const parsed = JSON.parse(raw);
      return {
        ...this.defaultSettings,
        ...parsed,
        backgroundType: parsed.backgroundType === "color" ? "color" : "image",
        overlayOpacity: this.clampNumber(
          parsed.overlayOpacity,
          0,
          0.6,
          this.defaultSettings.overlayOpacity
        ),
        blurStrength: this.clampNumber(
          parsed.blurStrength,
          0,
          20,
          this.defaultSettings.blurStrength
        ),
        glassTintOpacity: this.clampNumber(
          parsed.glassTintOpacity,
          0.05,
          0.95,
          this.defaultSettings.glassTintOpacity
        ),
        glassTintColor: this.resolveHexColor(
          parsed.glassTintColor,
          this.defaultSettings.glassTintColor
        ),
        backgroundColor: this.resolveHexColor(
          parsed.backgroundColor,
          this.defaultSettings.backgroundColor
        ),
        backgroundImage: this.sanitizeBackgroundImage(parsed.backgroundImage) || "",
      };
    } catch (error) {
      console.warn("Failed to read settings from storage", error);
      return { ...this.defaultSettings };
    }
  }

  saveSettingsToStorage = (settings) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn("Failed to save settings", error);
    }
  }

  clampNumber = (value, min, max, fallback) => {
    const number = Number.parseFloat(value);
    if (!Number.isFinite(number)) {
      return fallback;
    }
    return Math.min(Math.max(number, min), max);
  }

  normalizePageSize = (value) => {
    const fallback = this.defaultUserData.pageSize;
    const clamped = this.clampNumber(value, MIN_PAGE_SIZE, MAX_PAGE_SIZE, fallback);
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

  loadUserDataFromStorage = () => {
    try {
      const raw = localStorage.getItem(USER_DATA_STORAGE_KEY);
      if (!raw) {
        return { ...this.defaultUserData };
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
      const pageSize = this.normalizePageSize(parsed.pageSize);
      return {
        hiddenAppIds,
        customApps,
        pageSize,
      };
    } catch (error) {
      console.warn("Failed to read user data from storage", error);
      return { ...this.defaultUserData };
    }
  }

  saveUserDataToStorage = (data) => {
    try {
      localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to save user data", error);
    }
  }

  sanitizeHttpUrl = (value) => {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    if (!trimmed || /^javascript:/i.test(trimmed)) return "";
    if (!/^https?:\/\//i.test(trimmed)) return "";
    return trimmed;
  }

  sanitizeIconSource = (value) => {
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

  sanitizeTagList = (tags) => {
    if (!Array.isArray(tags)) return [];
    return tags
      .map((tag) => String(tag ?? "").trim())
      .filter((tag) => tag.length > 0);
  }

  parseCustomTagString = (value) => {
    if (typeof value !== "string") return [];
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  sanitizeAppRecord = (app, origin) => {
    if (!app || typeof app !== "object") return null;
    const name = typeof app.name === "string" ? app.name.trim() : "";
    const description =
      typeof app.description === "string" ? app.description.trim() : "";
    const url = this.sanitizeHttpUrl(app.url);
    const icon = this.sanitizeIconSource(app.icon);
    const tags = this.sanitizeTagList(app.tags);
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

  createSlugId = (prefix, name) => {
    const baseName = String(name ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const fallback = `${prefix}-${Date.now().toString(36)}`;
    return baseName ? `${prefix}-${baseName}` : fallback;
  }

  ensureUniqueAppIds = (apps) => {
    const seen = new Set();
    return apps.map((app) => {
      let baseId =
        typeof app.id === "string" && app.id.trim().length > 0
          ? app.id.trim()
          : this.createSlugId(app.origin === "custom" ? "custom" : "app", app.name);
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

  stripAppForStorage = (app) => {
    const { origin, ...rest } = app;
    return rest;
  }

  dedupeHiddenIds = (hiddenIds, apps) => {
    if (!Array.isArray(hiddenIds)) return [];
    const validIds = new Set(apps.map((app) => app.id));
    return hiddenIds
      .map((id) => (typeof id === "string" ? id.trim() : ""))
      .filter((id) => id.length > 0 && validIds.has(id));
  }

  getIconLibrary = () => {
    const icons = new Set(BASE_ICON_LIBRARY);
    this.state.catalogApps.forEach((app) => {
      if (typeof app.icon === "string") {
        const sanitized = this.sanitizeIconSource(app.icon);
        if (sanitized) {
          icons.add(sanitized);
        }
      }
    });
    return Array.from(icons);
  }

  hexToRgb = (hex) => {
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

  rgbToHex = (rgb) => {
    if (!rgb) return null;
    const toHex = (component) => component.toString(16).padStart(2, "0");
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  rgbToRgba = (rgb, alpha) => {
    if (!rgb) return "rgba(15, 23, 42, 0.4)";
    const safeAlpha = Math.min(Math.max(alpha, 0), 1);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${safeAlpha})`;
  }

  resolveHexColor = (value, fallback) => {
    const rgb = this.hexToRgb(value);
    if (rgb) {
      return this.rgbToHex(rgb);
    }
    const fallbackRgb = this.hexToRgb(fallback);
    return fallbackRgb ? this.rgbToHex(fallbackRgb) : fallback;
  }

  sanitizeBackgroundImage = (value) => {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/javascript:/i.test(trimmed)) return "";
    return trimmed;
  }

  applySettings = (settings) => {
    const overlayOpacity = this.clampNumber(
      settings.overlayOpacity,
      0,
      0.6,
      this.defaultSettings.overlayOpacity
    );
    const blurStrength = this.clampNumber(
      settings.blurStrength,
      0,
      20,
      this.defaultSettings.blurStrength
    );
    const glassOpacity = this.clampNumber(
      settings.glassTintOpacity,
      0.05,
      0.95,
      this.defaultSettings.glassTintOpacity
    );
    const glassHex = this.resolveHexColor(
      settings.glassTintColor,
      this.defaultSettings.glassTintColor
    );
    const glassRgb = this.hexToRgb(glassHex) ?? this.hexToRgb(this.defaultSettings.glassTintColor);

    document.documentElement.style.setProperty(
      "--overlay-color",
      this.rgbToRgba(glassRgb, overlayOpacity)
    );
    document.documentElement.style.setProperty(
      "--overlay-blur",
      `${blurStrength}px`
    );
    document.documentElement.style.setProperty(
      "--glass-tint",
      this.rgbToRgba(glassRgb, glassOpacity)
    );

    if (settings.backgroundType === "color") {
      const backgroundHex = this.resolveHexColor(
        settings.backgroundColor,
        this.defaultSettings.backgroundColor
      );
      document.body.style.backgroundImage = "none";
      document.body.style.backgroundColor = backgroundHex;
      document.documentElement.style.setProperty(
        "--fallback-background-color",
        backgroundHex
      );
    } else {
      const source = this.sanitizeBackgroundImage(settings.backgroundImage);
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
        this.defaultSettings.backgroundColor
      );
    }
  }

  populateSettingsForm = (settings) => {
    const form = this.dom.settingsForm;
    if (!form) return;

    const merged = {
      ...this.defaultSettings,
      ...settings,
    };

    const typeInputs = form.querySelectorAll('input[name="backgroundType"]');
    typeInputs.forEach((input) => {
      input.checked = input.value === merged.backgroundType;
    });

    this.syncBackgroundImageSelection(merged.backgroundImage ?? "");

    if (form.elements.backgroundColor) {
      form.elements.backgroundColor.value = this.resolveHexColor(
        merged.backgroundColor,
        this.defaultSettings.backgroundColor
      );
    }
    if (form.elements.overlayOpacity) {
      form.elements.overlayOpacity.value = this.clampNumber(
        merged.overlayOpacity,
        0,
        0.6,
        this.defaultSettings.overlayOpacity
      );
    }
    if (form.elements.blurStrength) {
      form.elements.blurStrength.value = this.clampNumber(
        merged.blurStrength,
        0,
        20,
        this.defaultSettings.blurStrength
      );
    }
    if (form.elements.glassTintOpacity) {
      form.elements.glassTintOpacity.value = this.clampNumber(
        merged.glassTintOpacity,
        0.05,
        0.95,
        this.defaultSettings.glassTintOpacity
      );
    }
    if (form.elements.glassTintColor) {
      form.elements.glassTintColor.value = this.resolveHexColor(
        merged.glassTintColor,
        this.defaultSettings.glassTintColor
      );
    }

    this.syncBackgroundFieldVisibility(merged.backgroundType);
    this.updateSettingsIndicators(merged);

    if (this.dom.pageSizeInput) {
      const pageSize = this.getDesktopPageSize();
      this.dom.pageSizeInput.value = String(pageSize);
      this.updatePageSizeIndicator(pageSize);
    }

    this.renderCustomIconOptions();
  }

  syncBackgroundFieldVisibility = (backgroundType) => {
    if (!this.dom.backgroundImageFields || !this.dom.backgroundColorFields) return;
    if (backgroundType === "color") {
      this.dom.backgroundImageFields.classList.add("hidden");
      this.dom.backgroundColorFields.classList.remove("hidden");
    } else {
      this.dom.backgroundImageFields.classList.remove("hidden");
      this.dom.backgroundColorFields.classList.add("hidden");
    }
  }

  syncBackgroundImageSelection = (currentValue) => {
    if (!this.dom.settingsForm) return;

    const choiceInputs = this.dom.settingsForm.querySelectorAll(
      'input[name="backgroundImageChoice"]'
    );

    const normalized = this.sanitizeBackgroundImage(currentValue);
    const matchedChoice = PRESET_BACKGROUND_OPTIONS.includes(normalized)
      ? normalized
      : normalized
      ? "custom"
      : PRESET_BACKGROUND_OPTIONS[0];

    choiceInputs.forEach((input) => {
      input.checked = input.value === matchedChoice;
    });

    if (this.dom.backgroundImageCustomInput) {
      this.dom.backgroundImageCustomInput.value =
        matchedChoice === "custom" ? normalized : "";
    }

    this.syncBackgroundImageCustomVisibility(matchedChoice);
  }

  syncBackgroundImageCustomVisibility = (choiceValue) => {
    if (!this.dom.backgroundImageCustomFields) return;
    if (choiceValue === "custom") {
      this.dom.backgroundImageCustomFields.classList.remove("hidden");
      this.dom.backgroundImageCustomInput?.removeAttribute("disabled");
    } else {
      this.dom.backgroundImageCustomFields.classList.add("hidden");
      this.dom.backgroundImageCustomInput?.setAttribute("disabled", "true");
    }
  }

  updateSettingsIndicators = (settings) => {
    if (this.dom.overlayValue) {
      const percent = Math.round(
        this.clampNumber(
          settings.overlayOpacity,
          0,
          0.6,
          this.defaultSettings.overlayOpacity
        ) * 100
      );
      this.dom.overlayValue.textContent = `${percent}%`;
    }
    if (this.dom.blurValue) {
      const blur = Math.round(
        this.clampNumber(
          settings.blurStrength,
          0,
          20,
          this.defaultSettings.blurStrength
        )
      );
      this.dom.blurValue.textContent = `${blur}px`;
    }
    if (this.dom.glassValue) {
      const opacityPercent = Math.round(
        this.clampNumber(
          settings.glassTintOpacity,
          0.05,
          0.95,
          this.defaultSettings.glassTintOpacity
        ) * 100
      );
      this.dom.glassValue.textContent = `${opacityPercent}%`;
    }
  }

  updatePageSizeIndicator = (value) => {
    if (!this.dom.pageSizeValue) return;
    const numeric = Number.parseInt(
      value ?? this.dom.pageSizeInput?.value ?? this.getDesktopPageSize(),
      10
    );
    if (Number.isFinite(numeric)) {
      this.dom.pageSizeValue.textContent = `${numeric}`;
    }
  }

  syncCustomIconCustomVisibility = (choiceValue) => {
    if (!this.dom.customIconCustomFields) return;
    if (choiceValue === "custom") {
      this.dom.customIconCustomFields.classList.remove("hidden");
      this.dom.customIconCustomInput?.removeAttribute("disabled");
    } else {
      this.dom.customIconCustomFields.classList.add("hidden");
      this.dom.customIconCustomInput?.setAttribute("disabled", "true");
    }
  }

  renderCustomIconOptions = (preferredValue) => {
    if (!this.dom.customIconOptions) return;
    const container = this.dom.customIconOptions;
    const currentSelection = container.querySelector(
      'input[name="customAppIconChoice"]:checked'
    );
    const selectedValue = preferredValue ?? currentSelection?.value ?? null;

    container.innerHTML = "";
    const icons = this.getIconLibrary();
    const hasPresetMatch =
      typeof selectedValue === "string" && icons.includes(selectedValue);
    const preferredCustomValue =
      typeof selectedValue === "string" && !hasPresetMatch && selectedValue !== "custom"
        ? selectedValue
        : "";
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

    if (!hasMatched && (selectedValue === "custom" || preferredCustomValue)) {
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

    if (this.dom.customIconCustomInput) {
      if (preferredCustomValue) {
        this.dom.customIconCustomInput.value = preferredCustomValue;
      } else if (selectedValue !== "custom") {
        this.dom.customIconCustomInput.value = "";
      }
    }

    const finalSelection = container.querySelector(
      'input[name="customAppIconChoice"]:checked'
    );
    this.syncCustomIconCustomVisibility(finalSelection?.value ?? "custom");
  }

  showCustomAppFeedback = (message, variant = "info") => {
    if (!this.dom.customAppFeedback) return;
    this.dom.customAppFeedback.textContent = message;
    this.dom.customAppFeedback.classList.remove(
      "text-emerald-400",
      "text-rose-400",
      "text-slate-500"
    );
    if (variant === "success") {
      this.dom.customAppFeedback.classList.add("text-emerald-400");
    } else if (variant === "error") {
      this.dom.customAppFeedback.classList.add("text-rose-400");
    } else {
      this.dom.customAppFeedback.classList.add("text-slate-500");
    }
  }

  resetCustomAppForm = () => {
    this.state.editingAppId = null;
    if (this.dom.addAppForm) {
      this.dom.addAppForm.reset();
      this.dom.addAppForm.dataset.mode = "create";
    }
    this.dom.customAppNameInput && (this.dom.customAppNameInput.value = "");
    this.dom.customAppUrlInput && (this.dom.customAppUrlInput.value = "");
    this.dom.customAppDescriptionInput && (this.dom.customAppDescriptionInput.value = "");
    this.dom.customAppTagsInput && (this.dom.customAppTagsInput.value = "");
    this.dom.customIconCustomInput && (this.dom.customIconCustomInput.value = "");
    this.showCustomAppFeedback("", "info");
    this.updateAddAppModalLabels("create");
    this.renderCustomIconOptions();
  }

  getSelectedCustomIconChoice = () => {
    if (!this.dom.customIconOptions) return null;
    const selected = this.dom.customIconOptions.querySelector(
      'input[name="customAppIconChoice"]:checked'
    );
    if (selected instanceof HTMLInputElement) {
      return selected.value;
    }
    return null;
  }

  handleCustomIconOptionChange = (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.name !== "customAppIconChoice") return;
    this.syncCustomIconCustomVisibility(target.value);
    if (target.value === "custom") {
      window.setTimeout(() => {
        this.dom.customIconCustomInput?.focus({ preventScroll: true });
      }, 0);
    }
  }

  updateAddAppModalLabels = (mode, appName = "") => {
    const isEditing = mode === "edit";
    if (this.dom.addAppForm) {
      this.dom.addAppForm.dataset.mode = mode;
    }
    if (this.dom.addAppTitle) {
      this.dom.addAppTitle.textContent = isEditing
        ? "Edit application"
        : "Add application";
    }
    if (this.dom.addAppCaption) {
      this.dom.addAppCaption.textContent = isEditing
        ? "Update the shortcut you created."
        : "Quickly add a shortcut to the launchpad.";
    }
    const submitButton = this.dom.addAppForm?.querySelector("#custom-app-submit");
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.textContent = isEditing ? "Save changes" : "Add app";
    }
    if (isEditing && appName && this.dom.addAppTitle) {
      this.dom.addAppTitle.textContent = `Edit "${appName}"`;
    }
  }

  populateCustomAppForm = (app) => {
    if (!app) {
      this.resetCustomAppForm();
      return;
    }

    this.state.editingAppId = app.id;

    if (this.dom.customAppNameInput) {
      this.dom.customAppNameInput.value = app.name ?? "";
    }
    if (this.dom.customAppUrlInput) {
      this.dom.customAppUrlInput.value = app.url ?? "";
    }
    if (this.dom.customAppDescriptionInput) {
      this.dom.customAppDescriptionInput.value = app.description ?? "";
    }
    if (this.dom.customAppTagsInput) {
      this.dom.customAppTagsInput.value = Array.isArray(app.tags)
        ? app.tags.join(", ")
        : "";
    }
    this.renderCustomIconOptions(app.icon ?? null);
    this.showCustomAppFeedback("", "info");
    this.updateAddAppModalLabels("edit", app.name ?? "");
  }

  isAddAppModalOpen = () => {
    return Boolean(
      this.dom.addAppModal && !this.dom.addAppModal.classList.contains("hidden")
    );
  }

  isHiddenAppsModalOpen = () => {
    return Boolean(
      this.dom.hiddenAppsModal && !this.dom.hiddenAppsModal.classList.contains("hidden")
    );
  }

  unlockBodyScrollIfSafe = () => {
    if (
      !this.isSettingsModalOpen() &&
      !this.isAddAppModalOpen() &&
      !this.isHiddenAppsModalOpen()
    ) {
      document.body.classList.remove("overflow-hidden");
    }
  }

  openAddAppModal = (options = {}) => {
    if (!this.dom.addAppModal) return;
    const app = options?.app;
    if (app) {
      this.populateCustomAppForm(app);
    } else {
      this.resetCustomAppForm();
    }

    this.dom.addAppModal.classList.remove("hidden");
    this.dom.addAppModal.classList.add("flex");
    this.dom.addAppModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("overflow-hidden");
    this.hideAppContextMenu();

    window.setTimeout(() => {
      this.dom.customAppNameInput?.focus({ preventScroll: true });
    }, 0);
  }

  closeAddAppModal = () => {
    if (!this.dom.addAppModal) return;
    this.dom.addAppModal.classList.add("hidden");
    this.dom.addAppModal.classList.remove("flex");
    this.dom.addAppModal.setAttribute("aria-hidden", "true");
    this.resetCustomAppForm();
    this.unlockBodyScrollIfSafe();
  }

  handleSubmitCustomApp = (event) => {
    event.preventDefault();
    if (!this.dom.customAppNameInput || !this.dom.customAppUrlInput) return;

    const name = this.dom.customAppNameInput.value.trim();
    const url = this.sanitizeHttpUrl(this.dom.customAppUrlInput.value);
    const description = this.dom.customAppDescriptionInput?.value?.trim() ?? "";
    const tags = this.parseCustomTagString(this.dom.customAppTagsInput?.value ?? "");
    const iconChoice = this.getSelectedCustomIconChoice();

    if (!name) {
      this.showCustomAppFeedback("Please enter a name for the app.", "error");
      this.dom.customAppNameInput.focus({ preventScroll: true });
      return;
    }

    if (!url) {
      this.showCustomAppFeedback(
        "Please enter a valid link that starts with https://",
        "error"
      );
      this.dom.customAppUrlInput.focus({ preventScroll: true });
      return;
    }

    let icon = DEFAULT_ICON;
    if (iconChoice === "custom") {
      const customValue = this.dom.customIconCustomInput?.value ?? "";
      if (!customValue.trim()) {
        this.showCustomAppFeedback("Paste an icon URL or pick a preset.", "error");
        this.dom.customIconCustomInput?.focus({ preventScroll: true });
        return;
      }
      icon = this.sanitizeIconSource(customValue);
      const normalized = customValue.trim();
      const looksRelative =
        normalized.startsWith("./") || normalized.startsWith("/");
      const looksHttp = /^https?:\/\//i.test(normalized);
      if (icon === DEFAULT_ICON && !looksHttp && !looksRelative) {
        this.showCustomAppFeedback("Please use a valid image URL.", "error");
        this.dom.customIconCustomInput?.focus({ preventScroll: true });
        return;
      }
    } else if (typeof iconChoice === "string") {
      icon = this.sanitizeIconSource(iconChoice);
    }

    const editingId = this.state.editingAppId;
    if (editingId) {
      const existingApp = this.state.catalogApps.find((app) => app.id === editingId);
      if (!existingApp) {
        this.showCustomAppFeedback("Unable to find the app to update.", "error");
        return;
      }
      if (existingApp.origin !== "custom") {
        this.showCustomAppFeedback(
          "Only custom apps can be edited from here.",
          "error"
        );
        return;
      }
      const updatedApp = {
        ...existingApp,
        name,
        description,
        url,
        icon,
        tags,
      };
      this.state.catalogApps = this.state.catalogApps.map((app) =>
        app.id === editingId ? updatedApp : app
      );
      this.state.userData.customApps = this.state.userData.customApps.map((entry) =>
        entry.id === editingId ? this.stripAppForStorage(updatedApp) : entry
      );
    } else {
      const existingIds = new Set(this.state.catalogApps.map((app) => app.id));
      const baseId = this.createSlugId("custom", name);
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
      this.state.catalogApps = [...this.state.catalogApps, newApp];
      this.state.userData.customApps = [
        ...this.state.userData.customApps,
        this.stripAppForStorage(newApp),
      ];
    }

    this.state.userData.hiddenAppIds = this.dedupeHiddenIds(
      this.state.userData.hiddenAppIds,
      this.state.catalogApps
    );
    this.saveUserDataToStorage(this.state.userData);

    this.updateVisibleApps();
    this.applyFilter(this.state.searchTerm ?? "");
    this.closeAddAppModal();
  }

  openHiddenAppsModal = () => {
    if (!this.dom.hiddenAppsModal) return;
    this.renderHiddenAppsList();
    this.dom.hiddenAppsModal.classList.remove("hidden");
    this.dom.hiddenAppsModal.classList.add("flex");
    this.dom.hiddenAppsModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("overflow-hidden");
    this.hideAppContextMenu();
  }

  closeHiddenAppsModal = () => {
    if (!this.dom.hiddenAppsModal) return;
    this.dom.hiddenAppsModal.classList.add("hidden");
    this.dom.hiddenAppsModal.classList.remove("flex");
    this.dom.hiddenAppsModal.setAttribute("aria-hidden", "true");
    this.unlockBodyScrollIfSafe();
  }

  renderHiddenAppsList = () => {
    if (!this.dom.hiddenAppsList || !this.dom.hiddenAppsEmpty) return;
    this.dom.hiddenAppsList.innerHTML = "";

    if (this.state.hiddenApps.length === 0) {
      this.dom.hiddenAppsEmpty.textContent = "You do not have hidden apps right now.";
      this.dom.hiddenAppsEmpty.classList.remove("hidden");
      return;
    }

    this.dom.hiddenAppsEmpty.textContent = "";
    this.dom.hiddenAppsEmpty.classList.add("hidden");

    this.state.hiddenApps.forEach((app) => {
      const button = this.dom.cardTemplate.content.firstElementChild.cloneNode(true);
      button.classList.add(
        "w-full",
        "bg-white/5",
        "hover:bg-white/10",
        "transition",
        "shadow-inner",
        "shadow-white/5"
      );
      button.dataset.appId = app.id;
      button.removeAttribute("data-index");
      button.title = app.description ?? app.name ?? "";

      const nameEl = button.querySelector("[data-app-name]");
      const iconEl = button.querySelector("[data-app-icon]");
      if (nameEl) {
        nameEl.textContent = app.name;
        nameEl.classList.add("max-w-full");
      }
      if (iconEl) {
        iconEl.src = this.resolveIconSource(app.icon);
        iconEl.alt = `${app.name} icon`;
        iconEl.dataset.fallbackApplied = "false";
        iconEl.addEventListener("error", () => this.applyIconFallback(iconEl));
      }

      button.addEventListener("click", () => this.openApp(app));
      button.addEventListener("dblclick", () => this.openApp(app));
      this.attachContextMenuHandlers(button, app, "hidden");

      this.dom.hiddenAppsList.appendChild(button);
    });
  }

  hideApp = (appId) => {
    if (typeof appId !== "string" || !appId) return;
    const hiddenSet = new Set(this.state.userData.hiddenAppIds);
    hiddenSet.add(appId);
    this.state.userData.hiddenAppIds = this.dedupeHiddenIds(
      Array.from(hiddenSet),
      this.state.catalogApps
    );
    this.saveUserDataToStorage(this.state.userData);
    this.updateVisibleApps();
    this.applyFilter(this.state.searchTerm ?? "");
  }

  showApp = (appId) => {
    if (typeof appId !== "string" || !appId) return;
    const hiddenSet = new Set(this.state.userData.hiddenAppIds);
    hiddenSet.delete(appId);
    this.state.userData.hiddenAppIds = this.dedupeHiddenIds(
      Array.from(hiddenSet),
      this.state.catalogApps
    );
    this.saveUserDataToStorage(this.state.userData);
    this.updateVisibleApps();
    this.applyFilter(this.state.searchTerm ?? "");
  }

  buildHiddenAppsGroup = () => {
    const count = this.state.hiddenApps.length;
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

  isHiddenGroup = (app) => {
    if (!app) return false;
    return app.id === HIDDEN_GROUP_ID || app.type === "hidden-group";
  }

  attachContextMenuHandlers = (element, app, source) => {
    if (!element || !app || this.isHiddenGroup(app)) return;

    const handleContextMenu = (event) => {
      event.preventDefault();
      this.showAppContextMenu({
        app,
        source,
        x: event.clientX,
        y: event.clientY,
      });
    };

    element.addEventListener("contextmenu", handleContextMenu);

    let longPressTimer = null;
    let lastPointerEvent = null;

    const startLongPress = (event) => {
      if (event.pointerType === "mouse") return;
      lastPointerEvent = event;
      longPressTimer = window.setTimeout(() => {
        if (!lastPointerEvent) return;
        this.showAppContextMenu({
          app,
          source,
          x: lastPointerEvent.clientX,
          y: lastPointerEvent.clientY,
        });
      }, LONG_PRESS_DURATION_MS);
    };

    const clearLongPress = () => {
      if (longPressTimer) {
        window.clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      lastPointerEvent = null;
    };

    element.addEventListener("pointerdown", startLongPress, { passive: true });
    element.addEventListener("pointerup", clearLongPress, { passive: true });
    element.addEventListener("pointerleave", clearLongPress, { passive: true });
    element.addEventListener("pointercancel", clearLongPress, { passive: true });
  }

  isContextMenuOpen = () => {
    return Boolean(
      this.dom.contextMenu && !this.dom.contextMenu.classList.contains("hidden")
    );
  }

  showAppContextMenu = ({ app, source, x, y }) => {
    if (!this.dom.contextMenu) return;
    if (this.isHiddenGroup(app)) return;

    const toggleButton = this.dom.contextMenu.querySelector(
      'button[data-action="toggle-visibility"]'
    );
    const toggleLabel = toggleButton?.querySelector("span");
    if (toggleLabel) {
      toggleLabel.textContent =
        source === "hidden" ? "Show on launchpad" : "Hide from launchpad";
    }

    const editButton = this.dom.contextMenu.querySelector(
      'button[data-action="edit"]'
    );
    if (editButton) {
      if (app.origin === "custom" && !this.isHiddenGroup(app)) {
        editButton.classList.remove("hidden");
      } else {
        editButton.classList.add("hidden");
      }
    }

    this.state.contextMenu = {
      appId: app.id,
      source,
    };
    this.dom.contextMenu.dataset.appId = app.id;
    this.dom.contextMenu.dataset.source = source;

    this.dom.contextMenu.style.visibility = "hidden";
    this.dom.contextMenu.classList.remove("hidden");
    this.dom.contextMenu.style.left = "0px";
    this.dom.contextMenu.style.top = "0px";

    const { width, height } = this.dom.contextMenu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = x;
    let top = y;

    if (left + width + CONTEXT_MENU_MARGIN > viewportWidth) {
      left = viewportWidth - width - CONTEXT_MENU_MARGIN;
    }
    if (top + height + CONTEXT_MENU_MARGIN > viewportHeight) {
      top = viewportHeight - height - CONTEXT_MENU_MARGIN;
    }

    left = Math.max(CONTEXT_MENU_MARGIN, left);
    top = Math.max(CONTEXT_MENU_MARGIN, top);

    this.dom.contextMenu.style.left = `${left}px`;
    this.dom.contextMenu.style.top = `${top}px`;
    this.dom.contextMenu.style.visibility = "visible";
  }

  hideAppContextMenu = () => {
    if (!this.dom.contextMenu) return;
    this.dom.contextMenu.classList.add("hidden");
    this.dom.contextMenu.dataset.appId = "";
    this.dom.contextMenu.dataset.source = "";
    this.state.contextMenu = { appId: null, source: null };
  }

  handleContextMenuAction = (action) => {
    if (!action) return;
    const { appId, source } = this.state.contextMenu;
    if (!appId) {
      this.hideAppContextMenu();
      return;
    }

    const app =
      this.state.catalogApps.find((item) => item.id === appId) ||
      this.state.hiddenApps.find((item) => item.id === appId);
    if (!app) {
      this.hideAppContextMenu();
      return;
    }

    if (action === "open") {
      this.hideAppContextMenu();
      this.openApp(app);
      return;
    }

    if (action === "toggle-visibility") {
      this.hideAppContextMenu();
      if (source === "hidden") {
        this.showApp(appId);
      } else {
        this.hideApp(appId);
      }
      return;
    }

    if (action === "edit" && app.origin === "custom") {
      this.hideAppContextMenu();
      this.openAddAppModal({ app });
    }
  }

  setupSettingsUI = () => {
    if (!this.dom.settingsForm) return;

    this.populateSettingsForm(this.state.settings);

    this.dom.settingsForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this.handleSettingsSubmit();
    });

    const backgroundTypeInputs = this.dom.settingsForm.querySelectorAll(
      'input[name="backgroundType"]'
    );
    backgroundTypeInputs.forEach((input) => {
      input.addEventListener("change", () => {
        this.syncBackgroundFieldVisibility(input.value);
      });
    });

    const backgroundChoiceInputs = this.dom.settingsForm.querySelectorAll(
      'input[name="backgroundImageChoice"]'
    );
    backgroundChoiceInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) {
          this.syncBackgroundImageCustomVisibility(input.value);
          if (input.value === "custom") {
            window.setTimeout(() => {
              this.dom.backgroundImageCustomInput?.focus({ preventScroll: true });
            }, 0);
          }
        }
      });
    });

    const overlayRange = this.dom.settingsForm.elements.overlayOpacity;
    if (overlayRange) {
      overlayRange.addEventListener("input", (event) => {
        const value = this.clampNumber(
          event.target.value,
          0,
          0.6,
          this.defaultSettings.overlayOpacity
        );
        this.updateSettingsIndicators({ ...this.state.settings, overlayOpacity: value });
      });
    }

    const blurRange = this.dom.settingsForm.elements.blurStrength;
    if (blurRange) {
      blurRange.addEventListener("input", (event) => {
        const value = this.clampNumber(
          event.target.value,
          0,
          20,
          this.defaultSettings.blurStrength
        );
        this.updateSettingsIndicators({ ...this.state.settings, blurStrength: value });
      });
    }

    const glassRange = this.dom.settingsForm.elements.glassTintOpacity;
    if (glassRange) {
      glassRange.addEventListener("input", (event) => {
        const value = this.clampNumber(
          event.target.value,
          0.05,
          0.95,
          this.defaultSettings.glassTintOpacity
        );
        this.updateSettingsIndicators({ ...this.state.settings, glassTintOpacity: value });
      });
    }

    if (this.dom.pageSizeInput) {
      this.dom.pageSizeInput.addEventListener("input", (event) => {
        this.updatePageSizeIndicator(event.target.value);
      });
    }

    this.dom.openSettingsButton?.addEventListener("click", () => {
      this.showSettingsModal({ autofocus: true });
    });

    this.dom.settingsCancel?.addEventListener("click", () => {
      this.closeSettingsModal({ markCompleted: true });
    });

    this.dom.settingsSkip?.addEventListener("click", () => {
      this.closeSettingsModal({ markCompleted: true });
    });

    this.dom.settingsModal?.addEventListener("click", (event) => {
      if (event.target === this.dom.settingsModal) {
        this.closeSettingsModal({ markCompleted: true });
      }
    });

    if (typeof this.mobileLayoutQuery.addEventListener === "function") {
      this.mobileLayoutQuery.addEventListener("change", () => {
        if (this.isSettingsModalOpen()) {
          this.prepareSettingsPanelsForLayout();
        }
      });
    } else if (typeof this.mobileLayoutQuery.addListener === "function") {
      this.mobileLayoutQuery.addListener(() => {
        if (this.isSettingsModalOpen()) {
          this.prepareSettingsPanelsForLayout();
        }
      });
    }
  }

  setupAddAppModal = () => {
    if (!this.dom.addAppModal || !this.dom.addAppForm) return;

    this.dom.openAddAppButton?.addEventListener("click", () => {
      this.openAddAppModal();
    });

    this.dom.addAppClose?.addEventListener("click", () => {
      this.closeAddAppModal();
    });

    this.dom.addAppCancel?.addEventListener("click", () => {
      this.closeAddAppModal();
    });

    this.dom.addAppModal.addEventListener("click", (event) => {
      if (event.target === this.dom.addAppModal) {
        this.closeAddAppModal();
      }
    });

    this.dom.addAppForm.addEventListener("submit", this.handleSubmitCustomApp);
    this.dom.customIconOptions?.addEventListener("change", this.handleCustomIconOptionChange);

    this.resetCustomAppForm();
  }

  setupHiddenAppsModal = () => {
    if (!this.dom.hiddenAppsModal) return;

    this.dom.hiddenAppsClose?.addEventListener("click", () => {
      this.closeHiddenAppsModal();
    });

    this.dom.hiddenAppsModal.addEventListener("click", (event) => {
      if (event.target === this.dom.hiddenAppsModal) {
        this.closeHiddenAppsModal();
      }
    });
  }

  setupContextMenu = () => {
    if (!this.dom.contextMenu) return;

    this.dom.contextMenu.addEventListener("click", (event) => {
      const button = event.target.closest(".context-menu-item");
      if (!(button instanceof HTMLButtonElement)) return;
      const action = button.dataset.action;
      if (!action) return;
      event.preventDefault();
      this.handleContextMenuAction(action);
    });

    document.addEventListener("pointerdown", (event) => {
      if (!this.isContextMenuOpen()) return;
      if (
        event.target instanceof Node &&
        this.dom.contextMenu?.contains(event.target)
      ) {
        return;
      }
      this.hideAppContextMenu();
    });

    window.addEventListener("blur", this.hideAppContextMenu);
    window.addEventListener("scroll", this.hideAppContextMenu, true);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.isContextMenuOpen()) {
        this.hideAppContextMenu();
      }
    });
  }

  showSettingsModal = (options = {}) => {
    if (!this.dom.settingsModal) return;
    this.populateSettingsForm(this.state.settings);
    this.dom.settingsModal.classList.remove("hidden");
    this.dom.settingsModal.classList.add("flex");
    this.dom.settingsModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("overflow-hidden");
    this.prepareSettingsPanelsForLayout();

    if (options.autofocus !== false) {
      window.setTimeout(() => {
        if (!this.dom.settingsForm) return;
        const preferred = Array.from(
          this.dom.settingsForm.querySelectorAll("[data-autofocus]")
        );
        const fallbacks = Array.from(
          this.dom.settingsForm.querySelectorAll("input, select, textarea, button")
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

  getSettingsPanels = () => {
    if (!this.dom.settingsForm) return [];
    return Array.from(
      this.dom.settingsForm.querySelectorAll("[data-settings-panel]")
    );
  }

  prepareSettingsPanelsForLayout = () => {
    const panels = this.getSettingsPanels();
    const preferCondensed = this.isMobileLayout();

    panels.forEach((panel) => {
      if (!(panel instanceof HTMLDetailsElement)) return;
      if (!preferCondensed) {
        panel.setAttribute("open", "");
        return;
      }

      if (panel.hasAttribute("data-open-mobile")) {
        panel.setAttribute("open", "");
      } else {
        panel.removeAttribute("open");
      }
    });
  }

  closeSettingsModal = (options = {}) => {
    if (!this.dom.settingsModal) return;
    this.dom.settingsModal.classList.add("hidden");
    this.dom.settingsModal.classList.remove("flex");
    this.dom.settingsModal.setAttribute("aria-hidden", "true");
    this.unlockBodyScrollIfSafe();
    this.populateSettingsForm(this.state.settings);

    if (options.markCompleted) {
      this.state.settings = {
        ...this.state.settings,
        hasCompletedSetup: true,
      };
      this.saveSettingsToStorage(this.state.settings);
    }
  }

  isSettingsModalOpen = () => {
    return Boolean(
      this.dom.settingsModal && !this.dom.settingsModal.classList.contains("hidden")
    );
  }

  handleSettingsSubmit = () => {
    if (!this.dom.settingsForm) return;
    const formData = new FormData(this.dom.settingsForm);
    const backgroundType =
      formData.get("backgroundType") === "color" ? "color" : "image";

    const rawChoice = formData.get("backgroundImageChoice");
    const backgroundChoice =
      typeof rawChoice === "string" && rawChoice
        ? rawChoice
        : PRESET_BACKGROUND_OPTIONS[0];

    const backgroundImage =
      backgroundChoice === "custom"
        ? this.sanitizeBackgroundImage(formData.get("backgroundImageCustom"))
        : this.sanitizeBackgroundImage(backgroundChoice);

    const nextSettings = {
      backgroundType,
      backgroundImage,
      backgroundColor: this.resolveHexColor(
        formData.get("backgroundColor"),
        this.defaultSettings.backgroundColor
      ),
      overlayOpacity: this.clampNumber(
        formData.get("overlayOpacity"),
        0,
        0.6,
        this.defaultSettings.overlayOpacity
      ),
      blurStrength: this.clampNumber(
        formData.get("blurStrength"),
        0,
        20,
        this.defaultSettings.blurStrength
      ),
      glassTintColor: this.resolveHexColor(
        formData.get("glassTintColor"),
        this.defaultSettings.glassTintColor
      ),
      glassTintOpacity: this.clampNumber(
        formData.get("glassTintOpacity"),
        0.05,
        0.95,
        this.defaultSettings.glassTintOpacity
      ),
      hasCompletedSetup: true,
    };

    this.state.settings = nextSettings;
    this.applySettings(this.state.settings);
    this.saveSettingsToStorage(this.state.settings);
    const pageSize = this.normalizePageSize(formData.get("pageSize"));
    this.state.userData = {
      ...this.state.userData,
      pageSize,
    };
    this.saveUserDataToStorage(this.state.userData);
    this.updateVisibleApps();
    this.applyFilter(this.state.searchTerm ?? "");
    this.updatePageSizeIndicator(pageSize);
    this.closeSettingsModal({ markCompleted: true });
  }

  init = async () => {
    this.state.settings = this.loadSettingsFromStorage();
    this.state.userData = this.loadUserDataFromStorage();
    this.state.userData.pageSize = this.normalizePageSize(this.state.userData.pageSize);
    this.saveUserDataToStorage(this.state.userData);
    this.applySettings(this.state.settings);
    this.setupSettingsUI();
    this.setupAddAppModal();
    this.setupHiddenAppsModal();
    this.setupContextMenu();

    await this.loadApps();
    this.updateVisibleApps();
    this.renderCustomIconOptions();
    this.attachGlobalListeners();
    this.applyFilter("");
    this.state.activeIndex = -1;

    window.setTimeout(() => {
      this.hideLoadingScreen();
    }, 600);

    this.registerLayoutListeners();
    this.registerServiceWorker();
  }

  loadApps = async () => {
    this.showLoadingScreen();

    let remoteData = [];
    try {
      const response = await fetch(this.appSource, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      remoteData = Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Failed to load apps.json:", error);
      remoteData = [];
    }

    const remoteApps = remoteData
      .map((app) => this.sanitizeAppRecord(app, "preset"))
      .filter(Boolean);

    const storedCustomApps = (this.state.userData.customApps ?? [])
      .map((app) => this.sanitizeAppRecord(app, "custom"))
      .filter(Boolean);

    const combined = this.ensureUniqueAppIds([...remoteApps, ...storedCustomApps]);

    this.state.catalogApps = combined;
    this.state.userData.customApps = combined
      .filter((app) => app.origin === "custom")
      .map((entry) => this.stripAppForStorage(entry));
    this.state.userData.hiddenAppIds = this.dedupeHiddenIds(
      this.state.userData.hiddenAppIds,
      combined
    );
    this.state.userData.pageSize = this.normalizePageSize(this.state.userData.pageSize);
    this.saveUserDataToStorage(this.state.userData);
  }

  showLoadingScreen = () => {
    this.dom.loadingScreen.classList.remove("opacity-0", "pointer-events-none");
  }

  hideLoadingScreen = () => {
    this.dom.loadingScreen.classList.add("opacity-0", "pointer-events-none");
    window.setTimeout(() => {
      this.dom.loadingScreen.style.display = "none";
    }, 500);
  }

  attachGlobalListeners = () => {
    this.dom.searchInput.addEventListener("input", (event) => {
      this.applyFilter(event.target.value.trim());
    });

    this.dom.searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.openActiveApp();
      }
    });

    document.addEventListener(
      "keydown",
      (event) => {
        const key = event.key;
        if (this.isSettingsModalOpen()) {
          if (key === "Escape") {
            event.preventDefault();
            this.closeSettingsModal({ markCompleted: true });
          }
          return;
        }
        if (this.isAddAppModalOpen()) {
          if (key === "Escape") {
            event.preventDefault();
            this.closeAddAppModal();
          }
          return;
        }
        if (this.isHiddenAppsModalOpen()) {
          if (key === "Escape") {
            event.preventDefault();
            this.closeHiddenAppsModal();
          }
          return;
        }
        if (this.isContextMenuOpen() && key === "Escape") {
          event.preventDefault();
          this.hideAppContextMenu();
          return;
        }
        const isSearchFocused = document.activeElement === this.dom.searchInput;
        const normalizedKey = typeof key === "string" ? key.toLowerCase() : "";

        if (key === "Escape") {
          event.preventDefault();
          if (this.dom.searchInput.value !== "") {
            this.dom.searchInput.value = "";
            this.applyFilter("");
          }
          return;
        }

        if (event.metaKey && normalizedKey === "k") {
          event.preventDefault();
          this.dom.searchInput.focus({ preventScroll: true });
          this.dom.searchInput.select();
          return;
        }

        if (event.ctrlKey && normalizedKey === "k") {
          event.preventDefault();
          this.dom.searchInput.focus({ preventScroll: true });
          this.dom.searchInput.select();
          return;
        }

        if (key === "Tab") {
          event.preventDefault();
          this.advanceActiveIndex(event.shiftKey ? -1 : 1);
          return;
        }

        if (key === "Enter") {
          if (!isSearchFocused) {
            this.openActiveApp();
          }
          return;
        }

        if (key === "ArrowRight") {
          event.preventDefault();
          this.setPage(this.state.currentPage + 1);
          return;
        }

        if (key === "ArrowLeft") {
          event.preventDefault();
          this.setPage(this.state.currentPage - 1);
          return;
        }

        if (event.metaKey || event.ctrlKey || event.altKey) {
          return;
        }

        if (key === "Backspace" || key === "Delete") {
          if (!isSearchFocused) {
            event.preventDefault();
            this.removeCharacterFromSearch(key === "Backspace" ? "backspace" : "delete");
          }
          return;
        }

        if (key.length === 1 && !event.isComposing) {
          if (!isSearchFocused) {
            event.preventDefault();
            this.insertCharacterIntoSearch(key);
          }
          return;
        }
      },
      true
    );

    this.setupSwipePaging();
    this.setupWheelPaging();
  }

  setupSwipePaging = () => {
    let pointerId = null;
    let startX = 0;

    this.dom.gridViewport.style.touchAction = "pan-y";

    this.dom.gridViewport.addEventListener("pointerdown", (event) => {
      if (this.isMobileLayout()) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      this.dom.gridViewport.setPointerCapture(pointerId);
    });

    this.dom.gridViewport.addEventListener("pointerup", (event) => {
      if (pointerId !== event.pointerId) return;
      if (this.isMobileLayout()) {
        pointerId = null;
        return;
      }
      const delta = event.clientX - startX;
      if (Math.abs(delta) > SCROLL_PAGE_THRESHOLD) {
        if (delta < 0) {
          this.setPage(this.state.currentPage + 1);
        } else {
          this.setPage(this.state.currentPage - 1);
        }
      }
      pointerId = null;
    });

    this.dom.gridViewport.addEventListener("pointercancel", () => {
      pointerId = null;
    });
  }

  setupWheelPaging = () => {
    let accumulated = 0;
    const threshold = SCROLL_PAGE_THRESHOLD * 2;

    this.dom.gridViewport.addEventListener(
      "wheel",
      (event) => {
        const totalPages = this.getTotalPages();
        if (this.isMobileLayout() || totalPages <= 1) return;

        const dominantDelta =
          Math.abs(event.deltaX) >= Math.abs(event.deltaY)
            ? event.deltaX
            : event.deltaY;
        if (!dominantDelta) return;

        event.preventDefault();

        accumulated += dominantDelta;

        if (Math.abs(accumulated) < threshold) return;

        if (accumulated > 0) {
          this.setPage(this.state.currentPage + 1);
        } else {
          this.setPage(this.state.currentPage - 1);
        }

        accumulated = 0;
      },
      { passive: false }
    );
  }

  applyFilter = (term) => {
    this.state.searchTerm = term;
    const normalized = term.toLowerCase();

    if (!normalized) {
      this.state.filteredApps = [...this.state.apps];
    } else {
      this.state.filteredApps = this.state.apps.filter((app) => {
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

    if (!normalized && this.state.hiddenApps.length > 0) {
      this.state.filteredApps = [...this.state.filteredApps, this.buildHiddenAppsGroup()];
    }

    this.state.currentPage = 0;
    if (!normalized) {
      this.state.activeIndex = -1;
    } else if (this.state.filteredApps.length > 0) {
      this.state.activeIndex = 0;
    } else {
      this.state.activeIndex = -1;
    }
    this.render();
  }

  updateVisibleApps = () => {
    const dedupedHidden = this.dedupeHiddenIds(
      this.state.userData.hiddenAppIds,
      this.state.catalogApps
    );
    this.state.userData.hiddenAppIds = dedupedHidden;
    const hiddenSet = new Set(dedupedHidden);
    this.state.hiddenApps = this.state.catalogApps.filter((app) => hiddenSet.has(app.id));
    this.state.apps = this.state.catalogApps.filter((app) => !hiddenSet.has(app.id));
    this.renderHiddenAppsList();
  }

  render = () => {
    this.renderPages();
    this.renderPagination();
    this.updateEmptyState();
    this.updateActiveCard();
  }

  renderPages = () => {
    this.dom.pagesWrapper.innerHTML = "";

    const isMobile = this.isMobileLayout();
    const totalPages = this.getTotalPages();
    const safePageIndex = Math.min(this.state.currentPage, totalPages - 1);

    if (safePageIndex !== this.state.currentPage) {
      this.state.currentPage = safePageIndex;
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

      const desktopPageSize = this.getDesktopPageSize();
      const pageSize = isMobile ? this.state.filteredApps.length : desktopPageSize;
      const start = isMobile ? 0 : pageIndex * pageSize;
      const end = isMobile ? this.state.filteredApps.length : start + pageSize;
      const slice = this.state.filteredApps.slice(start, end);

      slice.forEach((app, sliceIndex) => {
        const absoluteIndex = isMobile ? sliceIndex : start + sliceIndex;
        const card = this.createAppCard(app, absoluteIndex);
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
      this.dom.pagesWrapper.appendChild(page);
    }

    if (isMobile) {
      this.dom.pagesWrapper.style.transform = "none";
      if (this.dom.gridViewport) {
        this.dom.gridViewport.scrollTop = 0;
      }
    } else {
      this.dom.pagesWrapper.style.transform = `translateX(-${
        this.state.currentPage * 100
      }%)`;
    }
  }

  createAppCard = (app, absoluteIndex) => {
    const clone = this.dom.cardTemplate.content.firstElementChild.cloneNode(true);
    const nameEl = clone.querySelector("[data-app-name]");
    const iconEl = clone.querySelector("[data-app-icon]");

    clone.dataset.appId = app.id;
    clone.dataset.index = String(absoluteIndex);
    clone.title = app.description ?? app.name;

    if (this.isHiddenGroup(app)) {
      const count = app.hiddenCount ?? this.state.hiddenApps.length;
      const label =
        count === 1 ? "Hidden app" : `Hidden apps (${count})`;
      nameEl.textContent = label;
      iconEl.src = this.resolveIconSource(app.icon ?? HIDDEN_GROUP_ICON);
      iconEl.alt = "Hidden apps";
      clone.classList.add("border-dashed", "border-white/10");
      clone.addEventListener("click", () => this.openHiddenAppsModal());
      clone.addEventListener("dblclick", () => this.openHiddenAppsModal());
    } else {
      nameEl.textContent = app.name;
      iconEl.src = this.resolveIconSource(app.icon);
      iconEl.alt = `${app.name} icon`;
      clone.addEventListener("click", () => this.openApp(app));
      clone.addEventListener("dblclick", () => this.openApp(app));
      this.attachContextMenuHandlers(clone, app, "visible");
    }

    iconEl.dataset.fallbackApplied = "false";
    iconEl.addEventListener("error", () => this.applyIconFallback(iconEl));

    clone.addEventListener("focus", () => {
      const idx = Number.parseInt(clone.dataset.index, 10);
      if (!Number.isNaN(idx)) {
        this.setActiveIndex(idx, { syncPage: true });
      }
    });

    return clone;
  }

  focusSearchInput = () => {
    this.dom.searchInput.focus({ preventScroll: true });
  }

  insertCharacterIntoSearch = (char) => {
    this.focusSearchInput();
    const input = this.dom.searchInput;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const nextValue =
      input.value.slice(0, start) + char + input.value.slice(end);

    input.value = nextValue;
    const cursor = start + char.length;
    input.setSelectionRange(cursor, cursor);
    this.applyFilter(input.value.trim());
  }

  removeCharacterFromSearch = (mode) => {
    this.focusSearchInput();
    const input = this.dom.searchInput;
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
    this.applyFilter(input.value.trim());
  }

  resolveIconSource = (source) => {
    return this.sanitizeIconSource(source);
  }

  applyIconFallback = (image) => {
    if (image.dataset.fallbackApplied === "true") return;
    image.dataset.fallbackApplied = "true";
    image.src = DEFAULT_ICON;
  }

  renderPagination = () => {
    this.dom.paginationControls.innerHTML = "";

    const totalPages = this.getTotalPages();

    if (this.isMobileLayout() || totalPages <= 1) {
      this.dom.paginationControls.classList.add("hidden");
      this.dom.paginationControls.classList.add("invisible");
      return;
    }

    this.dom.paginationControls.classList.remove("hidden");
    this.dom.paginationControls.classList.remove("invisible");

    for (let i = 0; i < totalPages; i += 1) {
      const indicator = document.createElement("button");
      indicator.type = "button";
      indicator.className = [
        "h-2 rounded-full transition-all duration-300",
        i === this.state.currentPage
          ? "pagination-indicator-active"
          : "pagination-indicator-inactive",
      ].join(" ");
      indicator.setAttribute("aria-label", `Go to page ${i + 1}`);
      indicator.addEventListener("click", () => {
        this.setPage(i);
      });
      this.dom.paginationControls.appendChild(indicator);
    }
  }

  updateEmptyState = () => {
    if (this.state.filteredApps.length === 0) {
      this.dom.emptyState.classList.remove("hidden");
    } else {
      this.dom.emptyState.classList.add("hidden");
    }
  }

  setPage = (pageIndex, options = {}) => {
    if (this.isMobileLayout()) {
      this.state.currentPage = 0;
      this.dom.pagesWrapper.style.transform = "none";
      return;
    }

    const totalPages = this.getTotalPages();
    const clamped = Math.min(Math.max(pageIndex, 0), totalPages - 1);
    if (clamped === this.state.currentPage) return;

    this.state.currentPage = clamped;
    this.dom.pagesWrapper.style.transform = `translateX(-${clamped * 100}%)`;
    this.renderPagination();

    if (!options.skipActiveSync && this.state.activeIndex !== -1) {
      const firstIndex = clamped * this.getDesktopPageSize();
      this.setActiveIndex(firstIndex, { syncPage: false });
    }
  }

  setActiveIndex = (index, options = {}) => {
    if (this.state.filteredApps.length === 0) {
      this.state.activeIndex = -1;
      this.updateActiveCard();
      return;
    }
    const maxIndex = this.state.filteredApps.length - 1;
    const clamped = Math.min(Math.max(index, 0), maxIndex);
    this.state.activeIndex = clamped;

    if (options.syncPage !== false) {
      if (this.state.activeIndex >= 0) {
        const pageSize = this.getEffectivePageSize();
        const targetPage = Math.floor(clamped / pageSize);
        this.state.currentPage = targetPage;
        if (this.isMobileLayout()) {
          this.dom.pagesWrapper.style.transform = "none";
        } else {
          this.dom.pagesWrapper.style.transform = `translateX(-${targetPage * 100}%)`;
        }
        this.renderPagination();
      }
    }

    this.updateActiveCard();
  }

  advanceActiveIndex = (delta) => {
    if (this.state.filteredApps.length === 0) return;
    if (this.state.activeIndex === -1) {
      this.setActiveIndex(delta > 0 ? 0 : this.state.filteredApps.length - 1);
      return;
    }
    const nextIndex =
      (this.state.activeIndex + delta + this.state.filteredApps.length) %
      this.state.filteredApps.length;
    this.setActiveIndex(nextIndex);
  }

  updateActiveCard = () => {
    const buttons = this.dom.pagesWrapper.querySelectorAll(".app-card");
    buttons.forEach((button) => {
      button.classList.remove("translate-y-1", "scale-105");
      button.setAttribute("tabindex", "-1");
    });

    if (this.state.filteredApps.length === 0 || this.state.activeIndex === -1) return;

    const activeId = this.state.filteredApps[this.state.activeIndex]?.id;
    if (!activeId) return;

    const activeButton = this.dom.pagesWrapper.querySelector(
      `.app-card[data-app-id="${CSS.escape(activeId)}"]`
    );
    if (!activeButton) return;

    activeButton.classList.add("translate-y-1","scale-105");
    activeButton.setAttribute("tabindex", "0");

    if (
      document.activeElement !== this.dom.searchInput &&
      !this.dom.pagesWrapper.contains(document.activeElement)
    ) {
      activeButton.focus({ preventScroll: true });
    }
  }

  openActiveApp = () => {
    if (!this.state.filteredApps.length) return;
    const app = this.state.filteredApps[this.state.activeIndex];
    if (!app) return;
    this.openApp(app);
  }

  openApp = (app) => {
    if (!app) return;

    if (this.isHiddenGroup(app)) {
      this.openHiddenAppsModal();
      return;
    }

    const index = this.state.filteredApps.findIndex((item) => item.id === app.id);
    if (index !== -1) {
      this.setActiveIndex(index, { syncPage: true });
    }

    if (app.url) {
      window.open(app.url, "_blank", "noopener,noreferrer");
    }
  }

  handleLayoutChange = () => {
    this.state.currentPage = 0;

    if (this.isMobileLayout()) {
      this.dom.pagesWrapper.style.transform = "none";
    }

    this.render();
    if (this.dom.gridViewport) {
      this.dom.gridViewport.scrollTop = 0;
    }
  }
  registerLayoutListeners = () => {
    if (typeof this.mobileLayoutQuery.addEventListener === "function") {
      this.mobileLayoutQuery.addEventListener("change", this.handleLayoutChange);
    } else if (typeof this.mobileLayoutQuery.addListener === "function") {
      this.mobileLayoutQuery.addListener(this.handleLayoutChange);
    }
  }

  registerServiceWorker = () => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./service-worker.js")
        .catch((error) => {
          console.warn("Service worker registration failed", error);
        });
    });
  }
}

const launchpadApp = new LaunchpadApp();
launchpadApp.init();
