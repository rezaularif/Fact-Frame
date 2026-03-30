import type { CaptionsSegment } from "../types";

export function getVideoIdFromLocation(href: string): string | null {
  try {
    const u = new URL(href);
    const v = u.searchParams.get("v");
    if (v) return v;
    const path = u.pathname.replace(/^\//, "");
    if (u.hostname === "youtu.be" && path) return path.split("/")[0] ?? null;
    return null;
  } catch {
    return null;
  }
}

/** One caption track — either fetchable via timedtext params or via player `baseUrl`. */
export interface CaptionTrackInfo {
  langCode: string;
  name: string;
  /** Present when sourced from ytInitialPlayerResponse — use for reliable fetch. */
  baseUrl?: string;
}

function trackDisplayName(track: {
  name?: { simpleText?: string; runs?: Array<{ text?: string }> };
}): string {
  const n = track.name;
  if (n?.simpleText) return n.simpleText;
  if (n?.runs?.length) return n.runs.map((r) => r.text ?? "").join("");
  return "";
}

/** Caption tracks from embedded player JSON (same source the YouTube player uses). */
export function captionTracksFromPlayerResponse(pr: unknown): CaptionTrackInfo[] {
  const root = pr as {
    captions?: { playerCaptionsTracklistRenderer?: { captionTracks?: unknown[] } };
  };
  const raw = root.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!Array.isArray(raw)) return [];

  const out: CaptionTrackInfo[] = [];
  for (const t of raw) {
    const tr = t as {
      baseUrl?: string;
      languageCode?: string;
      name?: { simpleText?: string; runs?: Array<{ text?: string }> };
    };
    if (!tr.baseUrl || !tr.languageCode) continue;
    out.push({
      langCode: tr.languageCode,
      name: trackDisplayName(tr),
      baseUrl: tr.baseUrl,
    });
  }
  return out;
}

