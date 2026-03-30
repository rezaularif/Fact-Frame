import type { ExtensionSettings } from "../types";
import { DEFAULT_SETTINGS } from "../types";

/** Keys persisted in `chrome.storage.local` for extension settings. */
export const EXTENSION_SETTINGS_STORAGE_KEYS: (keyof ExtensionSettings)[] = [
  "searchProvider",
  "tavilyApiKey",
  "exaApiKey",
  "perplexityApiKey",
  "braveApiKey",
  "llmBaseUrl",
  "anthropicBaseUrl",
  "llmProvider",
  "llmOpenAiKey",
  "llmAnthropicKey",
  "llmModel",
  "checkIntervalSec",
  "windowSec",
  "twoStagePipeline",
  "includeFullTranscriptInPrompt",
  "translucencyPercent",
];

/**
 * Loads settings, migrates legacy single `llmApiKey` into `llmOpenAiKey` / `llmAnthropicKey` when those are empty, then removes `llmApiKey`.
 */
export async function loadExtensionSettings(): Promise<ExtensionSettings> {
  const raw = (await chrome.storage.local.get([
    ...EXTENSION_SETTINGS_STORAGE_KEYS,
    "llmApiKey",
  ])) as Record<string, unknown>;

  const o = typeof raw.llmOpenAiKey === "string" ? raw.llmOpenAiKey : "";
  const a = typeof raw.llmAnthropicKey === "string" ? raw.llmAnthropicKey : "";
  const legacy = typeof raw.llmApiKey === "string" ? raw.llmApiKey.trim() : "";

  if ("llmApiKey" in raw) {
    const toWrite: Record<string, string> = {};
    if (legacy) {
      if (!o.trim()) toWrite.llmOpenAiKey = legacy;
      if (!a.trim()) toWrite.llmAnthropicKey = legacy;
    }
    if (Object.keys(toWrite).length > 0) {
      await chrome.storage.local.set(toWrite);
    }
    await chrome.storage.local.remove("llmApiKey");
    Object.assign(raw, toWrite);
    delete raw.llmApiKey;
  }

  return { ...DEFAULT_SETTINGS, ...raw } as ExtensionSettings;
}
