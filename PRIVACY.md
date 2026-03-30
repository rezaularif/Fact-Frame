# FactFrame Privacy Policy

**Effective Date:** March 31, 2026

## Overview

FactFrame is a Chrome extension that fact-checks YouTube captions in real time using web search and LLM-based analysis. This privacy policy explains what data we collect, how we use it, and your rights.

## Data We Collect

### Local Storage Only

All user data is stored **locally** in your browser using `chrome.storage.local`. We do not maintain servers or databases to store your information.

**Stored data includes:**
- API keys for search providers (Tavily, Exa, Perplexity, Brave) — optional, user-provided
- API keys for LLM providers (OpenAI-compatible, Anthropic) — optional, user-provided
- Extension preferences (selected search provider, LLM provider, model name, settings)

### Content Processing

**YouTube Captions**: When you use FactFrame on a YouTube video, the extension extracts caption text from the video you are watching. This caption text is:
- Processed locally in your browser
- Sent to your chosen search provider API using **your** API key
- Sent to your chosen LLM API using **your** API key for fact-checking analysis

**Video Metadata**: The video title may be included in search queries to improve fact-check accuracy.

## How We Use Data

| Data | Purpose | Storage |
|------|---------|---------|
| API Keys | Authenticate with search/LLM services you configure | Local browser storage only |
| Caption Text | Perform web search and LLM analysis for fact-checking | Temporary processing only, not stored |
| Video Title | Improve search query relevance | Temporary processing only, not stored |
| Settings | Remember your preferences | Local browser storage only |

## Data Sharing

**We do not sell, transfer, or share your data with third parties** except:
- Your chosen search provider (Tavily, Exa, Perplexity, or Brave) — only when you explicitly configure that provider with your own API key
- Your chosen LLM provider (OpenAI, Anthropic, or OpenAI-compatible service) — only when you explicitly configure that provider with your own API key

All API calls are made **using your own credentials** to services **you choose and configure**.

## Security

- All API keys are stored locally in your browser's encrypted storage
- API keys are only transmitted to their respective service endpoints over HTTPS
- No data is logged, tracked, or transmitted to any FactFrame-owned servers

## User Rights

You can:
- Clear all stored data by uninstalling the extension
- Revoke API keys at any time from the extension settings
- Choose which search and LLM providers to use (or use none)

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be posted to the GitHub repository with an updated effective date.

## Contact

For privacy concerns or questions, please open an issue on our GitHub repository: https://github.com/rezaularif/Fact-Frame
