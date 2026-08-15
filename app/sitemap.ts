import type { MetadataRoute } from 'next'
import { publicAppUrl } from '@/lib/env'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicAppUrl()
  const paths = [
    '/',
    '/pricing',
    '/docs',
    '/docs/getting-started',
    '/docs/authentication',
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
    changeFrequency: path.startsWith('/docs') || path.startsWith('/guides') ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }))
}
