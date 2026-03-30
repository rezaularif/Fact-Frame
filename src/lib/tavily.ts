export interface SearchResultItem {
  title: string;
  url: string;
  content: string;
}

/** @deprecated Use SearchResultItem */
export type TavilyResultItem = SearchResultItem;

export interface TavilySearchOptions {
  maxResults: number;
  searchDepth: "fast" | "advanced";
}

interface TavilyResponse {
  results?: Array<{ title?: string; url?: string; content?: string }>;
}

export async function tavilySearch(
  apiKey: string,
  query: string,
  options: TavilySearchOptions,
): Promise<{ results: SearchResultItem[] }> {
  const q = query.trim().slice(0, 400);
  if (!q) {
    return { results: [] };
  }

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      query: q,
      search_depth: options.searchDepth,
      max_results: options.maxResults,
      include_answer: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tavily HTTP ${res.status}: ${text.slice(0, 600)}`);
  }

  const data = (await res.json()) as TavilyResponse;
  const raw = data.results ?? [];
  const results: SearchResultItem[] = raw.map((r) => ({
    title: String(r.title ?? ""),
    url: String(r.url ?? ""),
    content: String(r.content ?? ""),
  }));

  return { results };
}

/** Merge multiple search result lists, deduping by URL (first occurrence wins). */
export function mergeSearchResultsDedupe(lists: SearchResultItem[][], maxTotal: number): SearchResultItem[] {
  const seen = new Set<string>();
  const out: SearchResultItem[] = [];
  for (const list of lists) {
    for (const r of list) {
      const key = r.url.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(r);
      if (out.length >= maxTotal) return out;
    }
  }
  return out;
}

/** @deprecated Use mergeSearchResultsDedupe */
export const mergeTavilyResultsDedupe = mergeSearchResultsDedupe;
