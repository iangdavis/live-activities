import type { MetadataRoute } from 'next'
import { publicAppUrl } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  const base = publicAppUrl()
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/login', '/signup'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
