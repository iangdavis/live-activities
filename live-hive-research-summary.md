# Live Hive — Customer Discovery Research Summary

**Goal:** Identify reachable indie / small-team iOS developers building real-time, server-driven
apps who plausibly feel enough pain running Live Activity (ActivityKit + APNs) infrastructure that
Live Hive could sell to them. This is validation, not a sales exercise — the analysis below is
deliberately skeptical.

**Deliverable:** [`live-hive-prospects.csv`](./live-hive-prospects.csv) — 30 qualified, deduplicated
prospects with evidence, contacts, Live Activity status (Confirmed / Likely / Unknown / No) and
source URLs. Direct competitors are **excluded** from the 30 and listed separately below.

Method: parallel web research across Google, Reddit, GitHub, X, LinkedIn, Product Hunt, Indie
Hackers, Hacker News, App Store, dev blogs and personal sites. Every contact field is taken from a
public source; unknown fields are left blank (never fabricated).

---

## 1. Top 5 prospects

### 1. Christopher Trott — Eki Live (Tokyo transit)
- **Why strong:** He *already runs his own server that relays payloads to APNs* to start Live
  Activities from the background, and publicly wrote that he wishes this "superfluous server-based
  workaround" would disappear. That is almost a verbatim statement of Live Hive's value prop.
  Confirmed server-driven Live Activity, active solo indie, reachable.
- **Channel:** Email (support@twocentstudios.com) or X (@twocentstudios).
- **Opening question:** "You wrote that you wish the server-based APNs workaround for *starting*
  Live Activities would go away — if a hosted API owned that relay + token lifecycle for you, what
  would you want it to guarantee?"

### 2. Oliver Jeffers — TubeBoard (London Underground)
- **Why strong:** His public repo is literally a "Live Activity push service" — a Node app on
  Fly.io doing push-token registration lifecycle, inactive-registration cleanup, worker queues and
  a data-health monitor, built solo, monetized (£1.99/mo). He has built the whole thing Live Hive
  proposes to replace and is actively committing (Aug 2026).
- **Channel:** Email from git metadata (oliver@jeffers.uk.net) / GitHub (olly-j).
- **Opening question:** "You stood up a full LA push service + registration lifecycle + /status
  monitoring just to show tube times — what broke often enough that you had to build monitoring
  for it?"

### 3. Felipe Canhameiro — GlassTime (focus timer, Prism Labs)
- **Why strong:** Open-source showcase spells out the exact pain and fix: local timers drift when
  the app is killed, so he wrote ES256 JWT signing, APNs HTTP/2, token caching, and Cloud-Task-
  scheduled pushes to complete the Live Activity at the precise end time — and documented that
  "FCM doesn't support the liveactivity push type." Solo, ships multiple LA apps (GlassTime,
  GlassWater) that could share one backend.
- **Channel:** Email (fecanhameiro@icloud.com) / GitHub / LinkedIn.
- **Opening question:** "You built ES256 signing + Cloud Tasks just to fire one reliable end-of-
  timer push — if a managed layer did that across all your apps, would you move GlassWater onto it
  too?"

### 4. Art Shabani — Zipp Go (food delivery, Kosovo)
- **Why strong:** Textbook archetype (order → driver assigned → live GPS → ETA → delivered) with a
  *separate driver app* streaming GPS and confirmed server-driven Lock Screen / Dynamic Island
  Live Activities — built and operated **solo**. He has a public email and is expanding city by
  city, so reliability/scale pain is imminent.
- **Channel:** Email (artshabani2002@gmail.com) / LinkedIn.
- **Opening question:** "As Zipp Go expands past Gjilan, what's harder to keep reliable — the
  driver-GPS ingestion or the Lock Screen updates as concurrent orders grow?"

### 5. Xavier Briole — Riftly (LoL esports)
- **Why strong:** He documented building "a scalable backend with NestJS + PostgreSQL, Redis and
  BullMQ for async push processing, and iOS Live Activities using the expo-live-activity plugin,
  which I forked and customized." A solo dev who forked the client library *and* built the queueing
  backend is exactly who has felt every rough edge.
- **Channel:** LinkedIn (in/xavierbriole).
- **Opening question:** "You forked expo-live-activity and put APNs behind BullMQ — which part
  cost you the most time: token rotation, retries, or Apple's update budget?"

