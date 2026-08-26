export const FREE_TIER = {
  maxProjects: 1,
  maxUpdatesPerMonth: 10_000,
  maxActiveActivities: 100,
} as const

export type AccountPlan = 'free' | 'paid'

export function isPaidPlan(plan: AccountPlan | null | undefined): boolean {
  return plan === 'paid'
}

export function activityCreateLimit(plan: AccountPlan | null | undefined): number | undefined {
  return isPaidPlan(plan) ? undefined : FREE_TIER.maxActiveActivities
}

export function currentMonthKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}
