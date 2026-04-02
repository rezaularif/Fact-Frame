import {
  appendDomCaptionSample,
  collectCaptionTextFromDom,
  domBufferToExcerpt,
  domBufferToFullTranscript,
  fullTranscriptText,
  getVideoIdFromLocation,
  getVideoTitleFromPage,
  loadCaptionSegmentsForVideo,
  textForWindow,
  type DomCaptionSample,
} from "../lib/captions";
import { applyTranslucencyVariables } from "../lib/apply-translucency";
import { EXTENSION_SETTINGS_STORAGE_KEYS, loadExtensionSettings } from "../lib/load-extension-settings";
import { getFabCss, getPanelCss } from "../lib/panel-css";
import { PANEL_FAB_ID, PANEL_ID, PANEL_STYLE_ID } from "../lib/panel-constants";
import {
  fillSettingsForm,
  getSettingsFormInnerHtml,
  wireSettingsForm,
} from "../lib/settings-form";
import type { CaptionsSegment, ExtensionSettings, FactCheckResponse, FactVerdict } from "../types";
import { DEFAULT_SETTINGS } from "../types";

const loadSettings = loadExtensionSettings;

/** Default / bounds for user-resizable panel (px). */
const PANEL_WIDTH_DEFAULT = 300;
const PANEL_HEIGHT_DEFAULT = 340;
const PANEL_WIDTH_MIN = 240;
const PANEL_WIDTH_MAX = 520;
const PANEL_HEIGHT_MIN = 160;
const PANEL_HEIGHT_MAX = 900;
/** Max claims kept in the rolling list for this video session (oldest dropped). */
const MAX_ACCUMULATED_VERDICTS = 80;
const STORAGE_PANEL_LEFT = "ytcPanelLeft";
const STORAGE_PANEL_TOP = "ytcPanelTop";
const STORAGE_PANEL_WIDTH = "ytcPanelWidth";
const STORAGE_PANEL_HEIGHT = "ytcPanelHeight";
const STORAGE_PANEL_MINIMIZED = "ytcPanelMinimized";
const STORAGE_FAB_TOP = "ytcFabTop";

const STORAGE_KEYS = EXTENSION_SETTINGS_STORAGE_KEYS;

/** Header control: gear when idle, back arrow when settings are open (same button toggles). */
const PANEL_HEADER_SETTINGS_ICON_GEAR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="16" height="16" aria-hidden="true"><g fill="currentColor"><path d="M14.5,8.25h-5.067L6.899,3.862c-.207-.359-.667-.481-1.024-.274-.359,.207-.481,.666-.274,1.024l2.534,4.388-2.534,4.389c-.207,.359-.084,.817,.274,1.024,.118,.068,.247,.101,.375,.101,.259,0,.511-.134,.65-.375l2.534-4.389h5.067c.414,0,.75-.336,.75-.75s-.336-.75-.75-.75Z"/><path d="M16.25,8.25h-1.049c-.072-.597-.225-1.169-.453-1.702l.906-.523c.359-.207,.481-.666,.274-1.024-.207-.359-.666-.481-1.024-.274l-.913,.527c-.354-.471-.773-.889-1.243-1.243l.527-.914c.207-.359,.084-.817-.274-1.024-.358-.208-.817-.085-1.024,.274l-.523,.906c-.533-.229-1.105-.381-1.702-.453V1.75c0-.414-.336-.75-.75-.75s-.75,.336-.75,.75v1.049c-.597,.072-1.169,.225-1.702,.453l-.523-.906c-.208-.359-.667-.482-1.024-.274-.359,.207-.481,.666-.274,1.024l.527,.914c-.471,.354-.889,.772-1.243,1.243l-.913-.527c-.357-.207-.817-.085-1.024,.274-.207,.359-.084,.817,.274,1.024l.906,.523c-.228,.533-.381,1.105-.453,1.702H1.75c-.414,0-.75,.336-.75,.75s.336,.75,.75,.75h1.049c.072,.597,.225,1.169,.453,1.702l-.906,.523c-.359,.207-.481,.666-.274,1.024,.139,.241,.391,.375,.65,.375,.127,0,.256-.032,.375-.101l.913-.527c.354,.471,.773,.889,1.243,1.243l-.527,.914c-.207,.359-.084,.817,.274,1.024,.118,.068,.247,.101,.375,.101,.259,0,.511-.134,.65-.375l.523-.906c.533,.229,1.105,.381,1.702,.453v1.049c0,.414,.336,.75,.75,.75s.75-.336,.75-.75v-1.049c.597-.072,1.169-.225,1.702-.453l.523,.906c.139,.241,.391,.375,.65,.375,.127,0,.256-.032,.375-.101,.359-.207,.481-.666,.274-1.024l-.527-.914c.471-.354,.889-.772,1.243-1.243l.913,.527c.118,.068,.247,.101,.375,.101,.259,0,.511-.134,.65-.375,.207-.359,.084-.817-.274-1.024l-.906-.523c.228-.533,.381-1.105,.453-1.702h1.049c.414,0,.75-.336,.75-.75s-.336-.75-.75-.75Zm-7.25,5.5c-2.619,0-4.75-2.131-4.75-4.75s2.131-4.75,4.75-4.75,4.75,2.131,4.75,4.75-2.131,4.75-4.75,4.75Z"/></g></svg>`;

const PANEL_HEADER_SETTINGS_ICON_BACK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>`;

