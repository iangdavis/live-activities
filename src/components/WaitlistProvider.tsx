import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { WaitlistContext } from './waitlist-context'
import { WaitlistModal } from './WaitlistModal'

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const open = useCallback(() => {
    setShowSuccess(false)
    setIsOpen(true)
  }, [])
  const close = useCallback(() => {
    setIsOpen(false)
    setShowSuccess(false)
  }, [])

  // If we returned from the FormSubmit redirect, open the modal in its success
  // state and clean the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('waitlist') === 'success') {
      setShowSuccess(true)
      setIsOpen(true)
      params.delete('waitlist')
      const query = params.toString()
      const url =
        window.location.pathname +
        (query ? `?${query}` : '') +
        window.location.hash
      window.history.replaceState({}, '', url)
    }
  }, [])

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
      <WaitlistModal isOpen={isOpen} onClose={close} initialSuccess={showSuccess} />
    </WaitlistContext.Provider>
  )
}
