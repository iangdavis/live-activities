'use client'

import { useState } from 'react'
import { Reveal } from './Reveal'

const c = {
  kw: '#c792ea',
  fn: '#82aaff',
  id: '#e6edf3',
  prop: '#79c0ff',
  str: '#8ddb8c',
  varv: '#ffcb8b',
  punc: '#8b949e',
}

type Tab = 'ios' | 'http'

const TABS: { id: Tab; label: string; file: string }[] = [
  { id: 'ios', label: 'iOS SDK', file: 'App.swift' },
  { id: 'http', label: 'HTTP', file: 'POST /v1/activities/:id/update' },
]

function IosSnippet() {
  return (
    <code>
      <span style={{ color: c.kw }}>import</span>
      {' ActivityKit\n'}
      <span style={{ color: c.kw }}>import</span>
      {' LiveHive\n\n'}
      <span style={{ color: c.fn }}>LiveHive</span>
      <span style={{ color: c.punc }}>.</span>
      <span style={{ color: c.fn }}>configure</span>
      <span style={{ color: c.punc }}>(</span>
      {'publicKey: '}
      <span style={{ color: c.str }}>&quot;lh_pub_...&quot;</span>
      <span style={{ color: c.punc }}>)</span>
      {'\n\n'}
      <span style={{ color: c.kw }}>let</span>
      {' activity = '}
      <span style={{ color: c.kw }}>try</span>
      {' '}
      <span style={{ color: c.fn }}>Activity</span>
      <span style={{ color: c.punc }}>.</span>
      <span style={{ color: c.fn }}>request</span>
      <span style={{ color: c.punc }}>(</span>
      {'\n  attributes: '}
      <span style={{ color: c.fn }}>DeliveryAttributes</span>
      <span style={{ color: c.punc }}>(),</span>
      {'\n  content: '}
      <span style={{ color: c.punc }}>.</span>
      <span style={{ color: c.fn }}>init</span>
      <span style={{ color: c.punc }}>(</span>
      {'state: '}
      <span style={{ color: c.punc }}>.</span>
      <span style={{ color: c.fn }}>init</span>
      <span style={{ color: c.punc }}>(</span>
      {'status: '}
      <span style={{ color: c.str }}>&quot;preparing&quot;</span>
      {', eta: 12'}
      <span style={{ color: c.punc }}>)),</span>
      {'\n  pushType: '}
      <span style={{ color: c.punc }}>.</span>
      {'token\n'}
      <span style={{ color: c.punc }}>)</span>
      {'\n\n'}
      <span style={{ color: c.fn }}>LiveHive</span>
      <span style={{ color: c.punc }}>.</span>
      <span style={{ color: c.fn }}>register</span>
      <span style={{ color: c.punc }}>(</span>
      {'activity'}
      <span style={{ color: c.punc }}>)</span>
    </code>
  )
}

function HttpSnippet() {
  return (
    <code>
      <span style={{ color: c.fn }}>curl</span>
      {' -X POST https://api.livehive.dev/v1/activities/'}
      <span style={{ color: c.varv }}>abc123</span>
      {'/update \\\n'}
      {'  -H "Authorization: Bearer '}
      <span style={{ color: c.str }}>lh_live_...</span>
      {'" \\\n'}
      {'  -H "Content-Type: application/json" \\\n'}
      {'  -d \''}
      <span style={{ color: c.punc }}>{'{'}</span>
      {'\n    '}
      <span style={{ color: c.prop }}>&quot;content_state&quot;</span>
      <span style={{ color: c.punc }}>: {'{'}</span>
      {'\n      '}
      <span style={{ color: c.prop }}>&quot;status&quot;</span>
      <span style={{ color: c.punc }}>:</span>{' '}
      <span style={{ color: c.str }}>&quot;driver_arriving&quot;</span>
      <span style={{ color: c.punc }}>,</span>
      {'\n      '}
      <span style={{ color: c.prop }}>&quot;eta&quot;</span>
      <span style={{ color: c.punc }}>:</span> 4{'\n    '}
      <span style={{ color: c.punc }}>{'}'}</span>
      {'\n  '}
      <span style={{ color: c.punc }}>{'}'}</span>
      {"'"}
    </code>
  )
}

function CodeBlock() {
  const [tab, setTab] = useState<Tab>('ios')
  const active = TABS.find((item) => item.id === tab) ?? TABS[0]

  return (
    <div
      className="surface-card overflow-hidden"
      style={{ background: 'var(--color-surface-2)' }}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--color-line)] px-4 py-2.5">
        <span className="hidden h-3 w-3 rounded-full bg-white/12 sm:inline-block" />
        <span className="hidden h-3 w-3 rounded-full bg-white/12 sm:inline-block" />
        <span className="hidden h-3 w-3 rounded-full bg-white/12 sm:inline-block" />
        <div
          role="tablist"
          aria-label="iOS SDK and HTTP snippets"
          className="flex min-w-0 flex-1 items-center gap-1 sm:ml-3"
        >
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-md px-2.5 py-1 font-mono text-[12px] transition-colors ${
                tab === item.id
                  ? 'bg-white/[0.08] text-[var(--color-ink)]'
                  : 'text-[var(--color-faint)] hover:text-[var(--color-ink-soft)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <span className="hidden font-mono text-[12px] text-[var(--color-faint)] md:inline">
          {active.file}
        </span>
      </div>

      <pre
        role="tabpanel"
        className="overflow-x-auto p-5 font-mono text-[13.5px] leading-[1.7] sm:text-[14.5px]"
      >
        {tab === 'ios' && <IosSnippet />}
        {tab === 'http' && <HttpSnippet />}
      </pre>
    </div>
  )
}

const LIFECYCLE = ['START', 'REGISTER', 'UPDATE', 'END'] as const

function Lifecycle() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {LIFECYCLE.map((step, i) => (
        <div key={i} className="flex items-center gap-2 sm:gap-3">
          <span
            className={`rounded-lg border px-3 py-2 font-mono text-[12px] font-medium tracking-wide sm:text-[13px] ${
              step === 'END'
                ? 'border-white/10 bg-white/[0.02] text-[var(--color-muted)]'
                : 'border-[color:var(--color-accent)]/25 bg-[color:var(--color-accent)]/10 text-[var(--color-accent-soft)]'
            }`}
          >
            {step}
          </span>
          {i < LIFECYCLE.length - 1 && (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-faint)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}

export function ApiExample() {
  return (
    <section id="sdk" className="container-page py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <h2 className="text-[28px] leading-tight sm:text-[36px]">
            iOS SDK. HTTP from your backend.
          </h2>
        </Reveal>
      </div>

      <Reveal delay={80} className="mx-auto mt-10 max-w-2xl">
        <CodeBlock />
        <p className="mt-5 text-center text-[16px] text-[var(--color-ink-soft)]">
          The iOS SDK registers the token.{' '}
          <span className="text-[var(--color-muted)]">
            Your server POSTs updates and ends the activity.
          </span>
        </p>
        <p className="mt-2 text-center text-[13px] text-[var(--color-faint)]">
          <a href="/llms.txt" className="underline-offset-2 hover:underline">
            llms.txt
          </a>
          {' · '}
          <a href="/openapi.json" className="underline-offset-2 hover:underline">
            OpenAPI
          </a>
        </p>
      </Reveal>

      <Reveal delay={140} className="mt-12">
        <Lifecycle />
      </Reveal>
    </section>
  )
}