*(Honorable mentions just outside the top 5: Andrew Martin/TrackRat, Kamal Lakshmanan/Box Box Club,
Sergio Vargas/Aucword, Michał Chałasz/RawMon, Tharit Thaveekittikul/POMPKINS Food — all have already
hand-built the server→APNs→Live Activity pipeline.)*

---

## 2. Market patterns

- **Which products use Live Activities?** The confirmed adopters cluster tightly in the exact
  categories the brief prioritized: **transit/rail** (by far the densest — Tokyo, London, NYC,
  Amtrak, UK/EU rail, Chicago, Portland), **flight/travel**, **food/last-mile delivery**,
  **live sports/esports** (F1, cricket, football, LoL), **auctions**, **finance/crypto tickers**,
  **server/uptime monitoring**, **events/festivals**, and **timers**. Package trackers are the
  weakest sub-category — most rely on carrier *polling* + plain push and have **not** actually
  shipped Live Activities (secondary sources overstate this; first-party copy usually doesn't
  confirm it).
- **How often are they server-driven?** For the *strong* prospects, almost always. Auctions
  (outbid/close), delivery (driver GPS), transit (delay/position), sports (score/clock) and finance
  (price ticks) are inherently server-originated events. The apps that are only *client/timer-driven*
  (many focus timers, UV trackers, "zero-server / CloudKit-only" score apps) are weak fits and were
  largely excluded or flagged.
- **Backend technologies seen:** Node/NestJS, Python/FastAPI + Django, Go, Firebase Cloud Functions
  + Cloud Tasks, Cloudflare Workers, Supabase, PostgreSQL, Redis/BullMQ, SSE/WebSockets, Railway /
  Render / Fly.io hosting. On the APNs layer specifically, developers repeatedly reach for
  hand-rolled **ES256 JWT signing + HTTP/2** because the Node APNs library ecosystem is weak (the
  de-facto library is abandoned; Christian Selig documented going back to Go for this reason).
