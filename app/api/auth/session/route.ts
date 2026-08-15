import { getSession } from '@/lib/session'
import { jsonOk } from '@/lib/errors'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return jsonOk({ user: null })
  }
  return jsonOk({
    user: {
      email: session.email,
      name: session.name,
    },
  })
}
