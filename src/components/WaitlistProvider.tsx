import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { WaitlistContext } from './waitlist-context'
import { WaitlistModal } from './WaitlistModal'

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  // Lock body scroll while the modal is open.
  useEffect(() => {
    if (!isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [isOpen])

  return (
    <WaitlistContext.Provider value={{ open, close, isOpen }}>
      {children}
      <WaitlistModal isOpen={isOpen} onClose={close} />
    </WaitlistContext.Provider>
  )
}
