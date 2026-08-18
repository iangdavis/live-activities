'use client'

import { useFormStatus } from 'react-dom'
import {
  driveDeliveryDemoAction,
  endActivityAction,
  sendTestUpdateAction,
} from '@/app/(app)/actions'

function Submit({
  children,
  tone = 'primary',
}: {
  children: string
  tone?: 'primary' | 'ghost'
}) {
  const { pending } = useFormStatus()
  const className = tone === 'primary' ? 'btn-primary' : 'btn-ghost'
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? 'Sending…' : children}
    </button>
  )
}

export function ActivityDemoControls({
  activityId,
  ended,
}: {
  activityId: string
  ended: boolean
}) {
  if (ended) {
    const restart = (
      <p className="text-[13px] text-[var(--color-muted)]">
        This activity has ended. Start a new one in the app, then come back.
      </p>
    )
    return restart
  }

  return (
    <div className="flex flex-wrap gap-3">
      <form action={sendTestUpdateAction}>
        <input type="hidden" name="activityId" value={activityId} />
        <Submit>Send test update</Submit>
      </form>
      <form action={driveDeliveryDemoAction}>
        <input type="hidden" name="activityId" value={activityId} />
        <Submit tone="ghost">Drive demo (~8s)</Submit>
      </form>
      <form action={endActivityAction}>
        <input type="hidden" name="activityId" value={activityId} />
        <Submit tone="ghost">End activity</Submit>
      </form>
    </div>
  )
}
