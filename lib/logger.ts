type LogFields = Record<string, unknown>

const SENSITIVE_KEY =
  /(api[_-]?key|authorization|password|secret|token|private[_-]?key|apns[_-]?key|p8|credential)/i

function redactValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEY.test(key)) return '[redacted]'
  if (typeof value === 'string' && value.startsWith('lh_live_')) return '[redacted]'
  if (typeof value === 'string' && value.includes('BEGIN PRIVATE KEY')) {
    return '[redacted]'
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return sanitize(value as LogFields)
  }
  return value
}

function sanitize(fields?: LogFields): LogFields | undefined {
  if (!fields) return undefined
  const out: LogFields = {}
  for (const [key, value] of Object.entries(fields)) {
    out[key] = redactValue(key, value)
  }
  return out
}

function write(level: string, message: string, fields?: LogFields) {
  const line = {
    level,
    msg: message,
    time: new Date().toISOString(),
    ...sanitize(fields),
  }
  const encoded = JSON.stringify(line)
  if (level === 'error') {
    console.error(encoded)
  } else if (level === 'warn') {
    console.warn(encoded)
  } else {
    console.log(encoded)
  }
}

export const log = {
  info: (message: string, fields?: LogFields) => write('info', message, fields),
  warn: (message: string, fields?: LogFields) => write('warn', message, fields),
  error: (message: string, fields?: LogFields) => write('error', message, fields),
}
