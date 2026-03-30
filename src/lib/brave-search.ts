import type { SearchResultItem } from "./tavily";

export interface BraveSearchOptions {
  maxResults: number;
}

interface BraveWebResult {
  title?: string;
  url?: string;
  description?: string;
  extra_snippets?: string[];
}

interface BraveSearchResponse {
  web?: {
    results?: BraveWebResult[];
  };
}

export async function braveSearch(
  apiKey: string,
  query: string,
  options: BraveSearchOptions,
): Promise<{ results: SearchResultItem[] }> {
  const q = query.trim().slice(0, 400);
  if (!q) {
    return { results: [] };
  }

  const count = Math.min(20, Math.max(1, options.maxResults));
  const params = new URLSearchParams({
    q,
    count: String(count),
    extra_snippets: "true",
  });

  const res = await fetch(`https://api.search.brave.com/res/v1/web/search?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-Subscription-Token": apiKey,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brave Search HTTP ${res.status}: ${text.slice(0, 600)}`);
  }

  const data = (await res.json()) as BraveSearchResponse;
  const raw = data.web?.results ?? [];
  const results: SearchResultItem[] = raw.map((r) => {
    const desc = String(r.description ?? "").trim();
    const extras = Array.isArray(r.extra_snippets) ? r.extra_snippets.filter(Boolean).join("\n") : "";
    const content = [desc, extras].filter(Boolean).join("\n\n").slice(0, 1200);
    return {
      title: String(r.title ?? ""),
      url: String(r.url ?? ""),
      content,
    };
  });

  return { results };
}
