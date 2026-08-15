import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-[32px]">Page not found</h1>
      <p className="mt-3 text-[var(--color-muted)]">That route does not exist.</p>
      <Link href="/" className="btn-primary mt-6">
        Home
      </Link>
    </div>
  )
}
