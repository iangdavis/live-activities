import type { MetadataRoute } from 'next'
import { publicAppUrl } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  const base = publicAppUrl()
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/llms.txt', '/openapi.json', '/v1/openapi.json'],
        disallow: [
          '/dashboard',
          '/projects',
          '/activities',
          '/logs',
          '/settings',
          '/api-keys',
          '/api/',
          '/login',
          '/signup',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
