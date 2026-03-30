export type LlmProvider = "openai" | "anthropic";

export type SearchProvider = "tavily" | "exa" | "perplexity" | "brave";

export interface CaptionsSegment {
  startSec: number;
  endSec: number;
  text: string;
}

export interface ExtensionSettings {
  /** Which web search backend to use for evidence (each needs its own API key). */
  searchProvider: SearchProvider;
  /** Each key is persisted as its own `chrome.storage.local` entry; other providers’ keys are left unchanged when you switch or save. */
  tavilyApiKey: string;
  exaApiKey: string;
  perplexityApiKey: string;
  braveApiKey: string;
  /** OpenAI-compatible API base URL (e.g. https://api.openai.com/v1) */
  llmBaseUrl: string;
  /** Anthropic API base URL (default https://api.anthropic.com) */
  anthropicBaseUrl: string;
  llmProvider: LlmProvider;
  /** OpenAI-compatible `/chat/completions` (Bearer). Stored separately from Anthropic. */
  llmOpenAiKey: string;
  /** Anthropic `/v1/messages` (x-api-key). Stored separately from OpenAI-compatible. */
  llmAnthropicKey: string;
  llmModel: string;
  checkIntervalSec: number;
  windowSec: number;
  /** Stage 1: LLM extracts 1–3 search queries from the caption window; then search per query (deduped). */
  twoStagePipeline: boolean;
  /** Include full transcript (capped) in the verdict prompt for context; search stays scoped to the window. */
  includeFullTranscriptInPrompt: boolean;
  /** 0 = least see-through (more solid when idle), 100 = most translucent when idle. Hover/focus still goes solid. */
  translucencyPercent: number;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  searchProvider: "tavily",
  tavilyApiKey: "",
  exaApiKey: "",
  perplexityApiKey: "",
  braveApiKey: "",
  llmBaseUrl: "https://api.openai.com/v1",
  anthropicBaseUrl: "https://api.anthropic.com",
  llmProvider: "openai",
  llmOpenAiKey: "",
  llmAnthropicKey: "",
  llmModel: "gpt-4o-mini",
  checkIntervalSec: 45,
  windowSec: 90,
  twoStagePipeline: true,
  includeFullTranscriptInPrompt: true,
  translucencyPercent: 50,
};

export interface FactVerdict {
  claim: string;
  /** `unclear` is shown in the UI as "Need Research" (insufficient or mixed evidence). */
  status: "supported" | "contradicted" | "unclear";
  explanation: string;
  sources: string[];
}

export interface FactCheckResponse {
  ok: boolean;
  verdicts?: FactVerdict[];
  error?: string;
}

export interface FactCheckMessage {
  type: "FACT_CHECK";
  captionExcerpt: string;
  /** Optional full transcript text (capped in content script) for richer LLM context */
  fullTranscript?: string;
  /** Video title for topic/context (disambiguates claims, improves search queries). */
  videoTitle?: string;
}
