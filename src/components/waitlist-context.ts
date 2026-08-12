import { createContext, useContext } from 'react'

type WaitlistContextValue = {
  open: () => void
  close: () => void
  isOpen: boolean
}

export const WaitlistContext = createContext<WaitlistContextValue | null>(null)

export function useWaitlist() {
  const ctx = useContext(WaitlistContext)
  if (!ctx) {
    throw new Error('useWaitlist must be used within a WaitlistProvider')
  }
  return ctx
}
