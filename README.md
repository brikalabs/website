# brika.dev

Marketing website for [Brika](https://github.com/brikalabs/brika) — a self-hosted automation hub. Built with Next.js and deployed on Cloudflare Workers via OpenNext.

## Stack

- **[Next.js 16](https://nextjs.org)** — App Router, React Server Components
- **[Tailwind CSS 4](https://tailwindcss.com)** — utility-first styling
- **[OpenNext for Cloudflare](https://opennext.js.org/cloudflare)** — deploys Next.js to Cloudflare Workers
- **[Wrangler](https://developers.cloudflare.com/workers/wrangler/)** — local preview and deployment

## Development

```bash
bun install
bun dev
```

### Preview (Cloudflare Workers runtime)

```bash
bun run preview
```

### Deploy

```bash
bun run deploy
```

Deployment is handled automatically via Cloudflare Pages CI on every push to `main`.
