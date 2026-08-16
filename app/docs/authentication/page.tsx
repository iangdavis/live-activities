import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authenticate to the Live Hive API with a hashed project API key.',
  alternates: { canonical: '/docs/authentication' },
}

export default function AuthDocsPage() {
  return (
    <>
      <h1 className="text-[32px]">Authentication</h1>
      <p className="mt-4">
        Every Live Hive API request uses a project secret key in the
        Authorization header.
      </p>
      <pre>
        <code>Authorization: Bearer lh_live_...</code>
      </pre>
      <p>
        Keys are hashed at rest. Live Hive shows the full key only when it is
        created. If you lose it, revoke it and create another.
      </p>
      <h2>Where to get a key</h2>
      <p>
        Dashboard → the project → Create key. The key is scoped to that project.
        It cannot read or update activities that belong to a different project.
      </p>
      <h2>Base URL</h2>
      <p>
        Use <code>https://livehive.dev/api/v1</code>. The same routes are also
        available at <code>https://api.livehive.dev/v1</code> once that hostname
        is pointed at the same deployment.
      </p>
    </>
  )
}
