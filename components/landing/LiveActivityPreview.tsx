'use client'

import { useEffect, useState } from 'react'

type ActivityState = {
  status: string
  who: string
  eta: string
  arriveAt: string
  progress: number
  arriving: boolean
}

const STATES: ActivityState[] = [
  {
    status: 'Driver arriving',
    who: 'Sarah is 4 min away',
    eta: '4 min',
    arriveAt: '2:42 PM',
    progress: 0.34,
    arriving: false,
  },
  {
    status: 'Driver arriving',
    who: 'Sarah is 2 min away',
    eta: '2 min',
    arriveAt: '2:41 PM',
    progress: 0.66,
    arriving: false,
  },
  {
    status: 'Arriving now',
    who: 'Sarah is almost here',
    eta: 'Now',
    arriveAt: '2:41 PM',
    progress: 1,
    arriving: true,
  },
]

function CarIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 11l1.5-4.2A2 2 0 0 1 8.4 5.4h7.2a2 2 0 0 1 1.9 1.4L19 11" />
      <path d="M4 11h16v5a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-.5H7.5v.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5Z" />
      <circle cx="7.5" cy="14" r="0.6" />
      <circle cx="16.5" cy="14" r="0.6" />
    </svg>
  )
}

export function LiveActivityPreview() {
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (reduced) return
    const cycle = setInterval(() => {
      // Briefly expand the Dynamic Island on each update, then advance.
      setExpanded(true)
      const collapse = setTimeout(() => setExpanded(false), 1400)
      setIndex((i) => (i + 1) % STATES.length)
      return () => clearTimeout(collapse)
    }, 3200)
    return () => clearInterval(cycle)
  }, [reduced])

  const s = STATES[index]

  return (
    <div className="relative mx-auto w-full max-w-[320px]" aria-hidden="true">
      {/* Soft glow behind the device — faint emerald tie to the live status */}
      <div
        className="pointer-events-none absolute -inset-8 -z-10 opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(50% 40% at 50% 32%, rgba(52,211,153,0.16), transparent 70%)',
        }}
      />

      {/* Device frame */}
      <div
        className="relative overflow-hidden rounded-[46px] border border-white/10 p-3 shadow-2xl"
        style={{
          background:
            'linear-gradient(165deg, #1a1c22 0%, #0d0e12 55%, #0a0b0e 100%)',
          boxShadow:
            '0 40px 80px -30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Screen */}
        <div
          className="relative aspect-[9/19] overflow-hidden rounded-[36px]"
          style={{
            background:
              'linear-gradient(180deg, #101319 0%, #0a0c11 40%, #07080b 100%)',
          }}
        >
          {/* Wallpaper accent */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-70"
            style={{
              background:
                'radial-gradient(80% 60% at 50% -10%, rgba(52,211,153,0.12), transparent 70%)',
            }}
          />

          {/* Dynamic Island */}
          <div className="absolute inset-x-0 top-0 z-20 flex justify-center pt-3">
            <div
              className="flex items-center overflow-hidden bg-black text-white shadow-lg transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                borderRadius: 22,
                height: expanded ? 44 : 34,
                width: expanded ? 210 : 118,
              }}
            >
              <div className="flex w-full items-center gap-2 px-3">
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full"
                  style={{ background: 'rgba(52,211,153,0.16)', color: '#34d399' }}
                >
                  <CarIcon className="h-3.5 w-3.5" />
                </span>
                {expanded ? (
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <span className="truncate text-[11px] font-medium text-white/85">
                      {s.status}
                    </span>
                    <span className="shrink-0 text-[12px] font-semibold tabular-nums text-[#34d399]">
                      {s.eta}
                    </span>
                  </div>
                ) : (
                  <span className="ml-auto text-[12px] font-semibold tabular-nums text-[#34d399]">
                    {s.eta}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Lock screen time */}
          <div className="relative z-10 px-6 pt-16 text-center">
            <div className="text-[13px] font-medium text-white/55">
              Wednesday, Aug 12
            </div>
            <div className="mt-1 text-[64px] font-semibold leading-none tracking-tight text-white">
              2:37
            </div>
          </div>

          {/* Live Activity card */}
          <div className="absolute inset-x-4 bottom-6 z-10">
            <div
              className="rounded-[22px] border border-white/10 p-4 text-left backdrop-blur-xl"
              style={{
                background:
                  'linear-gradient(180deg, rgba(28,30,38,0.92), rgba(18,19,25,0.92))',
                boxShadow: '0 20px 40px -20px rgba(0,0,0,0.7)',
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#34d399]"
                  style={{ background: 'rgba(52,211,153,0.14)' }}
                >
                  <CarIcon />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-[#34d399]"
                      style={{
                        animation: reduced
                          ? undefined
                          : 'livePulse 1.8s ease-in-out infinite',
                      }}
                    />
                    <span className="text-[15px] font-semibold text-white">
                      {s.status}
                    </span>
                  </div>
                  <div
                    key={s.who}
                    className="mt-0.5 text-[13px] text-white/60"
                    style={{
                      animation: reduced ? undefined : 'fadeIn 0.4s ease',
                    }}
                  >
                    {s.who}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div
                    key={s.eta}
                    className="text-[17px] font-semibold tabular-nums text-white"
                    style={{
                      animation: reduced ? undefined : 'fadeIn 0.4s ease',
                    }}
                  >
                    {s.eta}
                  </div>
                  <div className="text-[11px] text-white/45">ETA</div>
                </div>
              </div>

              {/* Progress track */}
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-[width] duration-1000 ease-out"
                  style={{
                    width: `${s.progress * 100}%`,
                    background:
                      'linear-gradient(90deg, #34d399, #6ee7b7)',
                  }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-white/45">
                <span>{s.arriving ? 'Arriving now' : 'On the way'}</span>
                <span className="tabular-nums">Arriving at {s.arriveAt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
