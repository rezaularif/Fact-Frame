import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  outDir: "dist",
  manifest: {
    name: "FactFrame - Fact-Check YouTube Captions",
    version: "0.1.0",
    description:
      "FactFrame — fact-check YouTube captions in real time using web search (Tavily, Exa, Perplexity, or Brave) and your LLM.",
    permissions: ["storage"],
    host_permissions: [
      "https://*/*",
    ],
    icons: {
      16: "extension-icon-16.png",
      32: "extension-icon-32.png",
      48: "extension-icon-48.png",
      128: "extension-icon-128.png",
    },
    action: {
      default_title: "FactFrame",
      default_icon: {
        16: "extension-icon-16.png",
        32: "extension-icon-32.png",
        48: "extension-icon-48.png",
        128: "extension-icon-128.png",
      },
    },
  },
});
