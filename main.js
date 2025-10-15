const APPS_SOURCE = "./apps.sample.json";
const PAGE_SIZE = 28;
const SCROLL_PAGE_THRESHOLD = 60;
const DEFAULT_ICON = "./default-icon.svg";
const SETTINGS_STORAGE_KEY = "launchpad.settings.v1";

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

const state = {
  apps: [],
  filteredApps: [],
  searchTerm: "",
  currentPage: 0,
  activeIndex: 0,
  settings: { ...defaultSettings },
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
  overlayValue: document.getElementById("overlay-opacity-value"),
  blurValue: document.getElementById("blur-strength-value"),
  glassValue: document.getElementById("glass-opacity-value"),
};

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

  if (form.elements.backgroundImage) {
    form.elements.backgroundImage.value = merged.backgroundImage ?? "";
  }
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

  const nextSettings = {
    backgroundType,
    backgroundImage: sanitizeBackgroundImage(formData.get("backgroundImage")),
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
  closeSettingsModal({ markCompleted: true });
}

async function init() {
  state.settings = loadSettingsFromStorage();
  applySettings(state.settings);
  setupSettingsUI();

  await loadApps();
  attachGlobalListeners();
  applyFilter("");
  state.activeIndex = -1;

  window.setTimeout(() => {
    hideLoadingScreen();
    if (!state.settings.hasCompletedSetup) {
      showSettingsModal({ autofocus: true });
    }
  }, 600);
}

async function loadApps() {
  showLoadingScreen();

  try {
    const response = await fetch(APPS_SOURCE, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    state.apps = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to load apps.json:", error);
    state.apps = [];
  }
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
    pointerId = event.pointerId;
    startX = event.clientX;
    dom.gridViewport.setPointerCapture(pointerId);
  });

  dom.gridViewport.addEventListener("pointerup", (event) => {
    if (pointerId !== event.pointerId) return;
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
      const totalPages = Math.max(
        1,
        Math.ceil(state.filteredApps.length / PAGE_SIZE)
      );
      if (totalPages <= 1) return;

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

function render() {
  renderPages();
  renderPagination();
  updateEmptyState();
  updateActiveCard();
}

function renderPages() {
  dom.pagesWrapper.innerHTML = "";

  const totalPages = Math.max(
    1,
    Math.ceil(state.filteredApps.length / PAGE_SIZE)
  );

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
    const page = document.createElement("div");
    page.className =
      "flex h-full w-full shrink-0 items-stretch justify-center";

    const grid = document.createElement("div");
    grid.className =
      "grid h-full w-full grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-7";

    const start = pageIndex * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const slice = state.filteredApps.slice(start, end);

    slice.forEach((app, sliceIndex) => {
      const card = createAppCard(app, start + sliceIndex);
      grid.appendChild(card);
    });

    const placeholders = PAGE_SIZE - slice.length;
    for (let i = 0; i < placeholders; i += 1) {
      const filler = document.createElement("div");
      filler.className = "hidden md:block";
      grid.appendChild(filler);
    }

    page.appendChild(grid);
    dom.pagesWrapper.appendChild(page);
  }

  dom.pagesWrapper.style.transform = `translateX(-${
    state.currentPage * 100
  }%)`;
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
  if (typeof source !== "string") return DEFAULT_ICON;
  const trimmed = source.trim();
  return trimmed.length ? trimmed : DEFAULT_ICON;
}

function applyIconFallback(image) {
  if (image.dataset.fallbackApplied === "true") return;
  image.dataset.fallbackApplied = "true";
  image.src = DEFAULT_ICON;
}

function renderPagination() {
  dom.paginationControls.innerHTML = "";

  const totalPages = Math.max(
    1,
    Math.ceil(state.filteredApps.length / PAGE_SIZE)
  );

  if (totalPages <= 1) {
    dom.paginationControls.classList.add("invisible");
    return;
  }

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
  const totalPages = Math.max(
    1,
    Math.ceil(state.filteredApps.length / PAGE_SIZE)
  );
  const clamped = Math.min(Math.max(pageIndex, 0), totalPages - 1);
  if (clamped === state.currentPage) return;

  state.currentPage = clamped;
  dom.pagesWrapper.style.transform = `translateX(-${clamped * 100}%)`;
  renderPagination();

  if (!options.skipActiveSync && state.activeIndex !== -1) {
    const firstIndex = clamped * PAGE_SIZE;
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
      const targetPage = Math.floor(clamped / PAGE_SIZE);
      state.currentPage = targetPage;
      dom.pagesWrapper.style.transform = `translateX(-${targetPage * 100}%)`;
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

init();
