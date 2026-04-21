import type { MetadataRoute } from 'next';
import { site } from '@/lib/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = {
    en: site.url,
    fr: `${site.url}/fr`,
  };

  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages,
      },
    },
    {
      url: `${site.url}/fr`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages,
      },
    },
  ];
}
