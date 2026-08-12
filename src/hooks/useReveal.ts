import { useEffect, useRef, useState } from 'react'

/**
 * Adds a subtle scroll-into-view reveal. Returns a ref to attach to the
 * element and a boolean once it has entered the viewport. Falls back to
 * "visible" immediately when IntersectionObserver is unavailable or the user
 * prefers reduced motion.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px', ...options },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [options])

  return { ref, visible }
}
