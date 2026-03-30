import type { FactVerdict, LlmProvider } from "../types";
import type { SearchResultItem } from "./tavily";

export interface LlmRuntime {
  provider: LlmProvider;
  openaiBaseUrl: string;
  anthropicBaseUrl: string;
  apiKey: string;
  model: string;
}

function normalizeChatCompletionsUrl(baseUrl: string): string {
  const u = baseUrl.trim().replace(/\/+$/, "");
  if (u.endsWith("/chat/completions")) return u;
  return `${u}/chat/completions`;
}

function normalizeAnthropicMessagesUrl(baseUrl: string): string {
  const u = baseUrl.trim().replace(/\/+$/, "");
  if (u.endsWith("/messages")) return u;
  if (u.endsWith("/v1")) return `${u}/messages`;
  return `${u}/v1/messages`;
}

function extractOpenAiMessageContent(data: unknown): string {
  const d = data as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  return d.choices?.[0]?.message?.content ?? "";
}

function extractAnthropicMessageContent(data: unknown): string {
  const d = data as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const blocks = d.content ?? [];
  return blocks.map((b) => (b.type === "text" ? (b.text ?? "") : "")).join("");
}

const VERDICT_SYSTEM = `You are a careful fact-checking assistant. Compare the caption claims to the web evidence.

Respond with a single JSON object (no markdown, no code fences) matching this shape:
{"verdicts":[{"claim":"short paraphrase of a checkable claim from the caption","status":"supported|contradicted|unclear","explanation":"brief reasoning tied to evidence","sources":["relevant URLs from the evidence list"]}]}

Rules:
- Only include claims that are actually stated or clearly implied in the caption excerpt (and full transcript context if provided). Use the video title only as topic context, not as a source of factual claims.
- "supported" if quality sources support the claim; "contradicted" if quality sources contradict it; "unclear" if evidence is insufficient or mixed (users will see this as needing more research, not as a final verdict).
- sources must be URLs copied from the evidence block when possible.`;

const EXTRACT_QUERIES_SYSTEM = `You extract short web search queries to fact-check spoken claims.

Return a single JSON object (no markdown) of this shape:
{"queries":["query1","query2"]}

Rules:
- Return 1 to 3 distinct, concise English search queries that would help verify factual claims in the caption window.
- When a video title is provided, use it to narrow topic/entity (people, places, events) but still ground queries in the caption.
- Queries must be under 120 characters each.
- Focus on checkable facts (numbers, dates, names, scientific/medical claims, events), not opinions.`;