function getYtInitialPlayerResponseFromWindow(): unknown | null {
  try {
    const w = window as unknown as { ytInitialPlayerResponse?: unknown };
    if (w.ytInitialPlayerResponse && typeof w.ytInitialPlayerResponse === "object") {
      return w.ytInitialPlayerResponse;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Some builds expose the player payload only via ytcfg. */
function tryPlayerResponseFromYtcfg(): unknown | null {
  try {
    const ytcfg = (window as unknown as { ytcfg?: { get?: (k: string) => unknown } }).ytcfg;
    const get = ytcfg?.get;
    if (!get) return null;
    const vars = get.call(ytcfg, "PLAYER_VARS") as { player_response?: string } | undefined;
    const raw = vars?.player_response;
    if (typeof raw === "string" && raw.length > 0) {
      return JSON.parse(raw) as unknown;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function titleFromPlayerResponse(pr: unknown): string | null {
  const o = pr as { videoDetails?: { title?: string } };
  const t = o.videoDetails?.title;
  if (typeof t === "string" && t.trim()) return t.trim();
  return null;
}

function stripYoutubeTitleSuffix(title: string): string {
  return title.replace(/\s*-\s*YouTube\s*$/i, "").trim();
}

/**
 * Best-effort video title for fact-check context (player JSON, og:title, or watch DOM).
 */
export function getVideoTitleFromPage(): string {
  const pr = getYtInitialPlayerResponseFromWindow() ?? tryPlayerResponseFromYtcfg();
  const fromJson = pr ? titleFromPlayerResponse(pr) : null;
  if (fromJson) return fromJson;

  const og = document.querySelector('meta[property="og:title"]')?.getAttribute("content");
  if (og?.trim()) return stripYoutubeTitleSuffix(og.trim());

  const h1 =
    document.querySelector("ytd-watch-metadata h1 yt-formatted-string")?.textContent ??
    document.querySelector("h1.ytd-watch-metadata yt-formatted-string")?.textContent ??
    document.querySelector("ytd-watch-metadata h1")?.textContent;
  if (h1?.trim()) return h1.trim();

  return "";
}

/** Extract `captionTracks` array JSON from a large HTML/JSON string (page embed). */
function extractCaptionTracksArrayJson(html: string): string | null {
  const needle = '"captionTracks":';
  const idx = html.indexOf(needle);
  if (idx === -1) return null;
  let pos = idx + needle.length;
  while (pos < html.length && /\s/.test(html[pos])) pos++;
  if (html[pos] !== "[") return null;
  return extractBalancedArrayString(html, pos);
}

function extractBalancedArrayString(src: string, startIdx: number): string | null {
  if (src[startIdx] !== "[") return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = startIdx; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      continue;
    }
    if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) return src.slice(startIdx, i + 1);
    }
  }
  return null;
}

/** Find timedtext URLs embedded in serialized page data (escaped or plain). */
export function extractTimedtextUrlsFromHtml(html: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const patterns: RegExp[] = [
    /https:\\\/\\\/www\.youtube\.com\\\/api\\\/timedtext[^"\\\s]+/g,
    /https:\/\/www\.youtube\.com\/api\/timedtext[^"\\\s<>]+/g,
  ];
  for (const re of patterns) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      let u = m[0].replace(/\\\//g, "/");
      u = u.replace(/\\u0026/g, "&");
      if (!u.includes("timedtext")) continue;
      if (seen.has(u)) continue;
      seen.add(u);
      out.push(u);
    }
  }
  return out;
}

function captionTracksFromCaptionTracksJsonArray(json: string): CaptionTrackInfo[] {
  try {
    const arr = JSON.parse(json) as unknown[];
    if (!Array.isArray(arr)) return [];
    const out: CaptionTrackInfo[] = [];
    for (const t of arr) {
      const tr = t as {
        baseUrl?: string;
        languageCode?: string;
        name?: { simpleText?: string; runs?: Array<{ text?: string }> };
      };
      if (!tr.baseUrl || !tr.languageCode) continue;
      out.push({
        langCode: tr.languageCode,
        name: trackDisplayName(tr),
        baseUrl: tr.baseUrl,
      });
    }
    return out;
  } catch {
    return [];
  }
}

function extractCaptionTracksFromHtmlBlob(html: string): CaptionTrackInfo[] {
  const arrJson = extractCaptionTracksArrayJson(html);
  if (arrJson) {
    const tracks = captionTracksFromCaptionTracksJsonArray(arrJson);
    if (tracks.length) return tracks;
  }
  const urls = extractTimedtextUrlsFromHtml(html);
  const out: CaptionTrackInfo[] = [];
  for (const u of urls) {
    try {
      const url = new URL(u, "https://www.youtube.com");
      const lang = url.searchParams.get("lang") ?? "und";
      out.push({ langCode: lang, name: "", baseUrl: url.toString() });
    } catch {
      /* skip */
    }
  }
  return dedupeTracksByBaseUrl(out);
}

function dedupeTracksByBaseUrl(tracks: CaptionTrackInfo[]): CaptionTrackInfo[] {
  const seen = new Set<string>();
  return tracks.filter((t) => {
    const k = (t.baseUrl ?? `${t.langCode}:${t.name}`).slice(0, 500);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

async function fetchWatchPageHtml(videoId: string): Promise<string | null> {
  try {
    const u = new URL(`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`);
    const res = await fetch(u.toString(), { credentials: "include" });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Extract `{...}` JSON starting at startIdx (must point at `{`). */
function extractBalancedJsonString(src: string, startIdx: number): string | null {
  if (src[startIdx] !== "{") return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = startIdx; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return src.slice(startIdx, i + 1);
    }
  }
  return null;
}

function extractYtInitialPlayerResponseFromScripts(): unknown | null {
  const markers = [
    "var ytInitialPlayerResponse = ",
    'window["ytInitialPlayerResponse"] = ',
    "ytInitialPlayerResponse=",
  ];
  const scripts = document.querySelectorAll("script");
  for (const script of scripts) {
    const text = script.textContent ?? "";
    for (const m of markers) {
      const idx = text.indexOf(m);
      if (idx === -1) continue;
      let pos = idx + m.length;
      while (pos < text.length && /\s/.test(text[pos])) pos++;
      const jsonStr = extractBalancedJsonString(text, pos);
      if (!jsonStr) continue;
      try {
        return JSON.parse(jsonStr) as unknown;
      } catch {
        continue;
      }
    }
  }
  return null;
}

/**
 * Wait until YouTube exposes ytInitialPlayerResponse (window or inline script).
 * Prefer {@link listCaptionTracks} for caption discovery.
 */
export async function waitForYtInitialPlayerResponse(maxMs = 15000): Promise<unknown | null> {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    const w = getYtInitialPlayerResponseFromWindow();
    if (w) return w;
    const y = tryPlayerResponseFromYtcfg();
    if (y) return y;
    const s = extractYtInitialPlayerResponseFromScripts();
    if (s) return s;
    await new Promise((r) => setTimeout(r, 200));
  }
  return (
    getYtInitialPlayerResponseFromWindow() ??
    tryPlayerResponseFromYtcfg() ??
    extractYtInitialPlayerResponseFromScripts()
  );
}

async function listCaptionTracksFromTimedtextListApi(videoId: string): Promise<CaptionTrackInfo[]> {
  const url = `https://www.youtube.com/api/timedtext?type=list&v=${encodeURIComponent(videoId)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const xml = await res.text();
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  const tracks = doc.querySelectorAll("track");
  const out: CaptionTrackInfo[] = [];
  tracks.forEach((t) => {
    const lang = t.getAttribute("lang_code") ?? "";
    const name = t.getAttribute("name") ?? "";
    if (lang) out.push({ langCode: lang, name });
  });
  return out;
}

/**
 * Resolve caption tracks: timedtext list, then player JSON (window / ytcfg / scripts),
 * then one optional full-page scrape, then watch-page fetch.
 *
 * Never reads `document.documentElement.outerHTML` in a tight loop — that duplicates the
 * entire page (MBs) dozens of times and can OOM / crash the tab.
 */
export async function listCaptionTracks(videoId: string): Promise<CaptionTrackInfo[]> {
  const fromList = await listCaptionTracksFromTimedtextListApi(videoId);
  if (fromList.length) return fromList;

  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    const candidates = [
      getYtInitialPlayerResponseFromWindow(),
      tryPlayerResponseFromYtcfg(),
      extractYtInitialPlayerResponseFromScripts(),
    ];
    for (const pr of candidates) {
      if (!pr) continue;
      const tracks = captionTracksFromPlayerResponse(pr);
      if (tracks.length) return tracks;
    }
    await new Promise((r) => setTimeout(r, 400));
  }

  try {
    const fromDoc = extractCaptionTracksFromHtmlBlob(document.documentElement.outerHTML);
    if (fromDoc.length) return fromDoc;
  } catch {
    /* ignore */
  }

  const html = await fetchWatchPageHtml(videoId);
  if (html) {
    const fromFetch = extractCaptionTracksFromHtmlBlob(html);
    if (fromFetch.length) return fromFetch;
  }

  return [];
}

function pickPreferredTrack(tracks: CaptionTrackInfo[]): CaptionTrackInfo | null {
  if (!tracks.length) return null;
  const en = tracks.find((t) => t.langCode.toLowerCase().startsWith("en"));
  return en ?? tracks[0];
}

interface Json3Event {
  tStartMs?: number;
  dDurationMs?: number;
  segs?: Array<{ utf8?: string }>;
}

export function parseTimedTextJson3(jsonText: string): CaptionsSegment[] {
  const data = JSON.parse(jsonText) as { events?: Json3Event[] };
  const events = data.events ?? [];
  const out: CaptionsSegment[] = [];
  for (const ev of events) {
    const startMs = ev.tStartMs ?? 0;
    const durMs = ev.dDurationMs ?? 0;
    const text = (ev.segs ?? []).map((s) => s.utf8 ?? "").join("");
    const trimmed = text.replace(/\s+/g, " ").trim();
    if (!trimmed) continue;
    out.push({
      startSec: startMs / 1000,
      endSec: (startMs + durMs) / 1000,
      text: trimmed,
    });
  }
  return out;
}

/** Fetch json3 captions using the signed baseUrl from the player response. */
export async function fetchCaptionJson3FromBaseUrl(baseUrl: string): Promise<CaptionsSegment[]> {
  const u = new URL(baseUrl, "https://www.youtube.com");
  u.searchParams.set("fmt", "json3");
  const res = await fetch(u.toString());
  if (!res.ok) {
    throw new Error(`Captions fetch failed (${res.status})`);
  }
  return parseTimedTextJson3(await res.text());
}

export async function fetchCaptionJson3(
  videoId: string,
  langCode: string,
  trackName: string,
): Promise<CaptionsSegment[]> {
  const params = new URLSearchParams({
    v: videoId,
    lang: langCode,
    fmt: "json3",
  });
  if (trackName) params.set("name", trackName);

  const url = `https://www.youtube.com/api/timedtext?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const params2 = new URLSearchParams({ v: videoId, fmt: "json3", lang: langCode });
    const res2 = await fetch(`https://www.youtube.com/api/timedtext?${params2.toString()}`);
    if (!res2.ok) throw new Error(`Captions fetch failed (${res.status})`);
    return parseTimedTextJson3(await res2.text());
  }
  return parseTimedTextJson3(await res.text());
}

/** Load segments for a track from either baseUrl (preferred) or timedtext params. */
export async function loadCaptionSegments(
  videoId: string,
  track: CaptionTrackInfo,
): Promise<CaptionsSegment[]> {
  if (track.baseUrl?.trim()) {
    return fetchCaptionJson3FromBaseUrl(track.baseUrl);
  }
  return fetchCaptionJson3(videoId, track.langCode, track.name);
}

/**
 * If listing fails, try common language codes (auto-captions sometimes only work this way).
 */
async function tryFetchByGuessedLangs(videoId: string): Promise<CaptionsSegment[] | null> {
  const langs = ["en", "en-US", "en-GB", "en-AU", "en-IN", "a.en"];
  for (const lang of langs) {
    try {
      const segs = await fetchCaptionJson3(videoId, lang, "");
      if (segs.length) return segs;
    } catch {
      /* try next */
    }
  }
  return null;
}

/**
 * Full resolution: list tracks → pick one → load segments, with guessed-lang fallback.
 */
export async function loadCaptionSegmentsForVideo(videoId: string): Promise<CaptionsSegment[]> {
  const tracks = await listCaptionTracks(videoId);
  const chosen = pickPreferredTrack(tracks);
  if (chosen) {
    try {
      const segs = await loadCaptionSegments(videoId, chosen);
      if (segs.length) return segs;
    } catch {
      /* fall through */
    }
  }

  const guessed = await tryFetchByGuessedLangs(videoId);
  return guessed ?? [];
}

export function textForWindow(
  segments: CaptionsSegment[],
  currentSec: number,
  windowSec: number,
): string {
  const start = Math.max(0, currentSec - windowSec);
  const end = currentSec;
  const parts: string[] = [];
  for (const s of segments) {
    if (s.endSec < start || s.startSec > end) continue;
    parts.push(s.text);
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/** Full transcript as plain text (capped) for LLM context. */
export function fullTranscriptText(segments: CaptionsSegment[], maxChars: number): string {
  const joined = segments.map((s) => s.text).join(" ").replace(/\s+/g, " ").trim();
  if (joined.length <= maxChars) return joined;
  return joined.slice(0, maxChars);
}

// --- On-screen caption fallback (when API tracks are unavailable but CC is visible) ---

const CAPTION_DOM_SELECTORS = [
  ".ytp-caption-segment",
  ".ytp-caption-window-container span",
  ".caption-visual-paragraph-plain-line",
  ".ytp-caption-window-rollup span",
  ".ytp-caption-window-bottom span",
];

function captionDomRoots(): ParentNode[] {
  const roots: ParentNode[] = [document];
  const candidates = document.querySelectorAll("#movie_player, .html5-video-player, ytd-player");
  candidates.forEach((el) => {
    roots.push(el);
    if (el.shadowRoot) roots.push(el.shadowRoot);
  });
  const ytd = document.querySelector("ytd-player");
  const inner = ytd?.shadowRoot?.querySelector("#movie_player");
  if (inner) {
    roots.push(inner);
    if (inner.shadowRoot) roots.push(inner.shadowRoot);
  }
  return roots;
}

/** Visible CC text from the player UI (YouTube changes selectors occasionally). */
export function collectCaptionTextFromDom(): string {
  const parts: string[] = [];
  const seen = new Set<string>();
  for (const root of captionDomRoots()) {
    for (const sel of CAPTION_DOM_SELECTORS) {
      try {
        root.querySelectorAll(sel).forEach((el) => {
          const t = el.textContent?.replace(/\s+/g, " ").trim();
          if (t && t.length > 0 && !seen.has(t)) {
            seen.add(t);
            parts.push(t);
          }
        });
      } catch {
        /* ignore */
      }
    }
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export interface DomCaptionSample {
  timeSec: number;
  text: string;
}

export function trimDomCaptionBuffer(
  buffer: DomCaptionSample[],
  nowSec: number,
  windowSec: number,
): DomCaptionSample[] {
  const minT = nowSec - windowSec;
  return buffer.filter((b) => b.timeSec >= minT);
}

/** Append a sample; avoids duplicate consecutive lines. */
export function appendDomCaptionSample(
  buffer: DomCaptionSample[],
  timeSec: number,
  text: string,
): DomCaptionSample[] {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed) return buffer;
  const last = buffer[buffer.length - 1];
  if (last && last.text === trimmed && timeSec - last.timeSec < 2) return buffer;
  buffer.push({ timeSec, text: trimmed });
  return buffer;
}

export function domBufferToExcerpt(buffer: DomCaptionSample[], windowSec: number, nowSec: number): string {
  const trimmed = trimDomCaptionBuffer(buffer, nowSec, windowSec);
  return trimmed.map((b) => b.text).join(" ").replace(/\s+/g, " ").trim();
}

export function domBufferToFullTranscript(buffer: DomCaptionSample[], maxChars: number): string {
  const joined = buffer.map((b) => b.text).join(" ").replace(/\s+/g, " ").trim();
  if (joined.length <= maxChars) return joined;
  return joined.slice(0, maxChars);
}
