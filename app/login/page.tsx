import Link from 'next/link'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AuthShell } from '@/components/AuthShell'
import { AuthForm } from '@/components/AuthForm'

export const metadata: Metadata = {
  title: 'Log in',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <AuthShell title="Log in" subtitle="Welcome back.">
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
      <p className="mt-5 text-center text-[14px] text-[var(--color-muted)]">
        No account?{' '}
        <Link href="/signup" className="text-[var(--color-ink)] underline-offset-2 hover:underline">
          Start Free
        </Link>
      </p>
    </AuthShell>
  )
}
