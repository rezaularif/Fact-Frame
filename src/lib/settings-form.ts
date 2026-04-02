import { SAVE_CHANGES_LABEL, SAVE_PENDING_LABEL, SAVE_SAVING_LABEL, SAVE_FEEDBACK_MS, YTC_KEY_CLEAR_ICON } from "./panel-constants";
import type { ExtensionSettings, SearchProvider } from "../types";
import { DEFAULT_SETTINGS } from "../types";

// Per-instance state attached to form elements
interface FormState {
  lastSavedSettings: ExtensionSettings | null;
  saveFeedbackClearTimer: number | null;
}

function getFormState(settingsEl: HTMLElement): FormState {
  return (settingsEl as HTMLElement & { _ffFormState?: FormState })._ffFormState ?? { lastSavedSettings: null, saveFeedbackClearTimer: null };
}

function setFormState(settingsEl: HTMLElement, state: FormState): void {
  (settingsEl as HTMLElement & { _ffFormState?: FormState })._ffFormState = state;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Inner markup for `.ytc-settings` (scroll region + actions). Shared by the YouTube panel and full-page settings. */
export function getSettingsFormInnerHtml(): string {
  return `
    <div class="ytc-settings-scroll">
      <div class="ytc-settings-section">
        <p class="ytc-settings-section-title">Appearance</p>
        <label class="ytc-field">Translucency (idle)
          <div class="ytc-range-row">
            <input class="ytc-range" data-k="translucencyPercent" type="range" min="0" max="100" step="5" />
            <span class="ytc-range-value" data-translucency-hint>50%</span>
          </div>
          <span class="ytc-field-hint">Higher = more see-through. Hover keeps a solid look.</span>
        </label>
      </div>
      <div class="ytc-settings-section">
        <p class="ytc-settings-section-title">API keys &amp; search</p>
        <label class="ytc-field">Search provider
          <select data-k="searchProvider">
            <option value="tavily">Tavily</option>
            <option value="exa">Exa</option>
            <option value="perplexity">Perplexity Search</option>
            <option value="brave">Brave Search</option>
          </select>
        </label>
        <span class="ytc-field-hint">Only the active provider’s key is shown; other keys you saved stay on this device when you switch.</span>
        <div data-search-provider-row="tavily">
          <label class="ytc-field">Tavily API key
            <span class="ytc-input-key-wrap">
              <input class="ytc-input" data-k="tavilyApiKey" type="password" autocomplete="new-password" placeholder="tvly-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
              <span class="ytc-input-key-suffix">
                <span class="ytc-key-dot" data-key-dot aria-hidden="true"></span>
                <button type="button" class="ytc-key-clear" data-key-clear aria-label="Remove API key" title="Remove saved key">${YTC_KEY_CLEAR_ICON}</button>
              </span>
            </span>
          </label>
        </div>
        <div data-search-provider-row="exa">
          <label class="ytc-field">Exa API key
            <span class="ytc-input-key-wrap">
              <input class="ytc-input" data-k="exaApiKey" type="password" autocomplete="new-password" placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
              <span class="ytc-input-key-suffix">
                <span class="ytc-key-dot" data-key-dot aria-hidden="true"></span>
                <button type="button" class="ytc-key-clear" data-key-clear aria-label="Remove API key" title="Remove saved key">${YTC_KEY_CLEAR_ICON}</button>
              </span>
            </span>
          </label>
        </div>
        <div data-search-provider-row="perplexity">
          <label class="ytc-field">Perplexity API key
            <span class="ytc-input-key-wrap">
              <input class="ytc-input" data-k="perplexityApiKey" type="password" autocomplete="new-password" placeholder="pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
              <span class="ytc-input-key-suffix">
                <span class="ytc-key-dot" data-key-dot aria-hidden="true"></span>
                <button type="button" class="ytc-key-clear" data-key-clear aria-label="Remove API key" title="Remove saved key">${YTC_KEY_CLEAR_ICON}</button>
              </span>
            </span>
          </label>
        </div>
        <div data-search-provider-row="brave">
          <label class="ytc-field">Brave Search subscription token
            <span class="ytc-input-key-wrap">
              <input class="ytc-input" data-k="braveApiKey" type="password" autocomplete="new-password" placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
              <span class="ytc-input-key-suffix">
                <span class="ytc-key-dot" data-key-dot aria-hidden="true"></span>
                <button type="button" class="ytc-key-clear" data-key-clear aria-label="Remove API key" title="Remove saved key">${YTC_KEY_CLEAR_ICON}</button>
              </span>
            </span>
          </label>
        </div>
        <label class="ytc-field">LLM provider
          <select data-k="llmProvider">
            <option value="openai">OpenAI-compatible</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </label>
        <span class="ytc-field-hint">Only the active LLM’s URL and API key are shown; both providers’ values stay saved when you switch.</span>
        <div data-llm-provider-row="openai">
          <label class="ytc-field">OpenAI-compatible base URL
            <input class="ytc-input" data-k="llmBaseUrl" type="text" placeholder="https://api.openai.com/v1" />
          </label>
          <label class="ytc-field">OpenAI-compatible API key
            <span class="ytc-input-key-wrap">
              <input class="ytc-input" data-k="llmOpenAiKey" type="password" autocomplete="new-password" placeholder="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
              <span class="ytc-input-key-suffix">
                <span class="ytc-key-dot" data-key-dot aria-hidden="true"></span>
                <button type="button" class="ytc-key-clear" data-key-clear aria-label="Remove API key" title="Remove saved key">${YTC_KEY_CLEAR_ICON}</button>
              </span>
            </span>
          </label>
        </div>
        <div data-llm-provider-row="anthropic">
          <label class="ytc-field">Anthropic base URL
            <input class="ytc-input" data-k="anthropicBaseUrl" type="text" placeholder="https://api.anthropic.com" />
          </label>
          <label class="ytc-field">Anthropic API key
            <span class="ytc-input-key-wrap">
              <input class="ytc-input" data-k="llmAnthropicKey" type="password" autocomplete="new-password" placeholder="sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
              <span class="ytc-input-key-suffix">
                <span class="ytc-key-dot" data-key-dot aria-hidden="true"></span>
                <button type="button" class="ytc-key-clear" data-key-clear aria-label="Remove API key" title="Remove saved key">${YTC_KEY_CLEAR_ICON}</button>
              </span>
            </span>
          </label>
        </div>
      </div>
      <div class="ytc-settings-section">
        <p class="ytc-settings-section-title">Model</p>
        <label class="ytc-field">Model ID
          <input class="ytc-input" data-k="llmModel" type="text" placeholder="e.g. gpt-4o-mini" />
        </label>
      </div>
      <div class="ytc-settings-section">
        <p class="ytc-settings-section-title">Timing</p>
        <div class="ytc-settings-grid">
          <label class="ytc-field">Interval (s)
            <input class="ytc-input" data-k="checkIntervalSec" type="number" min="15" step="5" />
          </label>
          <label class="ytc-field">Caption window (s)
            <input class="ytc-input" data-k="windowSec" type="number" min="10" step="5" />
          </label>
        </div>
      </div>
      <div class="ytc-settings-section">
        <p class="ytc-settings-section-title">Pipeline</p>
        <label class="ytc-check">
          <input data-k="twoStagePipeline" type="checkbox" />
          <span>Two-stage: extract queries → web search</span>
        </label>
        <label class="ytc-check">
          <input data-k="includeFullTranscriptInPrompt" type="checkbox" />
          <span>Include full transcript in prompts</span>
        </label>
      </div>
    </div>
    <div class="ytc-settings-actions">
      <div class="ytc-save-feedback" data-save-feedback role="status" aria-live="polite" aria-atomic="true" hidden></div>
      <button data-save type="button" class="ytc-btn-save">${SAVE_CHANGES_LABEL}</button>
    </div>
  `;
}

export function updateTranslucencyHint(settingsEl: HTMLElement): void {
  const range = settingsEl.querySelector<HTMLInputElement>('[data-k="translucencyPercent"]');
  const hint = settingsEl.querySelector("[data-translucency-hint]");
  if (range && hint) hint.textContent = `${range.value}%`;
}

/** Show only the API key row for the selected search provider (all inputs remain in the DOM for save/load). */
export function updateSearchProviderKeyRows(settingsEl: HTMLElement): void {
  const sel = settingsEl.querySelector<HTMLSelectElement>('[data-k="searchProvider"]');
  const current = sel?.value ?? DEFAULT_SETTINGS.searchProvider;
  settingsEl.querySelectorAll<HTMLElement>("[data-search-provider-row]").forEach((row) => {
    const p = row.dataset.searchProviderRow;
    const show = p === current;
    row.style.display = show ? "" : "none";
    row.setAttribute("aria-hidden", show ? "false" : "true");
  });
}

export const API_KEY_DOT_FIELDS: (keyof ExtensionSettings)[] = [
  "tavilyApiKey",
  "exaApiKey",
  "perplexityApiKey",
  "braveApiKey",
  "llmOpenAiKey",
  "llmAnthropicKey",
];

/** Green dot and remove control: visible when the field has a non-empty value. */
export function updateApiKeyDots(settingsEl: HTMLElement): void {
  for (const k of API_KEY_DOT_FIELDS) {
    const input = settingsEl.querySelector<HTMLInputElement>(`[data-k="${String(k)}"]`);
    const wrap = input?.closest(".ytc-input-key-wrap");
    const dot = wrap?.querySelector<HTMLElement>("[data-key-dot]");
    const clearBtn = wrap?.querySelector<HTMLButtonElement>("[data-key-clear]");
    if (!input || !dot) continue;
    const has = input.value.trim().length > 0;
    dot.classList.toggle("ytc-key-dot--active", has);
    dot.title = has ? "Key saved locally" : "";
    if (clearBtn) {
      clearBtn.classList.toggle("ytc-key-clear--visible", has);
      clearBtn.disabled = !has;
    }
  }
}

/** Show only the base URL row for the selected LLM provider; refresh key/model placeholders. */
export function updateLlmProviderRows(settingsEl: HTMLElement): void {
  const sel = settingsEl.querySelector<HTMLSelectElement>('[data-k="llmProvider"]');
  const current = sel?.value === "anthropic" ? "anthropic" : "openai";
  settingsEl.querySelectorAll<HTMLElement>("[data-llm-provider-row]").forEach((row) => {
    const p = row.dataset.llmProviderRow;
    const show = p === current;
    row.style.display = show ? "" : "none";
    row.setAttribute("aria-hidden", show ? "false" : "true");
  });
  const modelInput = settingsEl.querySelector<HTMLInputElement>('[data-k="llmModel"]');
  if (modelInput) {
    modelInput.placeholder =
      current === "anthropic" ? "e.g. claude-sonnet-4-20250514" : "e.g. gpt-4o-mini";
  }
}

export function fillSettingsForm(settingsEl: HTMLElement, s: ExtensionSettings): void {
  const state = getFormState(settingsEl);
  state.lastSavedSettings = { ...s };
  setFormState(settingsEl, state);
  updateSaveButtonState(settingsEl, "idle");
  settingsEl.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-k]").forEach((input) => {
    const k = input.dataset.k as keyof ExtensionSettings;
    if (k === "twoStagePipeline" || k === "includeFullTranscriptInPrompt") {
      (input as HTMLInputElement).checked = Boolean(s[k]);
    } else {
      input.value = String(s[k] ?? "");
    }
  });
  updateTranslucencyHint(settingsEl);
  updateSearchProviderKeyRows(settingsEl);
  updateLlmProviderRows(settingsEl);
  updateApiKeyDots(settingsEl);
}

