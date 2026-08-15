import Link from 'next/link'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AuthShell } from '@/components/AuthShell'
import { AuthForm } from '@/components/AuthForm'

export const metadata: Metadata = {
  title: 'Create account',
  robots: { index: false, follow: false },
}

export default function SignupPage() {
  return (
    <AuthShell
      title="Start Free"
      subtitle="Create an account and send your first Live Activity update."
    >
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
      <p className="mt-5 text-center text-[14px] text-[var(--color-muted)]">
        Already have an account?{' '}
        <Link href="/login" className="text-[var(--color-ink)] underline-offset-2 hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  )
}
