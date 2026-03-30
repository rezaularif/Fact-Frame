# FactFrame (Chrome extension)

**FactFrame** is built with **[WXT](https://wxt.dev/)** (Manifest V3, Vite-powered).

While you watch a video on YouTube, FactFrame shows a **right-hand panel** that loads **captions** (when available), periodically takes a **rolling window** of recent caption text, runs **web search** (your choice of provider), and asks your **OpenAI-compatible LLM** to return structured **fact-check verdicts** with source URLs.

## Privacy and keys

- API keys are stored only in **`chrome.storage.local`** on your machine. They are not sent anywhere except to the providers you configure (search API and your LLM endpoint).
- **Search providers**: Tavily, Exa, Perplexity, and Brave each have **their own storage key** (`tavilyApiKey`, `exaApiKey`, `perplexityApiKey`, `braveApiKey`). You can save all of them; switching **Search provider** only changes which key is used for requests, not which values are kept locally.
- **LLM providers**: **OpenAI-compatible** and **Anthropic** use **separate** API keys (`llmOpenAiKey` and `llmAnthropicKey`). You can save both; switching **LLM provider** only changes which key is used for chat requests.
- The extension needs broad **`https://*/*`** host permission so you can point the LLM base URL at OpenAI, Groq, OpenRouter, DeepSeek, or another HTTPS API.

## Install (development)

1. **Build**

   ```bash
   npm install
   npm run build
   ```

2. **Load in Chrome**

   - Open `chrome://extensions`
   - Enable **Developer mode**
   - Click **Load unpacked**
   - Select the **`dist/chrome-mv3`** folder inside this project (the build output).

3. **Configure**

   - Open any `https://www.youtube.com/watch?v=…` page.
   - Click **Settings** in the panel and enter:
     - **Search provider**: **Tavily**, **Exa**, **Perplexity Search**, or **Brave Search**
     - The matching **API key** (or Brave **subscription token**) for that provider:
       - [Tavily](https://www.tavily.com/)
       - [Exa](https://exa.ai/) (dashboard API key)
       - [Perplexity](https://www.perplexity.ai/) (API key with Search API access)
       - [Brave Search API](https://api-dashboard.search.brave.com/) (subscription token)
     - **LLM provider**: OpenAI-compatible (`/chat/completions`) or **Anthropic** (`/v1/messages`)
     - **OpenAI-compatible base URL** and **API key** when that provider is selected (saved separately from Anthropic)
     - **Anthropic base URL** and **API key** when Anthropic is selected (saved separately from OpenAI-compatible)
     - **Model name**
   - Optional: **Two-stage pipeline** (LLM extracts 1–3 search queries, then search per query, merged).
   - Optional: **Include full transcript in LLM prompt** (search stays scoped to the rolling caption window).
   - Adjust **check interval** and **caption window** to control cost and how much caption text is included per check.

4. **Use**

   - Play the video. If captions exist, the panel loads them and runs checks while playback continues (not while paused).

## Rebuild after changes

```bash
npm run build
```

Then reload the extension on `chrome://extensions`.

## Development (WXT)

- **`npm run dev`** — dev mode with reload (see [WXT browser startup](https://wxt.dev/guide/essentials/config/browser-startup)).
- **`npm run zip`** — produce a zip for store upload.

## How it works

1. **Captions**: Lists tracks via YouTube’s timedtext API and downloads **json3**, parsed into timed segments.
2. **Window**: Builds text from segments overlapping roughly the last *N* seconds before the current playhead.
3. **Search**: Uses the selected provider (Tavily `fast`, Exa `fast` with highlights, Perplexity Search, or Brave Web Search). Either a single query from the caption window, or (if two-stage is on) 1–3 LLM-extracted queries with merged, deduped results.
4. **LLM**: Sends the caption window (and optionally the full transcript for context) plus search snippets to **OpenAI-compatible** `/chat/completions` or **Anthropic** `/v1/messages`, and expects JSON `{ verdicts: [...] }`.

## Limitations

- Videos **without** captions show a clear empty state; no fact-check runs.
- Results are **assistive**; models and search can be wrong—verify important claims yourself.
