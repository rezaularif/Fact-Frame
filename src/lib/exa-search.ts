import type { SearchResultItem } from "./tavily";

export interface ExaSearchOptions {
  maxResults: number;
}

interface ExaResultRow {
  title?: string;
  url?: string;
  text?: string;
  highlights?: string[];
}

interface ExaSearchResponse {
  results?: ExaResultRow[];
}

function snippetFromResult(r: ExaResultRow): string {
  if (r.text?.trim()) return r.text.trim().slice(0, 1200);
  const h = r.highlights;
  if (Array.isArray(h) && h.length) return h.join("\n").slice(0, 1200);
  return "";
}

export async function exaSearch(
  apiKey: string,
  query: string,
  options: ExaSearchOptions,
): Promise<{ results: SearchResultItem[] }> {
  const q = query.trim().slice(0, 400);
  if (!q) {
    return { results: [] };
  }

  const res = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      query: q,
      type: "fast",
      numResults: Math.min(100, Math.max(1, options.maxResults)),
      contents: {
        highlights: { maxCharacters: 1200 },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Exa HTTP ${res.status}: ${text.slice(0, 600)}`);
  }

  const data = (await res.json()) as ExaSearchResponse;
  const raw = data.results ?? [];
  const results: SearchResultItem[] = raw.map((r) => ({
    title: String(r.title ?? ""),
    url: String(r.url ?? ""),
    content: snippetFromResult(r),
  }));

  return { results };
}
