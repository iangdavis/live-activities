'use client'

import { EVENTS, type AnalyticsEventName } from '@/lib/analytics'
import { useEffect } from 'react'

export function TrackPage({
  name,
  path,
}: {
  name: AnalyticsEventName
  path: string
}) {
  useEffect(() => {
    void fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, path }),
    })
  }, [name, path])
  return null
}

export function TrackDocs({ path }: { path: string }) {
  return <TrackPage name={EVENTS.DOCUMENTATION_VIEWED} path={path} />
}
