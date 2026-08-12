# Live Hive — Landing Page

A polished, production-quality **coming-soon / waitlist** landing page for a
developer-focused SaaS that provides infrastructure for Apple iOS Live
Activities.

> Live Activities, without the backend headache.
> One simple API to start, update, and end iOS Live Activities. We handle the
> infrastructure behind it.

This repository is a **landing page only**. It does not implement the product,
a dashboard, authentication, APNs, ActivityKit, billing, or any backend. The
only interactive business functionality is the waitlist email capture.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run preview  # preview the production build
npm run lint     # run oxlint
```

## Project structure

```
src/
  components/
    Navbar.tsx
    Hero.tsx
    LiveActivityPreview.tsx   # animated iPhone / Dynamic Island mockup
    Problem.tsx
    ApiExample.tsx
    Infrastructure.tsx
    WhyThisExists.tsx
    Pricing.tsx
    FinalCTA.tsx
    Footer.tsx
    WaitlistModal.tsx         # email capture + success state
    WaitlistProvider.tsx      # opens the modal from any CTA
    ...
  hooks/useReveal.ts          # subtle scroll-in reveal (respects reduced motion)
  lib/submitWaitlist.ts       # mock submission, ready for a real endpoint
  config.ts                   # product name, links, waitlist endpoint
  App.tsx
```

## Configuration

Everything that is likely to change lives in `src/config.ts`:

- `productName` — the product name shown throughout the page (currently a
  currently `Live Hive`).
- `links` — footer links (`github`, `x`, `contact`). An empty string omits the
  link rather than fabricating a URL.
- `waitlistEndpoint` — leave empty to use the local mock submission handler.
  Set it to a real URL to have the form `POST` `{ "email": "..." }` as JSON.

To wire up a real waitlist backend, set `waitlistEndpoint`, or replace the mock
branch in `src/lib/submitWaitlist.ts` with your provider's SDK call.

## Accessibility & motion

Animations are intentionally restrained and honor
`prefers-reduced-motion: reduce`. The waitlist modal is keyboard accessible
(focus on open, `Escape` to close) and locks background scroll while open.
