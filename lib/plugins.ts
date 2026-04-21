export interface Plugin {
  name: string;
  displayName: string;
  description: string;
  version: string;
  downloads: number;
  verified: boolean;
  iconUrl: string;
}

interface NpmSearchResult {
  objects: {
    package: {
      name: string;
      description: string;
      version: string;
    };
  }[];
}

interface NpmDownloads {
  downloads: number;
}

interface PluginPackageJson {
  displayName?: string;
}

interface PluginLocaleFile {
  name?: string;
  description?: string;
}

interface VerifiedList {
  plugins: {
    name: string;
  }[];
}

import type { Locale } from '@/i18n/routing';
import { npm, registry } from '@/lib/config';

/** Revalidate every 10 minutes */
const REVALIDATE = 600;

const EXCLUDED = new Set(['@brika/plugin-example-echo', '@brika/plugin-demo-config']);

function iconUrl(name: string) {
  return `${npm.unpkgUrl}/${name}/icon.svg`;
}

function fallbackDisplayName(name: string) {
  return name.replace(/^@brika\/(plugin-)?/, '');
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { next: { revalidate: REVALIDATE } });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

export async function fetchPlugins(locale: Locale): Promise<Plugin[]> {
  const [npmRes, registryRes] = await Promise.all([
    fetch(npm.searchUrl, { next: { revalidate: REVALIDATE } }),
    fetch(registry.verifiedPluginsUrl, { next: { revalidate: REVALIDATE } }),
  ]);

  const verified = new Set<string>();
  if (registryRes.ok) {
    const data: VerifiedList = await registryRes.json();
    for (const p of data.plugins) verified.add(p.name);
  }

  if (!npmRes.ok) return [];
  const { objects }: NpmSearchResult = await npmRes.json();

  const packages = objects.map((o) => o.package).filter((p) => !EXCLUDED.has(p.name));

  // Plugin packages publish `locales/<locale>/plugin.json` with translated
  // name + description. Fetch EN always (fallback), plus the request locale
  // when it's not EN. package.json still drives displayName when no locale
  // file exists.
  const [downloadResults, pkgJsonResults, enLocaleResults, localeResults] = await Promise.all([
    Promise.allSettled(
      packages.map((p) =>
        fetch(`${npm.downloadsUrl}/${p.name}`, { next: { revalidate: REVALIDATE } })
          .then((r) => (r.ok ? r.json() : { downloads: 0 }))
          .then((d: NpmDownloads) => d.downloads)
      )
    ),
    Promise.allSettled(
      packages.map((p) => fetchJson<PluginPackageJson>(`${npm.unpkgUrl}/${p.name}/package.json`))
    ),
    Promise.allSettled(
      packages.map((p) => fetchJson<PluginLocaleFile>(`${npm.unpkgUrl}/${p.name}/locales/en/plugin.json`))
    ),
    locale === 'en'
      ? Promise.resolve([] as PromiseSettledResult<PluginLocaleFile | null>[])
      : Promise.allSettled(
          packages.map((p) =>
            fetchJson<PluginLocaleFile>(`${npm.unpkgUrl}/${p.name}/locales/${locale}/plugin.json`)
          )
        ),
  ]);

  const pick = <T,>(r: PromiseSettledResult<T> | undefined): T | null =>
    r?.status === 'fulfilled' ? r.value : null;

  return packages
    .map((p, i) => {
      const pkgJson = pick(pkgJsonResults[i]) ?? {};
      const enLocale = pick(enLocaleResults[i]);
      const localized = locale === 'en' ? null : pick(localeResults[i]);

      // Name precedence: requested locale → EN locale → package.json.displayName → fallback
      const displayName =
        localized?.name ??
        enLocale?.name ??
        pkgJson.displayName ??
        fallbackDisplayName(p.name);

      // Description precedence: requested locale → EN locale → npm description
      const description = localized?.description ?? enLocale?.description ?? p.description;

      return {
        name: p.name,
        displayName,
        description,
        version: p.version,
        downloads: pick(downloadResults[i]) ?? 0,
        verified: verified.has(p.name),
        iconUrl: iconUrl(p.name),
      };
    })
    .sort((a, b) => b.downloads - a.downloads);
}
