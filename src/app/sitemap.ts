import { MetadataRoute } from 'next'
import { i18n } from '@/src/i18n/config'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.tarotai.jp'

  const routes = ['', '/login', '/connect', '/profile'];
  const priorities = { '': 1, '/login': 0.8, '/connect': 0.7, '/profile': 0.5 };
  const frequencies: { [key: string]: 'daily' | 'weekly' | 'monthly' } = {
    '': 'daily',
    '/login': 'monthly',
    '/connect': 'weekly',
    '/profile': 'monthly',
  };

  const sitemap: MetadataRoute.Sitemap = [];

  // Generate sitemap entries for each locale and route
  i18n.locales.forEach((locale) => {
    routes.forEach((route) => {
      sitemap.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: frequencies[route],
        priority: priorities[route as keyof typeof priorities],
        alternates: {
          languages: Object.fromEntries(
            i18n.locales.map((l) => [l, `${baseUrl}/${l}${route}`])
          ),
        },
      });
    });
  });

  return sitemap;
}
