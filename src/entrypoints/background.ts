import { braveSearch } from "../lib/brave-search";
import { exaSearch } from "../lib/exa-search";
import { loadExtensionSettings } from "../lib/load-extension-settings";
import { llmExtractSearchQueries, llmFactCheck, type LlmRuntime } from "../lib/llm";
import { perplexitySearch } from "../lib/perplexity-search";
import { mergeSearchResultsDedupe, tavilySearch } from "../lib/tavily";
import type { ExtensionSettings, FactCheckMessage, FactCheckResponse, FactVerdict, SearchProvider } from "../types";
import { DEFAULT_SETTINGS } from "../types";

const loadSettings = loadExtensionSettings;

function toLlmRuntime(s: ExtensionSettings): LlmRuntime {
  const apiKey = s.llmProvider === "anthropic" ? s.llmAnthropicKey : s.llmOpenAiKey;
  return {
    provider: s.llmProvider,
    openaiBaseUrl: s.llmBaseUrl,
    anthropicBaseUrl: s.anthropicBaseUrl || DEFAULT_SETTINGS.anthropicBaseUrl,
    apiKey: apiKey ?? "",
    model: s.llmModel,
  };
}

function getSearchApiKey(s: ExtensionSettings): string {
  switch (s.searchProvider) {
    case "tavily":
      return s.tavilyApiKey?.trim() ?? "";
    case "exa":
      return s.exaApiKey?.trim() ?? "";
    case "perplexity":
      return s.perplexityApiKey?.trim() ?? "";
    case "brave":
      return s.braveApiKey?.trim() ?? "";
    default:
      return s.tavilyApiKey?.trim() ?? "";
  }
}

function getLlmApiKey(s: ExtensionSettings): string {
  return s.llmProvider === "anthropic" ? (s.llmAnthropicKey?.trim() ?? "") : (s.llmOpenAiKey?.trim() ?? "");
}

function llmKeyErrorMessage(s: ExtensionSettings): string {
  return s.llmProvider === "anthropic" ?
      "Anthropic API key is not set."
    : "OpenAI-compatible API key is not set.";
}

function searchKeyErrorMessage(provider: SearchProvider): string {
  switch (provider) {
    case "tavily":
      return "Tavily API key is not set.";
    case "exa":
      return "Exa API key is not set.";
    case "perplexity":
      return "Perplexity API key is not set.";
    case "brave":
      return "Brave Search API subscription token is not set.";
    default:
      return "Search API key is not set.";
  }
}

async function searchWeb(s: ExtensionSettings, query: string) {
  const key = getSearchApiKey(s);
  const maxResults = 5;
  switch (s.searchProvider) {
    case "tavily":
      return tavilySearch(key, query, { maxResults, searchDepth: "fast" });
    case "exa":
      return exaSearch(key, query, { maxResults });
    case "perplexity":
      return perplexitySearch(key, query, { maxResults });
    case "brave":
      return braveSearch(key, query, { maxResults });
    default:
      return tavilySearch(key, query, { maxResults, searchDepth: "fast" });
  }
}

async function runFactCheck(
  captionExcerpt: string,
  fullTranscriptFromPage: string | undefined,
  videoTitle?: string,
): Promise<FactVerdict[]> {
  const s = await loadSettings();
  if (!getSearchApiKey(s)) {
    throw new Error(searchKeyErrorMessage(s.searchProvider));
  }
  if (!getLlmApiKey(s)) {
    throw new Error(llmKeyErrorMessage(s));
  }

  const excerpt = captionExcerpt.trim().slice(0, 8000);
  if (!excerpt) {
    return [];
  }

  const titleTrim = videoTitle?.trim() ? videoTitle.trim().slice(0, 500) : undefined;

  const transcriptForPrompt =
    s.includeFullTranscriptInPrompt && fullTranscriptFromPage?.trim() ?
      fullTranscriptFromPage.trim().slice(0, 16000)
    : undefined;

  const rt = toLlmRuntime(s);

  let searchResults;

  if (s.twoStagePipeline) {
    const queries = await llmExtractSearchQueries(rt, excerpt, titleTrim);
    const lists = await Promise.all(queries.map((q) => searchWeb(s, q).then((r) => r.results)));
    searchResults = mergeSearchResultsDedupe(lists, 12);
  } else {
    const captionPart = excerpt.slice(0, 400);
    const searchQuery =
      titleTrim ? `${titleTrim} ${captionPart}`.replace(/\s+/g, " ").trim().slice(0, 500) : captionPart;
    const one = await searchWeb(s, searchQuery);
    searchResults = one.results;
  }

  return llmFactCheck(rt, excerpt, transcriptForPrompt, searchResults, titleTrim);
}

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason !== "install") return;
    const url = chrome.runtime.getURL("factframe-settings.html");
    chrome.tabs.create({ url });
  });

  chrome.runtime.onMessage.addListener(
    (message: FactCheckMessage | { type?: string }, _sender, sendResponse) => {
      if (message?.type !== "FACT_CHECK") {
        return;
      }

      const m = message as FactCheckMessage;
      const excerpt = m.captionExcerpt ?? "";
      const fullTranscript = m.fullTranscript;
      const videoTitle = m.videoTitle?.trim() || undefined;

      void (async () => {
        try {
          const verdicts = await runFactCheck(excerpt, fullTranscript, videoTitle);
          sendResponse({ ok: true, verdicts } satisfies FactCheckResponse);
        } catch (e) {
          sendResponse({
            ok: false,
            error: e instanceof Error ? e.message : String(e),
          } satisfies FactCheckResponse);
        }
      })();

      return true;
    },
  );
});
