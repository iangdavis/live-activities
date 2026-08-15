export const FREE_TIER = {
  maxProjects: 1,
  maxUpdatesPerMonth: 10_000,
  maxActiveActivities: 1_000,
} as const

export function currentMonthKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}
