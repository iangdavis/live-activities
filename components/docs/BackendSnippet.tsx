'use client'

import { useEffect, useState } from 'react'

export type BackendExample = 'both' | 'update' | 'end'

type Lang = 'node' | 'python' | 'go' | 'ruby'

const SNIPPETS: Record<
  Lang,
  { label: string; both: string; update: string; end: string }
> = {
  node: {
    label: 'Node.js',
    both: `const KEY = process.env.LIVEHIVE_API_KEY // lh_live_...

await fetch("https://www.livehive.dev/v1/activities/abc123/update", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    content_state: { status: "driver_arriving", eta: 4 },
  }),
})

await fetch("https://www.livehive.dev/v1/activities/abc123/end", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    content_state: { status: "delivered", eta: 0 },
  }),
})`,
    update: `const KEY = process.env.LIVEHIVE_API_KEY // lh_live_...

await fetch("https://www.livehive.dev/v1/activities/abc123/update", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    content_state: { status: "driver_arriving", eta: 4 },
  }),
})`,
    end: `const KEY = process.env.LIVEHIVE_API_KEY // lh_live_...

await fetch("https://www.livehive.dev/v1/activities/abc123/end", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    content_state: { status: "delivered", eta: 0 },
  }),
})`,
  },
  python: {
    label: 'Python',
    both: `import json
import os
import urllib.request

KEY = os.environ["LIVEHIVE_API_KEY"]  # lh_live_...
HEADERS = {
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json",
}

req = urllib.request.Request(
    "https://www.livehive.dev/v1/activities/abc123/update",
    data=json.dumps({"content_state": {"status": "driver_arriving", "eta": 4}}).encode(),
    headers=HEADERS,
    method="POST",
)
urllib.request.urlopen(req)

req = urllib.request.Request(
    "https://www.livehive.dev/v1/activities/abc123/end",
    data=json.dumps({"content_state": {"status": "delivered", "eta": 0}}).encode(),
    headers=HEADERS,
    method="POST",
)
urllib.request.urlopen(req)`,
    update: `import json
import os
import urllib.request

KEY = os.environ["LIVEHIVE_API_KEY"]  # lh_live_...
req = urllib.request.Request(
    "https://www.livehive.dev/v1/activities/abc123/update",
    data=json.dumps({"content_state": {"status": "driver_arriving", "eta": 4}}).encode(),
    headers={
        "Authorization": f"Bearer {KEY}",
        "Content-Type": "application/json",
    },
    method="POST",
)
urllib.request.urlopen(req)`,
    end: `import json
import os
import urllib.request

KEY = os.environ["LIVEHIVE_API_KEY"]  # lh_live_...
req = urllib.request.Request(
    "https://www.livehive.dev/v1/activities/abc123/end",
    data=json.dumps({"content_state": {"status": "delivered", "eta": 0}}).encode(),
    headers={
        "Authorization": f"Bearer {KEY}",
        "Content-Type": "application/json",
    },
    method="POST",
)
urllib.request.urlopen(req)`,
  },
  go: {
    label: 'Go',
    both: `import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"
)

raw, _ := json.Marshal(map[string]any{
	"content_state": map[string]any{"status": "driver_arriving", "eta": 4},
})
req, _ := http.NewRequest(
	http.MethodPost,
	"https://www.livehive.dev/v1/activities/abc123/update",
	bytes.NewReader(raw),
)
req.Header.Set("Authorization", "Bearer "+os.Getenv("LIVEHIVE_API_KEY"))
req.Header.Set("Content-Type", "application/json")
http.DefaultClient.Do(req)

raw, _ = json.Marshal(map[string]any{
	"content_state": map[string]any{"status": "delivered", "eta": 0},
})
req, _ = http.NewRequest(
	http.MethodPost,
	"https://www.livehive.dev/v1/activities/abc123/end",
	bytes.NewReader(raw),
)
req.Header.Set("Authorization", "Bearer "+os.Getenv("LIVEHIVE_API_KEY"))
req.Header.Set("Content-Type", "application/json")
http.DefaultClient.Do(req)`,
    update: `import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"
)

raw, _ := json.Marshal(map[string]any{
	"content_state": map[string]any{"status": "driver_arriving", "eta": 4},
})
req, _ := http.NewRequest(
	http.MethodPost,
	"https://www.livehive.dev/v1/activities/abc123/update",
	bytes.NewReader(raw),
)
req.Header.Set("Authorization", "Bearer "+os.Getenv("LIVEHIVE_API_KEY"))
req.Header.Set("Content-Type", "application/json")
http.DefaultClient.Do(req)`,
    end: `import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"
)

raw, _ := json.Marshal(map[string]any{
	"content_state": map[string]any{"status": "delivered", "eta": 0},
})
req, _ := http.NewRequest(
	http.MethodPost,
	"https://www.livehive.dev/v1/activities/abc123/end",
	bytes.NewReader(raw),
)
req.Header.Set("Authorization", "Bearer "+os.Getenv("LIVEHIVE_API_KEY"))
req.Header.Set("Content-Type", "application/json")
http.DefaultClient.Do(req)`,
  },
  ruby: {
    label: 'Ruby',
    both: `require "json"
require "net/http"

KEY = ENV.fetch("LIVEHIVE_API_KEY") # lh_live_...

uri = URI("https://www.livehive.dev/v1/activities/abc123/update")
req = Net::HTTP::Post.new(uri)
req["Authorization"] = "Bearer #{KEY}"
req["Content-Type"] = "application/json"
req.body = JSON.generate({ content_state: { status: "driver_arriving", eta: 4 } })
Net::HTTP.start(uri.host, uri.port, use_ssl: true) { |http| http.request(req) }

uri = URI("https://www.livehive.dev/v1/activities/abc123/end")
req = Net::HTTP::Post.new(uri)
req["Authorization"] = "Bearer #{KEY}"
req["Content-Type"] = "application/json"
req.body = JSON.generate({ content_state: { status: "delivered", eta: 0 } })
Net::HTTP.start(uri.host, uri.port, use_ssl: true) { |http| http.request(req) }`,
    update: `require "json"
require "net/http"

uri = URI("https://www.livehive.dev/v1/activities/abc123/update")
req = Net::HTTP::Post.new(uri)
req["Authorization"] = "Bearer #{ENV.fetch("LIVEHIVE_API_KEY")}"
req["Content-Type"] = "application/json"
req.body = JSON.generate({ content_state: { status: "driver_arriving", eta: 4 } })
Net::HTTP.start(uri.host, uri.port, use_ssl: true) { |http| http.request(req) }`,
    end: `require "json"
require "net/http"

uri = URI("https://www.livehive.dev/v1/activities/abc123/end")
req = Net::HTTP::Post.new(uri)
req["Authorization"] = "Bearer #{ENV.fetch("LIVEHIVE_API_KEY")}"
req["Content-Type"] = "application/json"
req.body = JSON.generate({ content_state: { status: "delivered", eta: 0 } })
Net::HTTP.start(uri.host, uri.port, use_ssl: true) { |http| http.request(req) }`,
  },
}

const STORAGE_KEY = 'lh_backend_lang'
const LANGS = Object.keys(SNIPPETS) as Lang[]

export function BackendSnippet({ example = 'both' }: { example?: BackendExample }) {
  const [lang, setLang] = useState<Lang>('node')

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && stored in SNIPPETS) setLang(stored as Lang)
  }, [])

  function onChange(next: Lang) {
    setLang(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }

  const tablistId = `backend-lang-${example}`

  return (
    <div>
      <div
        role="tablist"
        aria-label="Example HTTP snippets"
        id={tablistId}
        className="mt-4 mb-2 flex flex-wrap gap-1"
      >
        {LANGS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={lang === id}
            className={`rounded-md px-2.5 py-1 font-mono text-[12px] transition-colors ${
              lang === id
                ? 'bg-white/[0.08] text-[var(--color-ink)]'
                : 'text-[var(--color-faint)] hover:text-[var(--color-ink-soft)]'
            }`}
            onClick={() => onChange(id)}
          >
            {SNIPPETS[id].label}
          </button>
        ))}
      </div>
      <pre className="!mt-0">
        <code>{SNIPPETS[lang][example]}</code>
      </pre>
    </div>
  )
}