export async function saveSettingsFromForm(settingsEl: HTMLElement): Promise<void> {
  const next: Partial<ExtensionSettings> = {};
  settingsEl.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-k]").forEach((input) => {
    const k = input.dataset.k as keyof ExtensionSettings;
    if (k === "twoStagePipeline" || k === "includeFullTranscriptInPrompt") {
      next[k] = (input as HTMLInputElement).checked as ExtensionSettings[typeof k];
    } else if (k === "checkIntervalSec" || k === "windowSec") {
      const n = Number((input as HTMLInputElement).value);
      next[k] = (Number.isFinite(n) && n > 0 ? n : DEFAULT_SETTINGS[k]) as ExtensionSettings[typeof k];
    } else if (k === "translucencyPercent") {
      const n = Number((input as HTMLInputElement).value);
      next[k] = (Number.isFinite(n) ? clamp(Math.round(n), 0, 100) : DEFAULT_SETTINGS.translucencyPercent) as ExtensionSettings[typeof k];
    } else if (k === "llmProvider") {
      const v = (input as HTMLSelectElement).value;
      next.llmProvider = v === "anthropic" ? "anthropic" : "openai";
    } else if (k === "searchProvider") {
      const v = (input as HTMLSelectElement).value;
      const allowed: SearchProvider[] = ["tavily", "exa", "perplexity", "brave"];
      next.searchProvider = allowed.includes(v as SearchProvider) ? (v as SearchProvider) : DEFAULT_SETTINGS.searchProvider;
    } else {
      next[k] = input.value as ExtensionSettings[typeof k];
    }
  });
  await chrome.storage.local.set(next);
}

