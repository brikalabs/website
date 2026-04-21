import Anthropic from '@anthropic-ai/sdk';
import { getCloudflareContext } from '@opennextjs/cloudflare';

import type { Locale } from '@/i18n/routing';

/**
 * Translate a batch of strings from English to the target locale.
 *
 * Pipeline:
 * 1. Short-circuit for English / empty input.
 * 2. Parallel KV lookup keyed on `${sha256(text)[:16]}:${locale}`.
 * 3. For misses, call Anthropic Claude Haiku with a concurrency cap of 5.
 * 4. Write new translations back to KV (natural invalidation via content hash).
 *
 * Contract:
 * - Returns an array the same length as `texts`, in the same order.
 * - Never throws. On any failure, the corresponding input is returned as-is.
 */
export async function translateBatch(texts: string[], locale: Locale): Promise<string[]> {
  if (locale === 'en' || texts.length === 0) return texts;

  // Request-level memoization: if the same (text, locale) pair appears twice,
  // reuse the first resolution.
  const memo = getRequestMemo(locale);
  const indicesPerText = new Map<string, number[]>();
  for (let i = 0; i < texts.length; i++) {
    const t = texts[i];
    const existing = indicesPerText.get(t);
    if (existing) {
      existing.push(i);
    } else {
      indicesPerText.set(t, [i]);
    }
  }
  const uniqueTexts = Array.from(indicesPerText.keys());

  // Resolve unique texts — result is the translated (or fallback) string.
  const resolved = await Promise.all(
    uniqueTexts.map(async (t) => {
      const cached = memo.get(t);
      if (cached) return cached;
      const p = translateOne(t, locale);
      memo.set(t, p);
      return p;
    })
  );

  const out = new Array<string>(texts.length);
  for (let i = 0; i < uniqueTexts.length; i++) {
    const value = resolved[i];
    const idxs = indicesPerText.get(uniqueTexts[i]) ?? [];
    for (const idx of idxs) out[idx] = value;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const TARGET_LANGUAGE_NAMES: Record<Exclude<Locale, 'en'>, string> = {
  fr: 'French',
};

// Per-request memoization. Map<locale, Map<text, Promise<string>>>.
// Keyed off globalThis so it survives across modules inside one request but
// stays isolated per worker invocation.
type Memo = Map<string, Promise<string>>;
type MemoRoot = Map<Locale, Memo>;

function getRequestMemo(locale: Locale): Memo {
  const g = globalThis as unknown as { __translateMemo?: MemoRoot };
  if (!g.__translateMemo) g.__translateMemo = new Map();
  let m = g.__translateMemo.get(locale);
  if (!m) {
    m = new Map();
    g.__translateMemo.set(locale, m);
  }
  return m;
}

let warnedMissingKey = false;

/** Resolve a single text. Always returns something (never throws). */
async function translateOne(text: string, locale: Locale): Promise<string> {
  // Skip empty / whitespace-only strings — nothing to translate.
  if (!text || !text.trim()) return text;

  let env: CloudflareEnv | undefined;
  try {
    env = getCloudflareContext().env;
  } catch (err) {
    console.warn('[translate] Cloudflare context unavailable:', err);
    return text;
  }

  const kv = env.I18N_CACHE;
  const apiKey = env.ANTHROPIC_API_KEY;

  // Compute cache key.
  let key: string | null = null;
  try {
    const hash = await sha256Hex(text);
    key = `${hash.slice(0, 16)}:${locale}`;
  } catch (err) {
    console.warn('[translate] hashing failed, skipping cache:', err);
  }

  // Try cache.
  if (kv && key) {
    try {
      const cached = await kv.get(key);
      if (cached !== null && cached !== undefined) return cached;
    } catch (err) {
      console.warn('[translate] KV read failed:', err);
    }
  }

  // Miss — call Anthropic.
  if (!apiKey) {
    if (!warnedMissingKey) {
      warnedMissingKey = true;
      console.warn(
        '[translate] ANTHROPIC_API_KEY missing — returning English text. Set the secret to enable translation.'
      );
    }
    return text;
  }

  const translated = await withConcurrency(() => callAnthropic(text, locale, apiKey));
  if (translated === null) return text;

  // Write-through to KV. Failures are non-fatal.
  if (kv && key) {
    try {
      await kv.put(key, translated);
    } catch (err) {
      console.warn('[translate] KV write failed:', err);
    }
  }

  return translated;
}

async function callAnthropic(text: string, locale: Locale, apiKey: string): Promise<string | null> {
  const targetLanguage =
    locale === 'en'
      ? 'English'
      : (TARGET_LANGUAGE_NAMES[locale as Exclude<Locale, 'en'>] ?? locale);

  const system =
    `You are translating short UI strings for a developer-tools marketing site ` +
    `from English to ${targetLanguage}. Preserve: brand names (Brika, npm, Docker, ` +
    `GitHub), technical terms that developers expect untranslated (self-hosted, ` +
    `plugin, workflow, webhook, TypeScript, SDK), and any code identifiers. ` +
    `Respond with only the translated string, no quotes, no commentary.`;

  // Rough heuristic: ~1 token per 4 chars. Double that, floor 128, cap 2048.
  const maxTokens = Math.min(2048, Math.max(128, Math.ceil((text.length / 4) * 2)));

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      temperature: 0,
      system,
      messages: [{ role: 'user', content: text }],
    });

    const out = response.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('')
      .trim();

    if (!out) return null;
    return out;
  } catch (err) {
    console.warn('[translate] Anthropic call failed:', err);
    return null;
  }
}

/**
 * Web Crypto SHA-256 → lowercase hex. Available in Cloudflare Workers and
 * modern Node (via `globalThis.crypto`).
 */
async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  const bytes = new Uint8Array(digest);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

// ---------------------------------------------------------------------------
// Concurrency limiter (pLimit-style, inline — no deps).
// ---------------------------------------------------------------------------

const CONCURRENCY = 5;
let active = 0;
const queue: Array<() => void> = [];

function withConcurrency<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const run = () => {
      active++;
      fn()
        .then(resolve, reject)
        .finally(() => {
          active--;
          const next = queue.shift();
          if (next) next();
        });
    };
    if (active < CONCURRENCY) {
      run();
    } else {
      queue.push(run);
    }
  });
}
