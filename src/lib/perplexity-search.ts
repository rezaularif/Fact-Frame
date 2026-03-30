import type { SearchResultItem } from "./tavily";

export interface PerplexitySearchOptions {
  maxResults: number;
}

interface PerplexityResultRow {
  title?: string;
  url?: string;
  snippet?: string;
}

interface PerplexitySearchResponse {
  results?: PerplexityResultRow[];
}

export async function perplexitySearch(
  apiKey: string,
  query: string,
  options: PerplexitySearchOptions,
): Promise<{ results: SearchResultItem[] }> {
  const q = query.trim().slice(0, 400);
  if (!q) {
    return { results: [] };
  }

  const res = await fetch("https://api.perplexity.ai/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: q,
      max_results: Math.min(20, Math.max(1, options.maxResults)),
      max_tokens_per_page: 4096,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Perplexity Search HTTP ${res.status}: ${text.slice(0, 600)}`);
  }

  const data = (await res.json()) as PerplexitySearchResponse;
  const raw = data.results ?? [];
  const results: SearchResultItem[] = raw.map((r) => ({
    title: String(r.title ?? ""),
    url: String(r.url ?? ""),
    content: String(r.snippet ?? "").slice(0, 1200),
  }));

  return { results };
}
