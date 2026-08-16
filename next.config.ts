import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: '/dashboard/projects',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/dashboard/projects/:projectId*',
        destination: '/projects/:projectId*',
        permanent: true,
      },
      {
        source: '/dashboard/activities',
        destination: '/activities',
        permanent: true,
      },
      {
        source: '/dashboard/activities/:activityId*',
        destination: '/activities/:activityId*',
        permanent: true,
      },
      {
        source: '/dashboard/logs',
        destination: '/logs',
        permanent: true,
      },
      {
        source: '/dashboard/settings',
        destination: '/settings',
        permanent: true,
      },
      {
        source: '/dashboard/api-keys',
        destination: '/api-keys',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      // api.livehive.dev/v1/... and livehive.dev/v1/... both hit the versioned API.
      { source: '/v1/:path*', destination: '/api/v1/:path*' },
    ]
  },
  async headers() {
    return [
      {
        source: '/api/v1/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Authorization, Content-Type',
          },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
      {
        source: '/v1/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Authorization, Content-Type',
          },
        ],
      },
    ]
  },
}

export default nextConfig