/** Update the save button visual state: idle, pending, saving, success, error */
export function updateSaveButtonState(
  settingsEl: HTMLElement,
  state: "idle" | "pending" | "saving" | "success" | "error",
): void {
  const btn = settingsEl.querySelector<HTMLButtonElement>("[data-save]");
  if (!btn) return;
  btn.classList.remove("ytc-btn-save--success", "ytc-btn-save--error", "ytc-btn-save--pending", "ytc-btn-save--saving");
  switch (state) {
    case "pending":
      btn.classList.add("ytc-btn-save--pending");
      btn.textContent = SAVE_PENDING_LABEL;
      break;
    case "saving":
      btn.classList.add("ytc-btn-save--saving");
      btn.textContent = SAVE_SAVING_LABEL;
      break;
    case "success":
      btn.classList.add("ytc-btn-save--success");
      btn.textContent = "Saved";
      break;
    case "error":
      btn.classList.add("ytc-btn-save--error");
      break;
    default:
      btn.textContent = SAVE_CHANGES_LABEL;
  }
}

/** Check if current form values differ from last saved settings */
export function checkPendingChanges(settingsEl: HTMLElement): boolean {
  const state = getFormState(settingsEl);
  if (!state.lastSavedSettings) return false;
  const current = getCurrentFormValues(settingsEl);
  const keys = Object.keys(current) as (keyof ExtensionSettings)[];
  return keys.some((k) => {
    const saved = state.lastSavedSettings![k];
    const now = current[k];
    if (typeof saved === "boolean") return saved !== Boolean(now);
    if (typeof saved === "number") return saved !== Number(now);
    return String(saved ?? "") !== String(now ?? "");
  });
}

