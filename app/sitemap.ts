import type { MetadataRoute } from 'next';

const BASE = 'https://cuentik-crm-pehx.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/como-funciona`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/precios`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/nosotros`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contacto`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
