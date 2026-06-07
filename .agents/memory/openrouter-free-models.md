---
name: OpenRouter free model availability
description: Which OpenRouter :free models actually have active endpoints vs returning 404/429
---

# OpenRouter Free Model Reality (tested June 2026)

**Why:** Many model IDs listed on OpenRouter with `:free` suffix return 404 (no providers) or 429 (rate-limited). The available set changes over time.

**How to apply:** Before shipping any OpenRouter integration, live-test each model via `fetch` in bash (using `process.env.EXPO_PUBLIC_OPENROUTER_API_KEY`) against `/api/v1/chat/completions` with `max_tokens: 5`. Only ship models that return 200.

## Confirmed working (June 2026)
- `openai/gpt-oss-120b:free` ✅ 200
- `google/gemma-4-31b-it:free` ✅ 200
- `liquid/lfm-2.5-1.2b-instruct:free` ✅ 200 (tiny, last resort)

## Confirmed broken (June 2026)
- `deepseek/deepseek-r1:free` — 404 no endpoints
- `qwen/qwen3-235b-a22b:free` — 404 (too large, no free provider)
- `mistralai/mistral-7b-instruct:free` — 404 (removed from free tier)
- `meta-llama/llama-3.3-70b-instruct:free` — 429 rate-limited

## Fallback strategy
Always include `liquid/lfm-2.5-1.2b-instruct:free` as hidden last-resort fallback. Skip 404, 429, 503 silently and try next model. Only surface error after all models exhausted.