/** Get current values from the form as partial settings */
function getCurrentFormValues(settingsEl: HTMLElement): Partial<ExtensionSettings> {
  const current: Partial<ExtensionSettings> = {};
  settingsEl.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-k]").forEach((input) => {
    const k = input.dataset.k as keyof ExtensionSettings;
    if (k === "twoStagePipeline" || k === "includeFullTranscriptInPrompt") {
      current[k] = (input as HTMLInputElement).checked as ExtensionSettings[typeof k];
    } else if (k === "checkIntervalSec" || k === "windowSec" || k === "translucencyPercent") {
      current[k] = Number((input as HTMLInputElement).value) as ExtensionSettings[typeof k];
    } else {
      current[k] = input.value as ExtensionSettings[typeof k];
    }
  });
  return current;
}

/** Call this whenever a form input changes to update pending state */
function onFormChanged(settingsEl: HTMLElement): void {
  const hasChanges = checkPendingChanges(settingsEl);
  updateSaveButtonState(settingsEl, hasChanges ? "pending" : "idle");
}

/** Visible only inside settings (status bar is hidden while settings are open on YouTube). */
export function flashSettingsSaveFeedback(settingsEl: HTMLElement, kind: "success" | "error", errorDetail?: string): void {
  const state = getFormState(settingsEl);
  const feedback = settingsEl.querySelector<HTMLElement>("[data-save-feedback]");
  const btn = settingsEl.querySelector<HTMLButtonElement>("[data-save]");
  if (state.saveFeedbackClearTimer !== null) {
    window.clearTimeout(state.saveFeedbackClearTimer);
    state.saveFeedbackClearTimer = null;
  }
  if (feedback) {
    feedback.classList.remove("ytc-save-feedback--success", "ytc-save-feedback--error");
    if (kind === "success") {
      feedback.textContent = "Settings saved";
      feedback.classList.add("ytc-save-feedback--success");
    } else {
      feedback.textContent = errorDetail ?? "Couldn’t save settings";
      feedback.classList.add("ytc-save-feedback--error");
    }
    feedback.hidden = false;
  }
  if (btn) {
    btn.classList.remove("ytc-btn-save--success", "ytc-btn-save--error", "ytc-btn-save--saving");
    if (kind === "success") {
      btn.classList.add("ytc-btn-save--success");
      btn.textContent = "Saved";
    } else {
      btn.classList.add("ytc-btn-save--error");
    }
  }
  state.saveFeedbackClearTimer = window.setTimeout(() => {
    if (feedback) {
      feedback.textContent = "";
      feedback.classList.remove("ytc-save-feedback--success", "ytc-save-feedback--error");
      feedback.hidden = true;
    }
    if (btn) {
      btn.classList.remove("ytc-btn-save--success", "ytc-btn-save--error", "ytc-btn-save--saving");
      const hasChanges = checkPendingChanges(settingsEl);
      if (hasChanges) {
        btn.classList.add("ytc-btn-save--pending");
        btn.textContent = SAVE_PENDING_LABEL;
      } else {
        btn.textContent = SAVE_CHANGES_LABEL;
      }
    }
    state.saveFeedbackClearTimer = null;
    setFormState(settingsEl, state);
  }, SAVE_FEEDBACK_MS);
  setFormState(settingsEl, state);
}

