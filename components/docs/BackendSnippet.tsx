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
    both: `const LIVEHIVE = "https://livehive.dev/api/v1"
const KEY = process.env.LIVEHIVE_API_KEY // lh_live_...

async function livehive(path, body) {
  const res = await fetch(\`\${LIVEHIVE}\${path}\`, {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

await livehive("/activities/abc123/update", {
  content_state: { status: "driver_arriving", eta: 4 },
})

await livehive("/activities/abc123/end", {
  content_state: { status: "delivered", eta: 0 },
})`,
    update: `const LIVEHIVE = "https://livehive.dev/api/v1"
const KEY = process.env.LIVEHIVE_API_KEY // lh_live_...

const res = await fetch(\`\${LIVEHIVE}/activities/abc123/update\`, {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    content_state: { status: "driver_arriving", eta: 4 },
  }),
})
if (!res.ok) throw new Error(await res.text())
await res.json()`,
    end: `const LIVEHIVE = "https://livehive.dev/api/v1"
const KEY = process.env.LIVEHIVE_API_KEY // lh_live_...

const res = await fetch(\`\${LIVEHIVE}/activities/abc123/end\`, {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    content_state: { status: "delivered", eta: 0 },
  }),
})
if (!res.ok) throw new Error(await res.text())
await res.json()`,
  },
  python: {
    label: 'Python',
    both: `import json
import os
import urllib.request

LIVEHIVE = "https://livehive.dev/api/v1"
KEY = os.environ["LIVEHIVE_API_KEY"]  # lh_live_...

def livehive(path, body):
    req = urllib.request.Request(
        LIVEHIVE + path,
        data=json.dumps(body).encode(),
        headers={
            "Authorization": f"Bearer {KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req) as res:
        return json.load(res)

livehive("/activities/abc123/update", {
    "content_state": {"status": "driver_arriving", "eta": 4},
})

livehive("/activities/abc123/end", {
    "content_state": {"status": "delivered", "eta": 0},
})`,
    update: `import json
import os
import urllib.request

LIVEHIVE = "https://livehive.dev/api/v1"
KEY = os.environ["LIVEHIVE_API_KEY"]  # lh_live_...

req = urllib.request.Request(
    LIVEHIVE + "/activities/abc123/update",
    data=json.dumps({
        "content_state": {"status": "driver_arriving", "eta": 4},
    }).encode(),
    headers={
        "Authorization": f"Bearer {KEY}",
        "Content-Type": "application/json",
    },
    method="POST",
)
with urllib.request.urlopen(req) as res:
    json.load(res)`,
    end: `import json
import os
import urllib.request

LIVEHIVE = "https://livehive.dev/api/v1"
KEY = os.environ["LIVEHIVE_API_KEY"]  # lh_live_...

req = urllib.request.Request(
    LIVEHIVE + "/activities/abc123/end",
    data=json.dumps({
        "content_state": {"status": "delivered", "eta": 0},
    }).encode(),
    headers={
        "Authorization": f"Bearer {KEY}",
        "Content-Type": "application/json",
    },
    method="POST",
)
with urllib.request.urlopen(req) as res:
    json.load(res)`,
  },
  go: {
    label: 'Go',
    both: `import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

const livehiveBase = "https://livehive.dev/api/v1"

func livehive(path string, body any) error {
	raw, err := json.Marshal(body)
	if err != nil {
		return err
	}
	req, err := http.NewRequest(http.MethodPost, livehiveBase+path, bytes.NewReader(raw))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+os.Getenv("LIVEHIVE_API_KEY"))
	req.Header.Set("Content-Type", "application/json")
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		return fmt.Errorf("livehive %s", res.Status)
	}
	return nil
}

_ = livehive("/activities/abc123/update", map[string]any{
	"content_state": map[string]any{"status": "driver_arriving", "eta": 4},
})
_ = livehive("/activities/abc123/end", map[string]any{
	"content_state": map[string]any{"status": "delivered", "eta": 0},
})`,
    update: `import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

raw, _ := json.Marshal(map[string]any{
	"content_state": map[string]any{"status": "driver_arriving", "eta": 4},
})
req, _ := http.NewRequest(
	http.MethodPost,
	"https://livehive.dev/api/v1/activities/abc123/update",
	bytes.NewReader(raw),
)
req.Header.Set("Authorization", "Bearer "+os.Getenv("LIVEHIVE_API_KEY"))
req.Header.Set("Content-Type", "application/json")
res, err := http.DefaultClient.Do(req)
if err != nil {
	return err
}
defer res.Body.Close()
if res.StatusCode >= 300 {
	return fmt.Errorf("livehive %s", res.Status)
}`,
    end: `import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

raw, _ := json.Marshal(map[string]any{
	"content_state": map[string]any{"status": "delivered", "eta": 0},
})
req, _ := http.NewRequest(
	http.MethodPost,
	"https://livehive.dev/api/v1/activities/abc123/end",
	bytes.NewReader(raw),
)
req.Header.Set("Authorization", "Bearer "+os.Getenv("LIVEHIVE_API_KEY"))
req.Header.Set("Content-Type", "application/json")
res, err := http.DefaultClient.Do(req)
if err != nil {
	return err
}
defer res.Body.Close()
if res.StatusCode >= 300 {
	return fmt.Errorf("livehive %s", res.Status)
}`,
  },
  ruby: {
    label: 'Ruby',
    both: `require "json"
require "net/http"

KEY = ENV.fetch("LIVEHIVE_API_KEY") # lh_live_...

def livehive(path, body)
  uri = URI("https://livehive.dev/api/v1#{path}")
  req = Net::HTTP::Post.new(uri)
  req["Authorization"] = "Bearer #{KEY}"
  req["Content-Type"] = "application/json"
  req.body = JSON.generate(body)
  res = Net::HTTP.start(uri.host, uri.port, use_ssl: true) { |http| http.request(req) }
  raise res.body unless res.is_a?(Net::HTTPSuccess)
  JSON.parse(res.body)
end

livehive("/activities/abc123/update", {
  content_state: { status: "driver_arriving", eta: 4 },
})

livehive("/activities/abc123/end", {
  content_state: { status: "delivered", eta: 0 },
})`,
    update: `require "json"
require "net/http"

uri = URI("https://livehive.dev/api/v1/activities/abc123/update")
req = Net::HTTP::Post.new(uri)
req["Authorization"] = "Bearer #{ENV.fetch("LIVEHIVE_API_KEY")}"
req["Content-Type"] = "application/json"
req.body = JSON.generate({
  content_state: { status: "driver_arriving", eta: 4 },
})
res = Net::HTTP.start(uri.host, uri.port, use_ssl: true) { |http| http.request(req) }
raise res.body unless res.is_a?(Net::HTTPSuccess)
JSON.parse(res.body)`,
    end: `require "json"
require "net/http"

uri = URI("https://livehive.dev/api/v1/activities/abc123/end")
req = Net::HTTP::Post.new(uri)
req["Authorization"] = "Bearer #{ENV.fetch("LIVEHIVE_API_KEY")}"
req["Content-Type"] = "application/json"
req.body = JSON.generate({
  content_state: { status: "delivered", eta: 0 },
})
res = Net::HTTP.start(uri.host, uri.port, use_ssl: true) { |http| http.request(req) }
raise res.body unless res.is_a?(Net::HTTPSuccess)
JSON.parse(res.body)`,
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
        aria-label="Backend language"
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