/** Minimize icon: a horizontal line (dash). */
const PANEL_HEADER_MINIMIZE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M6 12.5h12v-1H6z"/></svg>`;

/** Small FactFrame logo for the FAB (simplified ring mark). */
const FAB_LOGO_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="20" height="20" aria-hidden="true"><circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" stroke-dasharray="2 5"/><circle cx="60" cy="60" r="38" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-dasharray="3 4"/><circle cx="60" cy="60" r="24" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.5"/><rect x="52" y="52" width="16" height="16" rx="2" fill="rgba(255,255,255,0.92)"/></svg>`;

function statusCaptionsReady(_settings: ExtensionSettings): string {
  return "Ready. Fact-checks run while the video plays.";
}

function statusDomCaptions(_settings: ExtensionSettings): string {
  return "Using on-screen captions — keep CC on.";
}

function statusLastFactCheck(_settings: ExtensionSettings): string {
  const time = new Date().toLocaleTimeString();
  return `Last check ${time}`;
}

type PanelStatusVariant = "idle" | "checking" | "error";

function setPanelStatus(
  root: HTMLElement,
  statusBodyEl: HTMLElement,
  opts: {
    message: string;
    variant?: PanelStatusVariant;
  },
): void {
  statusBodyEl.textContent = opts.message;
  const variant = opts.variant ?? "idle";
  root.classList.remove("ytc-panel--idle", "ytc-panel--checking", "ytc-panel--error");
  root.classList.add(`ytc-panel--${variant}`);
}

/** Rotating status lines while a fact-check request is in flight (UX feedback). */
const CHECKING_STATUS_MESSAGES = [
  "Scanning the latest caption…",
  "Spotting claims worth checking…",
  "Searching the web for sources…",
  "Gathering evidence from results…",
  "Cross-checking claims with sources…",
  "Running the fact-check model…",
  "Scoring support vs. contradiction…",
  "Almost done…",
] as const;

const CHECKING_STATUS_ROTATE_MS = 2000;

/**
 * Shows checking state and cycles placeholder pipeline text. Call the returned
 * function once before updating status to idle/error/success.
 */
function startCheckingStatusCycle(root: HTMLElement, statusBodyEl: HTMLElement): () => void {
  let idx = 0;
  statusBodyEl.textContent = CHECKING_STATUS_MESSAGES[idx];
  root.classList.remove("ytc-panel--idle", "ytc-panel--checking", "ytc-panel--error");
  root.classList.add("ytc-panel--checking");

  const timerId = window.setInterval(() => {
    idx = (idx + 1) % CHECKING_STATUS_MESSAGES.length;
    statusBodyEl.textContent = CHECKING_STATUS_MESSAGES[idx];
  }, CHECKING_STATUS_ROTATE_MS);

  return (): void => {
    window.clearInterval(timerId);
  };
}

/**
 * Translucent by default; solid opaque when hovered or focused (focus-within).
 * No backdrop-filter — low GPU cost.
 */
function injectPanelStyles(): void {
  if (document.getElementById(PANEL_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = PANEL_STYLE_ID;
  style.textContent = getPanelCss(PANEL_ID) + getFabCss(PANEL_FAB_ID);
  document.head.appendChild(style);
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: Partial<HTMLElementTagNameMap[K]> & { className?: string; textContent?: string },
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (props) {
    Object.assign(node, props);
  }
  return node;
}

function getVideoEl(): HTMLVideoElement | null {
  return document.querySelector("video.html5-main-video") ?? document.querySelector("video");
}

/** Main YouTube landing only (not /watch, /feed, /shorts, etc.). */
function isYoutubeHomepage(): boolean {
  const p = location.pathname;
  return p === "/" || p === "";
}

function syncPanelVisibilityForUrl(root: HTMLElement, fab: HTMLElement): void {
  const isHomepage = isYoutubeHomepage();
  root.style.display = isHomepage ? "none" : "flex";
  fab.classList.toggle("ytc-fab--hidden", isHomepage);
}

function ensurePanel(): HTMLElement {
  let root = document.getElementById(PANEL_ID);
  if (root) return root;

  injectPanelStyles();

  root = el("div", { id: PANEL_ID });
  root.style.cssText = [
    "position:fixed",
    "z-index:999999",
    "box-sizing:border-box",
    `width:${PANEL_WIDTH_DEFAULT}px`,
    `height:${PANEL_HEIGHT_DEFAULT}px`,
    `max-height:${PANEL_HEIGHT_DEFAULT}px`,
    "min-width:0",
    "min-height:0",
    "display:flex",
    "flex-direction:column",
    "overflow:hidden",
    "left:0",
    "top:0",
  ].join(";");

  document.documentElement.appendChild(root);
  return root;
}

function ensureFab(): HTMLElement {
  let fab = document.getElementById(PANEL_FAB_ID);
  if (fab) return fab;

  fab = el("div", { id: PANEL_FAB_ID });
  const iconWrap = el("div");
  iconWrap.className = "ytc-fab-icon";
  iconWrap.innerHTML = FAB_LOGO_ICON;
  fab.appendChild(iconWrap);
  fab.title = "Restore FactFrame";
  
  document.documentElement.appendChild(fab);
  return fab;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Keep width/height within min/max and viewport; keep panel fully on-screen. */
function clampPanelSizeAndPosition(root: HTMLElement): void {
  const pad = 4;
  const maxW = Math.min(PANEL_WIDTH_MAX, window.innerWidth - 16);
  const maxH = Math.min(PANEL_HEIGHT_MAX, window.innerHeight - 16);
  let w = root.offsetWidth;
  let h = root.offsetHeight;
  w = clamp(w, PANEL_WIDTH_MIN, maxW);
  h = clamp(h, PANEL_HEIGHT_MIN, maxH);
  root.style.width = `${Math.round(w)}px`;
  root.style.height = `${Math.round(h)}px`;
  root.style.maxHeight = `${Math.round(h)}px`;
  const rawLeft = parseFloat(root.style.left);
  const rawTop = parseFloat(root.style.top);
  if (Number.isNaN(rawLeft) || Number.isNaN(rawTop)) return;
  const rw = root.offsetWidth;
  const rh = root.offsetHeight;
  root.style.left = `${clamp(rawLeft, pad, Math.max(pad, window.innerWidth - rw - pad))}px`;
  root.style.top = `${clamp(rawTop, pad, Math.max(pad, window.innerHeight - rh - pad))}px`;
}

async function applySavedPanelSize(root: HTMLElement): Promise<void> {
  if (!chrome.runtime?.id) return;
  const raw = await chrome.storage.local.get([STORAGE_PANEL_WIDTH, STORAGE_PANEL_HEIGHT]);
  const maxW = Math.min(PANEL_WIDTH_MAX, window.innerWidth - 16);
  const maxH = Math.min(PANEL_HEIGHT_MAX, window.innerHeight - 16);
  let w = typeof raw[STORAGE_PANEL_WIDTH] === "number" ? raw[STORAGE_PANEL_WIDTH] : PANEL_WIDTH_DEFAULT;
  let h = typeof raw[STORAGE_PANEL_HEIGHT] === "number" ? raw[STORAGE_PANEL_HEIGHT] : PANEL_HEIGHT_DEFAULT;
  w = clamp(w, PANEL_WIDTH_MIN, maxW);
  h = clamp(h, PANEL_HEIGHT_MIN, maxH);
  root.style.width = `${Math.round(w)}px`;
  root.style.height = `${Math.round(h)}px`;
  root.style.maxHeight = `${Math.round(h)}px`;
}

async function applySavedPanelPosition(root: HTMLElement): Promise<void> {
  if (!chrome.runtime?.id) return;
  const raw = await chrome.storage.local.get([STORAGE_PANEL_LEFT, STORAGE_PANEL_TOP]);
  const w = root.offsetWidth || PANEL_WIDTH_DEFAULT;
  const h = () => root.offsetHeight || PANEL_HEIGHT_DEFAULT;
  const pad = 8;

  let left: number;
  let top: number;

  if (typeof raw[STORAGE_PANEL_LEFT] === "number" && typeof raw[STORAGE_PANEL_TOP] === "number") {
    left = raw[STORAGE_PANEL_LEFT] as number;
    top = raw[STORAGE_PANEL_TOP] as number;
  } else {
    left = window.innerWidth - w - pad;
    top = pad;
  }

  left = clamp(left, pad, Math.max(pad, window.innerWidth - w - pad));
  top = clamp(top, pad, Math.max(pad, window.innerHeight - h() - pad));

  root.style.left = `${left}px`;
  root.style.top = `${top}px`;
  root.style.right = "auto";
  root.style.bottom = "auto";
}

async function applySavedMinimizedState(root: HTMLElement, fab: HTMLElement): Promise<boolean> {
  if (!chrome.runtime?.id) return false;
  const raw = await chrome.storage.local.get([STORAGE_PANEL_MINIMIZED]);
  const minimized = !!raw[STORAGE_PANEL_MINIMIZED];
  root.classList.toggle("ytc-panel--minimized", minimized);
  fab.classList.toggle("ytc-fab--visible", minimized);
  return minimized;
}

async function applySavedFabPosition(fab: HTMLElement): Promise<void> {
  if (!chrome.runtime?.id) return;
  const raw = await chrome.storage.local.get([STORAGE_FAB_TOP]);
  const pad = 4;
  const h = fab.offsetHeight || 36;
  let top: number;
  if (typeof raw[STORAGE_FAB_TOP] === "number") {
    top = raw[STORAGE_FAB_TOP] as number;
  } else {
    top = window.innerHeight / 2 - h / 2;
  }
  top = clamp(top, pad, Math.max(pad, window.innerHeight - h - pad));
  fab.style.top = `${top}px`;
}

function attachPanelDrag(root: HTMLElement, handles: HTMLElement[]): void {
  let dragStartX = 0;
  let dragStartY = 0;
  let originLeft = 0;
  let originTop = 0;
  let dragging = false;

  const setHandleCursor = (cursor: "grab" | "grabbing"): void => {
    for (const h of handles) {
      h.style.cursor = cursor;
    }
  };

  const onMove = (e: MouseEvent): void => {
    if (!dragging) return;
    let left = originLeft + (e.clientX - dragStartX);
    let top = originTop + (e.clientY - dragStartY);
    const w = root.offsetWidth;
    const h = root.offsetHeight;
    const pad = 4;
    left = clamp(left, pad, Math.max(pad, window.innerWidth - w - pad));
    top = clamp(top, pad, Math.max(pad, window.innerHeight - h - pad));
    root.style.left = `${left}px`;
    root.style.top = `${top}px`;
    root.style.right = "auto";
    root.style.bottom = "auto";
  };

  const onUp = (): void => {
    if (!dragging) return;
    dragging = false;
    setHandleCursor("grab");
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
    const left = parseFloat(root.style.left) || 0;
    const top = parseFloat(root.style.top) || 0;
    if (chrome.runtime?.id) {
      void chrome.storage.local.set({
        [STORAGE_PANEL_LEFT]: Math.round(left),
        [STORAGE_PANEL_TOP]: Math.round(top),
      });
    }
  };

  const onDown = (e: MouseEvent): void => {
    if (e.button !== 0) return;
    const t = e.target as HTMLElement;
    if (t.closest(".ytc-resize-handle")) return;
    if (
      t.closest("button") ||
      t.closest("input") ||
      t.closest("select") ||
      t.closest("a") ||
      t.closest("[data-no-drag]")
    ) {
      return;
    }
    dragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    const r = root.getBoundingClientRect();
    originLeft = r.left;
    originTop = r.top;
    setHandleCursor("grabbing");
    e.preventDefault();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  for (const handle of handles) {
    handle.addEventListener("mousedown", onDown);
  }

  const reflowClamp = (): void => {
    clampPanelSizeAndPosition(root);
  };
  window.addEventListener("resize", reflowClamp);
}

function attachPanelResize(root: HTMLElement, handle: HTMLElement): void {
  let startX = 0;
  let startY = 0;
  let startW = 0;
  let startH = 0;
  let active = false;

  const onMove = (e: MouseEvent): void => {
    if (!active) return;
    const maxW = Math.min(PANEL_WIDTH_MAX, window.innerWidth - 16);
    const maxH = Math.min(PANEL_HEIGHT_MAX, window.innerHeight - 16);
    let nw = Math.round(startW + (e.clientX - startX));
    let nh = Math.round(startH + (e.clientY - startY));
    nw = clamp(nw, PANEL_WIDTH_MIN, maxW);
    nh = clamp(nh, PANEL_HEIGHT_MIN, maxH);
    root.style.width = `${nw}px`;
    root.style.height = `${nh}px`;
    root.style.maxHeight = `${nh}px`;
    const pad = 4;
    const rawLeft = parseFloat(root.style.left) || 0;
    const rawTop = parseFloat(root.style.top) || 0;
    root.style.left = `${clamp(rawLeft, pad, Math.max(pad, window.innerWidth - nw - pad))}px`;
    root.style.top = `${clamp(rawTop, pad, Math.max(pad, window.innerHeight - nh - pad))}px`;
  };

  const onUp = (): void => {
    if (!active) return;
    active = false;
    document.body.style.removeProperty("cursor");
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
    if (chrome.runtime?.id) {
      void chrome.storage.local.set({
        [STORAGE_PANEL_WIDTH]: Math.round(root.offsetWidth),
        [STORAGE_PANEL_HEIGHT]: Math.round(root.offsetHeight),
      });
    }
  };

  handle.addEventListener("mousedown", (e: MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    active = true;
    startX = e.clientX;
    startY = e.clientY;
    const r = root.getBoundingClientRect();
    startW = r.width;
    startH = r.height;
    document.body.style.cursor = "nwse-resize";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  });
}

function attachFabDragAndClick(fab: HTMLElement, onRestore: () => void): void {
  let dragStartY = 0;
  let originTop = 0;
  let dragging = false;
  let moved = false;
  
  const onMove = (e: MouseEvent): void => {
    if (!dragging) return;
    moved = true;
    fab.classList.add("ytc-fab--dragging");
    const h = fab.offsetHeight;
    const pad = 4;
    let top = originTop + (e.clientY - dragStartY);
    top = clamp(top, pad, Math.max(pad, window.innerHeight - h - pad));
    fab.style.top = `${top}px`;
  };
  
  const onUp = (e: MouseEvent): void => {
    if (!dragging) return;
    dragging = false;
    fab.classList.remove("ytc-fab--dragging");
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
    
    if (moved) {
      const top = parseFloat(fab.style.top) || 0;
      if (chrome.runtime?.id) void chrome.storage.local.set({ [STORAGE_FAB_TOP]: Math.round(top) });
    } else {
      onRestore();
    }
  };
  
  fab.addEventListener("mousedown", (e: MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    e.preventDefault();
    dragging = true;
    moved = false;
    dragStartY = e.clientY;
    originTop = fab.getBoundingClientRect().top;
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  });
  
  const reflowClamp = (): void => {
    const pad = 4;
    const h = fab.offsetHeight || 36;
    const rawTop = parseFloat(fab.style.top) || 0;
    const top = clamp(rawTop, pad, Math.max(pad, window.innerHeight - h - pad));
    fab.style.top = `${top}px`;
  };
  window.addEventListener("resize", reflowClamp);
}

function buildPanelUi(root: HTMLElement): {
  headerEl: HTMLElement;
  statusEl: HTMLElement;
  statusBodyEl: HTMLElement;
  verdictsEl: HTMLElement;
  settingsEl: HTMLElement;
  resizeHandle: HTMLElement;
  minimizeBtn: HTMLButtonElement;
  toggleSettings: () => void;
} {
  root.innerHTML = "";
  root.classList.add("ytc-panel--idle");

  const header = el("div");
  header.className = "ytc-header";
  header.title = "Drag to move";
  const mainRow = el("div");
  mainRow.className = "ytc-header-main";
  const title = el("div", { textContent: "FactFrame" });
  title.className = "ytc-title";

  const minimizeBtn = el("button") as HTMLButtonElement;
  minimizeBtn.type = "button";
  minimizeBtn.className = "ytc-btn-minimize";
  minimizeBtn.setAttribute("aria-label", "Minimize panel");
  minimizeBtn.title = "Minimize";
  minimizeBtn.innerHTML = PANEL_HEADER_MINIMIZE_ICON;

  const settingsBtn = el("button") as HTMLButtonElement;
  settingsBtn.type = "button";
  settingsBtn.className = "ytc-btn-ghost ytc-btn-icon";
  settingsBtn.setAttribute("data-settings-toggle", "");
  settingsBtn.setAttribute("aria-label", "Open settings");
  settingsBtn.title = "Open settings";
  settingsBtn.innerHTML = PANEL_HEADER_SETTINGS_ICON_GEAR;

  const settingsModeHint = el("p");
  settingsModeHint.className = "ytc-settings-mode-hint";
  settingsModeHint.setAttribute("data-no-drag", "");
  settingsModeHint.innerHTML =
    "Set API keys, model, and timing below. Use <strong>Back</strong> (top right) to return to fact-checks.";

  mainRow.append(title, minimizeBtn, settingsBtn);

  const hero = el("div");
  hero.className = "ytc-hero";
  hero.setAttribute("aria-hidden", "true");
  const ringWrap = el("div");
  ringWrap.className = "ytc-ring-wrap";
  ringWrap.innerHTML = `<svg class="ytc-ring-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g class="ytc-ring-outer-rot"><circle class="ytc-ring-outer" cx="60" cy="60" r="52" /></g>
    <circle class="ytc-ring-mid" cx="60" cy="60" r="38" />
    <circle class="ytc-ring-inner" cx="60" cy="60" r="24" />
    <rect class="ytc-ring-center" x="54" y="54" width="12" height="12" />
  </svg>`;
  hero.appendChild(ringWrap);
  header.append(mainRow, settingsModeHint, hero);

  const settingsEl = el("div");
  settingsEl.className = "ytc-settings";
  settingsEl.innerHTML = getSettingsFormInnerHtml();

  const statusEl = el("div");
  statusEl.className = "ytc-status";
  statusEl.title = "Drag to move";
  const statusBodyEl = el("div", { textContent: "Open a video with captions." });
  statusBodyEl.className = "ytc-status-body";
  statusEl.appendChild(statusBodyEl);

  const verdictsEl = el("div");
  verdictsEl.className = "ytc-verdicts";

  const resizeHandle = el("div");
  resizeHandle.className = "ytc-resize-handle";
  resizeHandle.title = "Resize panel";
  resizeHandle.setAttribute("aria-label", "Resize panel");

  root.append(header, settingsEl, statusEl, verdictsEl, resizeHandle);

  let settingsOpen = false;
  const applySettingsChrome = (open: boolean): void => {
    settingsBtn.innerHTML = open ? PANEL_HEADER_SETTINGS_ICON_BACK : PANEL_HEADER_SETTINGS_ICON_GEAR;
    settingsBtn.classList.toggle("ytc-btn-icon--back", open);
    settingsBtn.setAttribute("aria-label", open ? "Back to fact-check view" : "Open settings");
    settingsBtn.title = open ? "Back to fact-check view" : "Open settings";
    title.textContent = open ? "Settings" : "FactFrame";
  };
  const toggleSettings = () => {
    settingsOpen = !settingsOpen;
    settingsEl.style.display = settingsOpen ? "flex" : "none";
    root.classList.toggle("ytc-panel--settings-open", settingsOpen);
    settingsBtn.setAttribute("aria-expanded", settingsOpen ? "true" : "false");
    applySettingsChrome(settingsOpen);
  };
  settingsBtn.setAttribute("aria-expanded", "false");
  applySettingsChrome(false);
  settingsBtn.addEventListener("click", toggleSettings);

  return {
    headerEl: header,
    statusEl,
    statusBodyEl,
    verdictsEl,
    settingsEl,
    resizeHandle,
    minimizeBtn,
    toggleSettings,
  };
}


function verdictStatusLabel(status: FactVerdict["status"]): string {
  if (status === "supported") return "Supported";
  if (status === "contradicted") return "Not true";
  return "Need Research";
}

function countVerdictStatuses(verdicts: FactVerdict[]): {
  supported: number;
  unclear: number;
  contradicted: number;
} {
  let supported = 0;
  let unclear = 0;
  let contradicted = 0;
  for (const v of verdicts) {
    if (v.status === "supported") supported++;
    else if (v.status === "contradicted") contradicted++;
    else unclear++;
  }
  return { supported, unclear, contradicted };
}

function buildFactCheckSummaryHead(
  total: number,
  supported: number,
  unclear: number,
  contradicted: number,
): HTMLElement {
  const head = el("div");
  head.className = "ytc-fc-head";
  head.setAttribute("role", "group");
  head.setAttribute(
    "aria-label",
    `${total} ${total === 1 ? "claim" : "claims"}: ${supported} supported, ${unclear} need research, ${contradicted} not true`,
  );

  const totalEl = el("span");
  totalEl.className = "ytc-fc-head-total";
  totalEl.textContent = `${total} ${total === 1 ? "claim" : "claims"}`;

  const chips = el("div");
  chips.className = "ytc-fc-head-chips";

  const addChip = (kind: "supported" | "unclear" | "contradicted", label: string, n: number): void => {
    const chip = el("span");
    chip.className = `ytc-fc-chip ytc-fc-chip--${kind}`;
    const dot = el("span");
    dot.className = "ytc-fc-chip-dot";
    dot.setAttribute("aria-hidden", "true");
    const lab = el("span");
    lab.textContent = label;
    const num = el("strong");
    num.className = "ytc-fc-chip-num";
    num.textContent = String(n);
    chip.append(dot, lab, num);
    chips.appendChild(chip);
  };

  addChip("supported", "Supported", supported);
  addChip("unclear", "Need Research", unclear);
  addChip("contradicted", "Not true", contradicted);

  head.append(totalEl, chips);
  return head;
}

/** Compact rolling list for the current video; cleared when the video session resets. */
function renderAccumulatedVerdicts(
  container: HTMLElement,
  items: FactVerdict[],
  opts?: { scrollToBottom?: boolean },
): void {
  container.innerHTML = "";
  if (!items.length) {
    const empty = el("div", { textContent: "No claims yet." });
    empty.className = "ytc-empty";
    container.appendChild(empty);
    return;
  }

  const { supported, unclear, contradicted } = countVerdictStatuses(items);
  const head = buildFactCheckSummaryHead(items.length, supported, unclear, contradicted);

  const list = el("div");
  list.className = "ytc-fc-list";

  for (const v of items) {
    const row = el("div");
    row.className = "ytc-fc-row";
    const btn = el("button", { type: "button" }) as HTMLButtonElement;
    btn.className = "ytc-fc-toggle";
    btn.setAttribute("aria-expanded", "false");
    const dot = el("span");
    dot.className = `ytc-fc-dot ytc-fc-dot--${v.status}`;
    const one = el("span");
    one.className = "ytc-fc-one";
    one.textContent = v.claim.trim().replace(/\s+/g, " ");
    btn.append(dot, one);

    const detail = el("div");
    detail.className = "ytc-fc-detail";
    detail.hidden = true;

    const badge = el("span", { textContent: verdictStatusLabel(v.status) });
    badge.className = "ytc-badge";
    if (v.status === "supported") badge.classList.add("ytc-badge--supported");
    else if (v.status === "contradicted") badge.classList.add("ytc-badge--contradicted");
    else badge.classList.add("ytc-badge--unclear");

    const claimFull = el("div", { textContent: v.claim });
    claimFull.className = "ytc-claim";
    const expl = el("div", { textContent: v.explanation });
    expl.className = "ytc-expl";
    detail.append(badge, claimFull, expl);

    const slice = v.sources.slice(0, 6);
    if (slice.length) {
      const sources = el("div");
      sources.className = "ytc-sources";
      const srcLabel = el("div", { textContent: "Sources" });
      srcLabel.className = "ytc-sources-label";
      sources.appendChild(srcLabel);
      for (const u of slice) {
        const a = el("a", { textContent: u }) as HTMLAnchorElement;
        a.className = "ytc-src-link";
        a.href = u;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        sources.appendChild(a);
      }
      detail.appendChild(sources);
    }

    btn.addEventListener("click", () => {
      const open = detail.hidden;
      detail.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
    });

    row.append(btn, detail);
    list.appendChild(row);
  }

  container.append(head, list);

  if (opts?.scrollToBottom) {
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }
}

export default defineContentScript({
  matches: ["*://www.youtube.com/*", "*://m.youtube.com/*"],
  runAt: "document_idle",
  main() {
    const root = ensurePanel();
    const fab = ensureFab();
    const { headerEl, statusEl, statusBodyEl, verdictsEl, settingsEl, resizeHandle, minimizeBtn } = buildPanelUi(root);
    syncPanelVisibilityForUrl(root, fab);

    let isMinimized = false;
    const setMinimized = (min: boolean): void => {
      isMinimized = min;
      root.classList.toggle("ytc-panel--minimized", min);
      fab.classList.toggle("ytc-fab--visible", min);
      if (chrome.runtime?.id) void chrome.storage.local.set({ [STORAGE_PANEL_MINIMIZED]: min });
    };

    minimizeBtn.addEventListener("click", () => {
      setMinimized(true);
    });

    attachFabDragAndClick(fab, () => {
      setMinimized(false);
    });

    let cachedSettings: ExtensionSettings = DEFAULT_SETTINGS;

    void (async () => {
      await applySavedPanelSize(root);
      await applySavedPanelPosition(root);
      isMinimized = await applySavedMinimizedState(root, fab);
      await applySavedFabPosition(fab);
      attachPanelDrag(root, [headerEl, statusEl]);
      attachPanelResize(root, resizeHandle);
    })();

    void (async () => {
      const s = await loadSettings();
      cachedSettings = s;
      applyTranslucencyVariables(root, s.translucencyPercent);
      fillSettingsForm(settingsEl, s);
      setPanelStatus(root, statusBodyEl, {
        message: statusBodyEl.textContent ?? "",
        variant: "idle",
      });
      wireSettingsForm(settingsEl, {
        loadSettings,
        onTranslucencyInput: (percent) => {
          applyTranslucencyVariables(root, percent);
        },
        onSaved: async (next) => {
          cachedSettings = next;
          applyTranslucencyVariables(root, next.translucencyPercent);
        },
        onKeyCleared: (k) => {
          cachedSettings = { ...cachedSettings, [k]: "" } as ExtensionSettings;
        },
      });
    })();

    let segments: CaptionsSegment[] = [];
    let domCaptionMode = false;
    let domBuffer: DomCaptionSample[] = [];
    let domSampleTimer: ReturnType<typeof setInterval> | null = null;
    let videoId: string | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let inFlight = false;
    /** Rolling list for the current video; cleared on new video or leaving watch. */
    let accumulatedVerdicts: FactVerdict[] = [];
    /** Track last excerpt sent to avoid re-checking overlapping caption windows. */
    let lastExcerptSent = "";
    /** Cooldown counter — skip N ticks after an error to avoid hammering APIs. */
    let errorCooldownTicks = 0;

    function stopDomSampling(): void {
      if (domSampleTimer) {
        clearInterval(domSampleTimer);
        domSampleTimer = null;
      }
    }

    function startDomSampling(): void {
      stopDomSampling();
      domSampleTimer = setInterval(() => {
        if (!domCaptionMode) return;
        const v = getVideoEl();
        if (!v || v.paused) return;
        const txt = collectCaptionTextFromDom();
        appendDomCaptionSample(domBuffer, v.currentTime, txt);
      }, 600);
    }

    async function loadCaptionsForVideo(id: string): Promise<void> {
      accumulatedVerdicts = [];
      segments = [];
      domCaptionMode = false;
      domBuffer = [];
      stopDomSampling();
      cachedSettings = await loadSettings();
      setPanelStatus(root, statusBodyEl, {
        message: "Loading captions…",
        variant: "idle",
      });
      renderAccumulatedVerdicts(verdictsEl, []);
      try {
        segments = await loadCaptionSegmentsForVideo(id);
      } catch (e) {
        const settings = await loadSettings();
        cachedSettings = settings;
        setPanelStatus(root, statusBodyEl, {
          message:
            e instanceof Error && e.message.length > 0 && e.message.length < 160 ?
              `Couldn’t load captions: ${e.message}`
            : "Couldn’t load captions. Try another video or refresh.",
          variant: "error",
        });
        return;
      }
      const settings = await loadSettings();
      cachedSettings = settings;
      if (!segments.length) {
        domCaptionMode = true;
        startDomSampling();
        setPanelStatus(root, statusBodyEl, {
          message: statusDomCaptions(settings),
          variant: "idle",
        });
        return;
      }
      setPanelStatus(root, statusBodyEl, {
        message: statusCaptionsReady(settings),
        variant: "idle",
      });
    }

    function schedule(): void {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      void loadSettings().then((s) => {
        cachedSettings = s;
        const ms = Math.max(15, s.checkIntervalSec) * 1000;
        timer = setInterval(() => void tick(), ms);
        // Fire first tick immediately so users don't wait a full interval.
        void tick();
      });
    }

    async function tick(): Promise<void> {
      if (!chrome.runtime?.id) {
        if (timer) clearInterval(timer);
        timer = null;
        return;
      }
      
      // Use cached settings instead of reading storage every tick.
      // The storage.onChanged listener keeps cachedSettings fresh.
      const s = cachedSettings;
      const id = getVideoIdFromLocation(location.href);
      if (!id || id !== videoId) return;

      const v = getVideoEl();
      if (!v || v.paused || v.ended) return;

      // Skip ticks during error cooldown to avoid hammering APIs.
      if (errorCooldownTicks > 0) {
        errorCooldownTicks--;
        return;
      }

      let excerpt = "";
      let fullTranscript: string | undefined;

      if (domCaptionMode) {
        const txt = collectCaptionTextFromDom();
        appendDomCaptionSample(domBuffer, v.currentTime, txt);
        // Trim old samples to prevent unbounded memory growth.
        const minKeepSec = Math.max(0, v.currentTime - s.windowSec * 2);
        while (domBuffer.length > 0 && domBuffer[0].timeSec < minKeepSec) {
          domBuffer.shift();
        }
        excerpt = domBufferToExcerpt(domBuffer, s.windowSec, v.currentTime);
        fullTranscript = s.includeFullTranscriptInPrompt ? domBufferToFullTranscript(domBuffer, 16000) : undefined;
      } else {
        if (!segments.length) return;
        excerpt = textForWindow(segments, v.currentTime, s.windowSec);
        fullTranscript = s.includeFullTranscriptInPrompt ? fullTranscriptText(segments, 16000) : undefined;
      }

      if (!excerpt.trim()) return;

      // Skip if the excerpt hasn't changed enough since the last check
      // to avoid wasting LLM tokens on overlapping caption windows.
      if (lastExcerptSent && excerpt === lastExcerptSent) return;

      if (inFlight) return;
      inFlight = true;
      const stopCheckingCycle = startCheckingStatusCycle(root, statusBodyEl);

      try {
        const videoTitle = getVideoTitleFromPage();
        const res = (await chrome.runtime.sendMessage({
          type: "FACT_CHECK",
          captionExcerpt: excerpt,
          fullTranscript,
          ...(videoTitle ? { videoTitle } : {}),
        })) as FactCheckResponse;

        stopCheckingCycle();

        if (!res?.ok) {
          setPanelStatus(root, statusBodyEl, {
            message:
              res?.error ?? "Fact-check failed. Check Settings (API keys).",
            variant: "error",
          });
          inFlight = false;
          return;
        }
        const batch = res.verdicts ?? [];
        const existingKeys = new Set(
          accumulatedVerdicts.map((v) => v.claim.trim().toLowerCase().replace(/\s+/g, " ")),
        );
        const uniqueBatch = batch.filter((v) => {
          const key = v.claim.trim().toLowerCase().replace(/\s+/g, " ");
          if (existingKeys.has(key)) return false;
          existingKeys.add(key);
          return true;
        });
        if (uniqueBatch.length) {
          accumulatedVerdicts.push(...uniqueBatch);
          if (accumulatedVerdicts.length > MAX_ACCUMULATED_VERDICTS) {
            accumulatedVerdicts = accumulatedVerdicts.slice(-MAX_ACCUMULATED_VERDICTS);
          }
        }
        renderAccumulatedVerdicts(verdictsEl, accumulatedVerdicts, { scrollToBottom: uniqueBatch.length > 0 });
        setPanelStatus(root, statusBodyEl, {
          message: statusLastFactCheck(s),
          variant: "idle",
        });
        lastExcerptSent = excerpt;
      } catch (e) {
        stopCheckingCycle();
        // Back off for 2 ticks on error to avoid hammering failing APIs.
        errorCooldownTicks = 2;
        setPanelStatus(root, statusBodyEl, {
          message: e instanceof Error ? e.message : "Something went wrong. Try again.",
          variant: "error",
        });
      } finally {
        inFlight = false;
      }
    }

    async function onNav(): Promise<void> {
      if (!chrome.runtime?.id) return;
      syncPanelVisibilityForUrl(root, fab);
      const id = getVideoIdFromLocation(location.href);
      if (!id) {
        videoId = null;
        accumulatedVerdicts = [];
        segments = [];
        domCaptionMode = false;
        domBuffer = [];
        stopDomSampling();
        cachedSettings = await loadSettings();
        setPanelStatus(root, statusBodyEl, {
          message: "Open a video with captions.",
          variant: "idle",
        });
        renderAccumulatedVerdicts(verdictsEl, []);
        return;
      }
      if (id === videoId) return;
      videoId = id;
      await loadCaptionsForVideo(id);
      schedule();
    }

    // Do NOT use MutationObserver on document — YouTube mutates the DOM constantly and
    // firing navigation logic on every subtree change can freeze or crash the browser.
    // Events (yt-navigate-finish, popstate) catch most navigations;
    // this poll is a safety net — 2s is plenty.
    window.setInterval(() => {
      if (!chrome.runtime?.id) return;
      void onNav();
    }, 2000);
    window.addEventListener("yt-navigate-finish", () => void onNav());
    window.addEventListener("popstate", () => void onNav());
    void onNav();

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "local") return;
      if (!Object.keys(changes).some((k) => STORAGE_KEYS.includes(k as keyof ExtensionSettings))) return;
      schedule();
      void loadSettings().then((s) => {
        cachedSettings = s;
        applyTranslucencyVariables(root, s.translucencyPercent);
        fillSettingsForm(settingsEl, s);
      });
    });
  },
});
