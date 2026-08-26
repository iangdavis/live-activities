import { execFileSync } from 'node:child_process'
import path from 'node:path'

process.env.AUTH_SECRET ||= 'test-auth-secret-test-auth-secret-32'
process.env.ENCRYPTION_KEY ||= 'aa'.repeat(32)
process.env.APP_URL ||= 'http://localhost:3000'
process.env.CRON_SECRET ||= 'cron-test-secret'
process.env.DATABASE_URL ||=
  process.env.DATABASE_URL || 'postgresql://livehive:livehive@localhost:5432/livehive_test'
process.env.DIRECT_URL ||= process.env.DATABASE_URL

const shouldPrepareDb = process.env.RUN_DB_TESTS === '1' || process.env.CI === 'true'

if (shouldPrepareDb && process.env.LIVEHIVE_DB_PREPARED !== '1') {
  process.env.LIVEHIVE_DB_PREPARED = '1'

  const prismaCli = process.platform === 'win32' ? 'prisma.cmd' : 'prisma'
  const prismaBinDir = path.resolve(process.cwd(), 'node_modules', '.bin')
  const env = { ...process.env, PATH: `${prismaBinDir}${path.delimiter}${process.env.PATH || ''}` }

  execFileSync(prismaCli, ['db', 'push', '--skip-generate'], {
    stdio: 'inherit',
    env,
  })
}