function sanitizeBlock(s: string): string {
  return s.replace(/"""/g, '"');
}

function buildVerdictUserPrompt(
  captionExcerpt: string,
  fullTranscript: string | undefined,
  tavilyResults: SearchResultItem[],
  videoTitle?: string,
): string {
  const evidence = tavilyResults
    .map(
      (r, i) =>
        `[${i + 1}] ${r.title}\nURL: ${r.url}\nSnippet: ${r.content.slice(0, 600)}`,
    )
    .join("\n\n");

  const transcriptBlock =
    fullTranscript?.trim() ?
      `\n\nFull video transcript (for context; focus fact-check on the window excerpt):\n"""${sanitizeBlock(fullTranscript.trim())}"""\n`
    : "";

  const titleBlock =
    videoTitle?.trim() ?
      `Video title (topic context only):\n"""${sanitizeBlock(videoTitle.trim().slice(0, 500))}"""\n\n`
    : "";

  return `${titleBlock}Video caption window excerpt (may contain errors from auto-captions):\n"""${sanitizeBlock(captionExcerpt)}"""${transcriptBlock}\n\nWeb search evidence:\n${evidence || "(no results)"}\n\nReturn JSON only.`;
}

function buildExtractQueriesUserPrompt(captionExcerpt: string, videoTitle?: string): string {
  const titleBlock =
    videoTitle?.trim() ?
      `Video title (topic context only):\n"""${sanitizeBlock(videoTitle.trim().slice(0, 500))}"""\n\n`
    : "";
  return `${titleBlock}Caption window to analyze:\n"""${sanitizeBlock(captionExcerpt)}"""\n\nReturn JSON only.`;
}

export async function llmExtractSearchQueries(
  rt: LlmRuntime,
  captionExcerpt: string,
  videoTitle?: string,
): Promise<string[]> {
  const excerpt = captionExcerpt.trim().slice(0, 8000);
  if (!excerpt) return [];

  const userPrompt = buildExtractQueriesUserPrompt(excerpt, videoTitle);
  let raw: string;

  if (rt.provider === "anthropic") {
    raw = await postAnthropicMessages(rt, EXTRACT_QUERIES_SYSTEM, userPrompt, 512);
  } else {
    const messages = [
      { role: "system" as const, content: EXTRACT_QUERIES_SYSTEM },
      { role: "user" as const, content: userPrompt },
    ];
    let data: unknown;
    try {
      data = await postOpenAiChat(rt, messages, true);
    } catch {
      data = await postOpenAiChat(rt, messages, false);
    }
    raw = extractOpenAiMessageContent(data);
  }

  const parsed = parseJsonQueries(raw);
  const queries = (parsed.queries ?? [])
    .map((q) => String(q).trim())
    .filter(Boolean)
    .slice(0, 3);

  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const q of queries) {
    const k = q.toLowerCase().slice(0, 200);
    if (seen.has(k)) continue;
    seen.add(k);
    deduped.push(q.slice(0, 120));
  }
  return deduped.length ? deduped : [excerpt.slice(0, 400)];
}

export async function llmFactCheck(
  rt: LlmRuntime,
  captionExcerpt: string,
  fullTranscript: string | undefined,
  tavilyResults: SearchResultItem[],
  videoTitle?: string,
): Promise<FactVerdict[]> {
  const excerpt = captionExcerpt.trim().slice(0, 8000);
  const transcript =
    fullTranscript?.trim() ? fullTranscript.trim().slice(0, 16000) : undefined;

  const userPrompt = buildVerdictUserPrompt(excerpt, transcript, tavilyResults, videoTitle);

  let raw: string;
  if (rt.provider === "anthropic") {
    raw = await postAnthropicMessages(rt, VERDICT_SYSTEM, userPrompt, 4096);
  } else {
    const messages = [
      { role: "system" as const, content: VERDICT_SYSTEM },
      { role: "user" as const, content: userPrompt },
    ];
    let data: unknown;
    try {
      data = await postOpenAiChat(rt, messages, true);
    } catch {
      data = await postOpenAiChat(rt, messages, false);
    }
    raw = extractOpenAiMessageContent(data);
  }

  const parsed = parseJsonVerdicts(raw);
  const verdicts = parsed.verdicts ?? [];
  return verdicts.map((v) => ({
    claim: String(v.claim ?? ""),
    status: normalizeStatus(v.status),
    explanation: String(v.explanation ?? ""),
    sources: Array.isArray(v.sources) ? v.sources.map(String) : [],
  }));
}

async function postOpenAiChat(
  rt: LlmRuntime,
  messages: Array<{ role: "system" | "user"; content: string }>,
  useJsonObjectFormat: boolean,
): Promise<unknown> {
  const url = normalizeChatCompletionsUrl(rt.openaiBaseUrl);
  const body: Record<string, unknown> = {
    model: rt.model,
    temperature: 0.2,
    messages,
  };
  if (useJsonObjectFormat) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${rt.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM HTTP ${res.status}: ${text.slice(0, 800)}`);
  }

  return res.json();
}

async function postAnthropicMessages(
  rt: LlmRuntime,
  system: string,
  userContent: string,
  maxTokens: number,
): Promise<string> {
  const url = normalizeAnthropicMessagesUrl(rt.anthropicBaseUrl);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": rt.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: rt.model,
      max_tokens: maxTokens,
      temperature: 0.2,
      system,
      messages: [{ role: "user", content: userContent }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic HTTP ${res.status}: ${text.slice(0, 800)}`);
  }

  const data = await res.json();
  return extractAnthropicMessageContent(data);
}

function parseJsonVerdicts(raw: string): { verdicts?: FactVerdict[] } {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed) as { verdicts?: FactVerdict[] };
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1)) as { verdicts?: FactVerdict[] };
    }
    throw new Error("LLM did not return valid JSON.");
  }
}

function parseJsonQueries(raw: string): { queries?: string[] } {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed) as { queries?: string[] };
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1)) as { queries?: string[] };
    }
    return { queries: [] };
  }
}

function normalizeStatus(s: unknown): FactVerdict["status"] {
  const x = String(s ?? "").toLowerCase();
  if (x === "supported" || x === "contradicted" || x === "unclear") return x;
  return "unclear";
}
