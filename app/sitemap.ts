import type { MetadataRoute } from 'next'
import { publicAppUrl } from '@/lib/env'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicAppUrl()
  const paths = [
    '/',
    '/pricing',
    '/llms.txt',
    '/openapi.json',
    '/docs',
    '/docs/for-agents',
    '/docs/getting-started',
    '/docs/authentication',
    '/docs/ios',
    '/docs/activities',
    '/docs/activities/register',
    '/docs/activities/update',
    '/docs/activities/end',
    '/docs/apns',
    '/docs/errors',
    '/guides/live-activity-backend',
    '/guides/activitykit-server',
    '/guides/activitykit-push-notifications',
    '/guides/live-activity-push-token',
    '/guides/live-activity-apns',
    '/guides/update-live-activities-from-a-server',
    '/guides/live-activity-webhook',
    '/guides/activitykit-backend',
  ]
  return paths.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path.startsWith('/docs') || path.startsWith('/guides') || path === '/llms.txt' || path === '/openapi.json' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path === '/llms.txt' || path === '/openapi.json' || path === '/docs/for-agents' ? 0.9 : 0.7,
  }))
}
