# i18n: English + French

**Date:** 2026-04-21
**Scope:** Translate the entire brika.dev marketing site into English (default) and French, including dynamic content sourced from external systems.

## Goals

- Both languages fully indexable by search engines with proper `hreflang`.
- Keep the current canonical URL `https://brika.dev/` for English (no SEO regression).
- Translate dynamic content (plugin descriptions from npm, GitHub release notes, weather city names) — not only static UI strings.
- Zero-runtime-cost steady state: a given translated string is computed at most once per content change.
- Graceful degradation: if translation infrastructure fails, the page still renders in English rather than breaking.

## Non-goals

- Additional locales beyond `en` and `fr` (design allows easy extension, but this spec ships two).
- Translating code snippets or shell commands (they remain verbatim).
- User-generated content (there is none).
- An in-product translation editor.

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| URL structure | Path prefix, `localePrefix: 'as-needed'` (`/` for en, `/fr` for fr) | Preserves canonical English URL, enables `hreflang`, standard Next.js pattern |
| Detection | No auto-redirect | Google recommends against auto-redirects; manual toggle in nav |
| Library | `next-intl` | Purpose-built for App Router, handles routing + metadata + formatting |
| Message layout | One file per locale, namespaced by component | Small site (~7 sections), keeps translator workflow simple |
| Dynamic content scope | Plugin name/description pulled from the plugin package's shipped `locales/<locale>/plugin.json`. Weather city and release notes left in their source language. | Avoids runtime LLM cost; translations are author-controlled and version-pinned with the plugin |
| Translation backend | None at runtime. Plugin authors ship translations inside their published package. | Zero per-request cost, no extra secrets, no KV |
| Language toggle UI | `EN / FR` pill in Nav, next to theme toggle | Discoverability, sibling to existing toggle |

## Architecture

### Routing

- Move all routes under `app/[locale]/`:
  - `app/[locale]/layout.tsx`
  - `app/[locale]/page.tsx`
  - `app/[locale]/opengraph-image.tsx`
- `middleware.ts` composes the `next-intl` middleware with existing Cloudflare geo-header forwarding. (Next.js 16 introduced `proxy.ts`, but it is locked to the Node.js runtime, which Cloudflare Workers doesn't support — so we keep the `middleware` convention to stay on Edge.)
- `next-intl` config:
  - `locales: ['en', 'fr']`
  - `defaultLocale: 'en'`
  - `localePrefix: 'as-needed'` — English at `/`, French at `/fr`.
  - `localeDetection: false` — no auto-redirect on first visit.
- `app/sitemap.ts` and `app/robots.ts` stay at the app root (non-localized).

### Message files

- `messages/en.json` and `messages/fr.json`.
- Namespaces by component: `Nav`, `Hero`, `QuickStart`, `Features`, `Bricks`, `Plugins`, `OpenSource`, `Footer`, `Metadata`.
- Type augmentation via `next-intl`'s `global.d.ts` pattern so missing keys fail the TypeScript build.

### Dynamic content translation

Plugin packages in the main `brikalabs/brika` monorepo publish a `locales/<locale>/plugin.json` next to their `package.json`. Example:

```
@brika/plugin-spotify/
├── package.json
└── locales/
    ├── en/plugin.json   { "name": "Spotify Connect", "description": "Control Spotify playback…" }
    └── fr/plugin.json   { "name": "Spotify Connect", "description": "Contrôlez la lecture Spotify…" }
```

These files are included in the `files` field of `package.json`, so they're available via `unpkg.com/<pkg>/locales/<locale>/plugin.json`.

`lib/plugins.ts` fetches the locale file per package in parallel, with fallbacks:

- `name`: requested locale → EN locale → `package.json.displayName` → slug.
- `description`: requested locale → EN locale → npm search description.

Packages that don't ship locale files simply render in their default (English) npm metadata — no error.

No runtime LLM call, no KV, no Anthropic secret. The cost of translation is borne once by the plugin author at publish time.

### Integration points for dynamic content

- `lib/plugins.ts` — fetches `locales/<locale>/plugin.json` from unpkg for each plugin (see above).
- `lib/weather.ts` — city name from the Cloudflare geo header is used as-is (it's typically a canonical Latin-script name; translating city names is out of scope).
- `lib/github.ts` — release notes stay in their source language (English).

### Component changes

- `components/nav.tsx` — add `<LocaleToggle />` next to the theme toggle. Uses `next-intl`'s navigation helpers so clicking `FR` pushes `/fr` (and vice versa).
- All components replace hardcoded strings with `useTranslations('Ns')` (client components) or `getTranslations('Ns')` (server components).
- Install commands and code snippets in `QuickStart` remain verbatim.

### SEO

- `generateMetadata` in `[locale]/layout.tsx` returns localized `title`, `description`, `openGraph.locale` (`en_US` / `fr_FR`), and `alternates.languages` with absolute URLs:
  - `en` → `https://brika.dev/`
  - `fr` → `https://brika.dev/fr`
  - `x-default` → `https://brika.dev/`
- `<html lang={locale}>` set from the route segment.
- JSON-LD `description` localized.
- `app/sitemap.ts` emits one entry per locale with `alternates.languages` populated.
- `opengraph-image.tsx` renders per locale (the tagline / description overlay is translated).

## Error handling

- **Plugin locale file missing** (third-party plugin with no `locales/` dir, or a locale the author hasn't translated): fall back to the EN locale file, then to `package.json.displayName` + npm description.
- **unpkg fetch failure** (5xx, timeout): `Promise.allSettled` catches it; that plugin renders with the English fallback chain described above.
- **Missing translation key** (static strings): TypeScript build fails at compile time thanks to type augmentation.
- **Invalid `locale` param in URL**: `next-intl` middleware handles this (404 or redirect to default).

## Testing

- `bun dev`: manually toggle `/` ↔ `/fr`, verify all strings translated, verify dynamic content (plugins, release notes, weather city) shows in French.
- `curl -H 'Accept-Language: fr'` against `/`: confirm no redirect (we stay on `/` in English).
- View source on `/` and `/fr`: confirm `hreflang` alternate tags, correct `<html lang>`, correct OG `locale`.
- `bun run preview` (Cloudflare Workers runtime): confirm plugin cards on `/fr` pull FR `name` + `description` from unpkg for plugins that ship FR locale files, and fall back to EN for plugins that don't.

## Rollout order (seed for the implementation plan)

1. Install `next-intl`. Scaffold `[locale]` routing. Point both locales at the English JSON temporarily so the build stays green.
2. Extract all UI strings into `messages/en.json`. Swap components to `useTranslations` / `getTranslations`.
3. Extend `lib/plugins.ts` to fetch `locales/<locale>/plugin.json` from unpkg per plugin, with EN and `package.json` fallbacks.
4. Produce `messages/fr.json` for static UI strings — hand-reviewed (small surface).
5. Add `LocaleToggle` to `Nav`. Update `app/sitemap.ts`, `generateMetadata`, JSON-LD, and `opengraph-image.tsx` for both locales.
6. Deploy preview, check `hreflang` and OG tags in view-source, then promote.

## Open questions

None blocking. Anything that surfaces during implementation (e.g., exact Haiku model ID, system-prompt tuning for specific strings, whether to add a `x-default` fallback for sitemap) is tactical and handled in the plan.
