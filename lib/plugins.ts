import type { Locale } from '@/i18n/routing';
import { excludedPlugins, npm, registry } from '@/lib/config';

export interface Plugin {
  name: string;
  displayName: string;
  description: string;
  version: string;
  downloads: number;
  verified: boolean;
  iconUrl: string;
}

interface NpmSearchPackage {
  name: string;
  description: string;
  version: string;
}

interface NpmSearchResult {
  objects: { package: NpmSearchPackage }[];
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
  plugins: { name: string }[];
}

/** Revalidate every 10 minutes */
const REVALIDATE = 600;

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchPlugins(locale: Locale): Promise<Plugin[]> {
  const [search, verifiedList] = await Promise.all([
    fetchJson<NpmSearchResult>(npm.searchUrl),
    fetchJson<VerifiedList>(registry.verifiedPluginsUrl),
  ]);

  if (!search) {
    return [];
  }

  const verified = new Set(verifiedList?.plugins.map((p) => p.name) ?? []);

  const packages = search.objects.map((o) => o.package).filter((p) => !excludedPlugins.has(p.name));

  const localeFile = (name: string, loc: Locale) =>
    fetchJson<PluginLocaleFile>(`${npm.unpkgUrl}/${name}/locales/${loc}/plugin.json`);

  const [downloads, pkgJsons, enLocales, localized] = await Promise.all([
    Promise.all(
      packages.map((p) =>
        fetchJson<NpmDownloads>(`${npm.downloadsUrl}/${p.name}`).then((d) => d?.downloads ?? 0)
      )
    ),
    Promise.all(
      packages.map((p) => fetchJson<PluginPackageJson>(`${npm.unpkgUrl}/${p.name}/package.json`))
    ),
    Promise.all(packages.map((p) => localeFile(p.name, 'en'))),
    locale === 'en' ? null : Promise.all(packages.map((p) => localeFile(p.name, locale))),
  ]);

  return packages
    .map((p, i) => ({
      name: p.name,
      displayName:
        localized?.[i]?.name ??
        enLocales[i]?.name ??
        pkgJsons[i]?.displayName ??
        p.name.replace(/^@brika\/(plugin-)?/, ''),
      description: localized?.[i]?.description ?? enLocales[i]?.description ?? p.description,
      version: p.version,
      downloads: downloads[i],
      verified: verified.has(p.name),
      iconUrl: `${npm.unpkgUrl}/${p.name}/icon.svg`,
    }))
    .sort((a, b) => b.downloads - a.downloads);

  if (locale === 'en') return plugins;

  // Translate displayName + description for each plugin in a single batch.
  const texts: string[] = [];
  for (const p of plugins) {
    texts.push(p.displayName, p.description);
  }
  const translated = await translateBatch(texts, locale);
  return plugins.map((p, i) => ({
    ...p,
    displayName: translated[i * 2] ?? p.displayName,
    description: translated[i * 2 + 1] ?? p.description,
  }));
}
