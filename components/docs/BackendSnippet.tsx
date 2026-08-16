'use client'

import { useEffect, useState } from 'react'

const SNIPPETS = {
  node: {
    label: 'Node.js',
    code: `import { LiveHive } from 'livehive'

const livehive = new LiveHive({
  apiKey: process.env.LIVEHIVE_API_KEY, // lh_live_...
})

await livehive.activities.update('abc123', {
  status: 'driver_arriving',
  eta: 4,
})

await livehive.activities.end('abc123', {
  status: 'delivered',
  eta: 0,
})`,
  },
  python: {
    label: 'Python',
    code: `import json
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
  },
  go: {
    label: 'Go',
    code: `import (
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
  },
  ruby: {
    label: 'Ruby',
    code: `require "json"
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
  },
} as const

type Lang = keyof typeof SNIPPETS

const STORAGE_KEY = 'lh_backend_lang'

export function BackendSnippet() {
  const [lang, setLang] = useState<Lang>('node')

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && stored in SNIPPETS) setLang(stored as Lang)
  }, [])

  function onChange(next: Lang) {
    setLang(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <div>
      <div className="mt-4 mb-2 flex items-center justify-end gap-2">
        <label htmlFor="backend-lang" className="text-[13px] text-[var(--color-muted)]">
          Language
        </label>
        <select
          id="backend-lang"
          className="field !w-auto min-w-[9.5rem] py-2 text-[14px]"
          value={lang}
          onChange={(e) => onChange(e.target.value as Lang)}
        >
          {(Object.keys(SNIPPETS) as Lang[]).map((id) => (
            <option key={id} value={id}>
              {SNIPPETS[id].label}
            </option>
          ))}
        </select>
      </div>
      <pre className="!mt-0">
        <code>{SNIPPETS[lang].code}</code>
      </pre>
    </div>
  )
}
