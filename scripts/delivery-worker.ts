import { processQueuedDeliveries } from '../lib/activities'
import { log } from '../lib/logger'

const intervalMs = Number(process.env.WORKER_INTERVAL_MS || 5_000)

async function tick() {
  try {
    const processed = await processQueuedDeliveries()
    if (processed > 0) {
      log.info('delivery worker processed jobs', { processed })
    }
  } catch (error) {
    log.error('delivery worker tick failed', {
      message: error instanceof Error ? error.message : 'unknown',
    })
  }
}

async function main() {
  log.info('delivery worker started', { intervalMs })
  await tick()
  setInterval(tick, intervalMs)
}

void main()