- **Are developers building the infra themselves?** Yes — overwhelmingly. The single most common
  finding is a solo dev who built a bespoke server→APNs→Live Activity pipeline for one product
  (Eki Live's relay, TubeBoard's push service, GlassTime's Cloud-Task scheduler, TrackRat's .p8 key
  handling, RawMon's Cloudflare relay, Riftly's BullMQ queues, PowerPlay's self-hosted backend,
  POMPKINS' SSE pipeline).
- **What problems recur?** (1) **Push-token lifecycle** — update/push-to-start tokens rotate and
  "updates silently stop"; (2) **Apple's undocumented update budget / throttling**, acute for
  30-second crypto tickers and multi-match sports; (3) **content-state type mismatches** (200 OK,
  no visible update); (4) **missed `end` / stale-date** leaving zombie activities; (5) starting a
  Live Activity from the **background requires a server relay** at all; (6) **library rot**
  (`expo-live-activity` was archived Jun 2026, stranding RN users).
- **Are small developers actually adopting Live Activities?** Yes, and adoption is accelerating in
  2025–2026 — many qualified apps launched in the last 6 months, and several devs treat Live
  Activities as a *headline* feature, not an afterthought.

---

## 3. Competitive landscape (adjacent products — NOT counted as prospects)

The "HTTP/webhook → Live Activity as a service" space **already exists but is early and thinly
populated.**

- **PushWard** (Maciej Kędziora, solo, Poland) — "iOS Live Activities via API." One POST starts,
  another updates/ends; server owns the whole lifecycle. Targets homelab/DevOps/self-hosters via
  its **own** consumer app + open-source Docker bridges. *Differs from Live Hive:* not embeddable
  in your own branded app. Free tier ~500 notifications + 250 LA updates/mo.
- **ActivitySmith** (Adam Bardon, solo, Bangkok) — API to send push + Live Activities from any
  backend/CI/AI-agent to *your own team's paired devices* running the ActivitySmith app. SDKs in
  Node/Python/Go/PHP/Ruby, MCP server. $9–$129/mo. *Differs:* internal/team monitoring, not
  infra for a third party's consumer app.
- **OneSignal** — **the closest real competitor.** Fully manages LA token lifecycle
  (`pushTokenUpdates`, `pushToStartTokenUpdates`), fans one API call across all subscribers, adds
  delivery analytics. Free up to 10k subscribers. *Differs:* bundled inside a broad, marketing-
  oriented cross-platform messaging suite rather than a focused developer primitive.
- **Airship** — enterprise CEP that manages LA tokens with "a couple lines of code" (early mover
  with FotMob). *Differs:* enterprise sales motion, heavy/expensive, not self-serve.
- **Relay-only (gap Live Hive fills):** Courier, Knock, Batch route standard push/tokens but do
  **not** offer high-level Live Activity lifecycle management today.
- **DIY toolkits / market signal:** `expo-live-activity` (archived Jun 2026),
  `react-native-live-activity-kit` (aashir-athar), Mobile Surfaces (glendonC — explicitly scopes a
  "production push service with queues, durable retries, observability" as *out of scope*),
  Itsuki's TS reference server, plus app-builders Newly / Rork Lab.

**What this suggests:** The problem is real enough that multiple people independently productized
it — validation. But two solo competitors chose the easier "notify yourself/your team via our app"
wedge rather than "managed infra inside your app," and the strongest incumbents (OneSignal/Airship)
already fully manage the token lifecycle. Live Hive's differentiation must be a *focused,
developer-first, embeddable* primitive that beats OneSignal on DX and beats DIY on reliability.

---

## 4. Business validation (skeptical assessment)

**Evidence supporting Live Hive**
- A dense, reachable population of solo/1–10 devs have **already hand-built** the exact
  server→APNs→Live Activity pipeline — the problem is demonstrably felt, not hypothetical.
- Recurring, specific, painful failure modes (token rotation dropping updates, throttling budgets,
  zombie activities, background-start requiring a relay, rotting libraries) — a coherent product
  surface.
- At least three independent products (PushWard, ActivitySmith, OneSignal's feature) prove someone
  will build/pay for managed Live Activity delivery.
- Multiple prospects *volunteered* to "compare notes" publicly (PushWard, Mobile Surfaces), and one
  even gives conference talks on push-updating Live Activities (Nearly Departed).

**Evidence against Live Hive**
- **The "will they pay?" gap is unproven.** Most of these devs are hobbyists or side-projecters
  who built the infra *precisely because they enjoy* building it, often on free tiers (Fly.io,
  Cloudflare Workers, Firebase, Supabase). Sunk-cost + "it already works" is a strong reason *not*
  to switch.
- **OneSignal already does the core job for free** up to 10k subscribers and is a known quantity —
  a hard incumbent to displace on a commodity primitive.
- Several "Live Activity" apps aren't even APNs-driven (30s crypto tickers likely poll on-device;
  some score apps are CloudKit/timer-only), so the true server-push TAM is smaller than the raw
  app count implies.
- The biggest logos that clearly have the pain (Flighty, Box Box Club) have **already solved it
  themselves** and are the least likely to rip-and-replace — great interviews, weak buyers.
- Apple could shrink the moat at any WWDC (e.g., simplifying background start / push-to-start),
  which is partly what these devs are waiting for.

**Biggest unanswered question**
> Will a solo/indie dev who has *already* built a working server→APNs Live Activity pipeline pay a
> recurring fee to *replace* something that already works — versus continuing to run their free-tier
> DIY setup or adopting OneSignal's free plan? Willingness-to-pay, not problem-existence, is the
> crux.

**What to validate next**
1. **Pricing / switching interviews** with the 🔥🔥🔥 "already-built-it" cohort (Trott, Jeffers,
   Canhameiro, Martin, Briole, Chałasz): would they *migrate*, and at what monthly price does it
   beat maintaining their own? Focus on reliability/monitoring and Apple-throttling headaches as the
   wedge, since those are the parts DIY handles worst.
2. **Greenfield pull** with the "perfect-use-case-but-no-LA-yet" cohort (Bidsle, Parcel, package
   trackers, RunTogether): is "add Live Activities without building APNs infra" a strong enough
   reason to adopt *before* they DIY it? This tests whether Live Hive can win at the decision moment
   rather than fighting sunk cost.
3. **Sharp positioning vs OneSignal** — establish the concrete DX / reliability / Live-Activity-
   specific advantages (token lifecycle guarantees, throttle-aware priority mixing, delivery
   monitoring, one focused API) that justify choosing Live Hive over a free general-purpose push
   platform.

**Bottom line (not a rubber stamp):** The *problem* is real, common, and painfully DIY'd by exactly
the small, reachable developers Ian wants to talk to. The *business* hinges entirely on
willingness-to-pay against free DIY and free-tier OneSignal — which the research surfaces but does
**not** yet answer. The 30-person list is built to answer precisely that question through
conversation.
