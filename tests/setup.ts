process.env.AUTH_SECRET ||= 'test-auth-secret-test-auth-secret-32'
process.env.ENCRYPTION_KEY ||= 'aa'.repeat(32)
process.env.APP_URL ||= 'http://localhost:3000'
process.env.CRON_SECRET ||= 'cron-test-secret'
process.env.DATABASE_URL ||=
  process.env.DATABASE_URL || 'postgresql://livehive:livehive@localhost:5432/livehive_test'
process.env.DIRECT_URL ||= process.env.DATABASE_URL