export function wireSettingsForm(
  settingsEl: HTMLElement,
  options: {
    loadSettings: () => Promise<ExtensionSettings>;
    onTranslucencyInput: (percent: number) => void;
    onSaved: (settings: ExtensionSettings) => void | Promise<void>;
    onKeyCleared?: (key: keyof ExtensionSettings) => void;
    enableChangeDetection?: boolean;
  },
): void {
  const enableChangeDetection = options.enableChangeDetection ?? false;
  // Track changes on inputs, selects, and checkboxes (only if enabled)
  const trackInputChanges = () => {
    if (enableChangeDetection) onFormChanged(settingsEl);
  };
  settingsEl.querySelector<HTMLInputElement>('[data-k="translucencyPercent"]')?.addEventListener("input", () => {
    const range = settingsEl.querySelector<HTMLInputElement>('[data-k="translucencyPercent"]');
    const v = range ? Number(range.value) : NaN;
    if (Number.isFinite(v)) {
      options.onTranslucencyInput(v);
      updateTranslucencyHint(settingsEl);
    }
    trackInputChanges();
  });
  settingsEl.querySelector<HTMLSelectElement>('[data-k="searchProvider"]')?.addEventListener("change", () => {
    updateSearchProviderKeyRows(settingsEl);
    trackInputChanges();
  });
  settingsEl.querySelector<HTMLSelectElement>('[data-k="llmProvider"]')?.addEventListener("change", () => {
    updateLlmProviderRows(settingsEl);
    trackInputChanges();
  });
  settingsEl.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-k]').forEach((checkbox) => {
    checkbox.addEventListener("change", trackInputChanges);
  });
  settingsEl.querySelectorAll<HTMLInputElement>('input[data-k]:not([type="checkbox"])').forEach((input) => {
    input.addEventListener("input", trackInputChanges);
  });
  settingsEl.addEventListener("input", () => {
    updateApiKeyDots(settingsEl);
  });
  settingsEl.addEventListener("click", async (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-key-clear]");
    if (!btn || !settingsEl.contains(btn)) return;
    e.preventDefault();
    e.stopPropagation();
    const wrap = btn.closest(".ytc-input-key-wrap");
    const input = wrap?.querySelector<HTMLInputElement>("input[data-k]");
    const k = input?.dataset.k;
    if (!input || !k || !(API_KEY_DOT_FIELDS as readonly string[]).includes(k)) return;
    input.value = "";
    await chrome.storage.local.set({ [k]: "" });
    updateApiKeyDots(settingsEl);
    trackInputChanges();
    options.onKeyCleared?.(k as keyof ExtensionSettings);
  });
  settingsEl.querySelector("[data-save]")?.addEventListener("click", async () => {
    try {
      // Set button to saving state (only if change detection is enabled)
      if (enableChangeDetection) updateSaveButtonState(settingsEl, "saving");
      await saveSettingsFromForm(settingsEl);
      updateApiKeyDots(settingsEl);
      const next = await options.loadSettings();
      // Update lastSavedSettings to reflect newly saved values (only if tracking)
      if (enableChangeDetection) {
        const state = getFormState(settingsEl);
        state.lastSavedSettings = { ...next };
        setFormState(settingsEl, state);
      }
      await options.onSaved(next);
      flashSettingsSaveFeedback(settingsEl, "success");
    } catch (e) {
      const msg =
        e instanceof Error && e.message.length > 0 && e.message.length < 120 ? e.message : "Something went wrong.";
      flashSettingsSaveFeedback(settingsEl, "error", msg);
    }
  });
}
