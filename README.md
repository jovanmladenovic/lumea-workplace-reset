# Luméa workplace reset

Ambient re-engagement layer for the Luméa workplace-reset case study, built on top of
the real Fitsee app (this repo is a fresh-history copy of `Fitsee/fitsee-new`'s
`develop` branch, seeded on 2026-07-23). Full context and design rationale:
[`docs/lumea-project-handoff.md`](docs/lumea-project-handoff.md). The original
hardware-free walkthrough is still here too:
[`docs/lumea-workplace-reset-connected.html`](docs/lumea-workplace-reset-connected.html)
— open it directly in a browser, no setup required.

## What's new here vs. upstream Fitsee

Two screens, added on new routes, **parallel to the existing `Idle.vue` /
face-login / `CheckIn` flow** — that flow is untouched:

- `src/views/AmbientStandby.vue` (`/ambient-standby`) — foot-traffic bloom + chime
  (Tier A) and a clock-based time-of-day pulse (Tier B), both driven by a real
  presence sensor (see below).
- `src/views/Engage.vue` (`/engage`) — "Thanks for stopping by." thumbs-up
  confirmation, wired to the real `@fitsee/user-input` gesture pipeline
  (`GestureLabel.THUMB_UP`) when running inside Electron.

`@fitsee/face-recognition` stays a dependency and `face-recognition.service.ts` is
untouched, but neither new screen calls it — per the handoff doc, anonymity is a
trust decision, and the ambient layer never identifies anyone.

**Presence detection (`src/services/person-detection.service.ts`)** — `AmbientStandby`
and the bloom/approach triggers are driven by `@fitsee/user-tasks`'s `PersonDetection`
class, a body-pose-only sensor (mediapipe landmarks, no face, no identity) that
wasn't used anywhere in the app before. `VideoStream.vue` now initializes it alongside
`userInput`/`faceRecognition`/`userTasks`. It only reports `PERSON_PRESENT`/
`PERSON_MISSING`, so the bloom-vs-approach split is a dwell-time heuristic in
`AmbientStandby.vue`: present under `APPROACH_DWELL_MS` (1.5s, placeholder) → Tier A
bloom; present past it → Tier C approach. **Not yet tuned against real foot traffic**
— see Open items. Note this also means two separate mediapipe pose models
(`PersonDetection`'s own, plus `userTasks`' existing one) now run concurrently on the
same camera feed — works, but is redundant inference cost worth revisiting later.

**Engagement counter (`src/services/engagement-counter.service.ts`)** — three
aggregate running totals, `passersBy` / `approaches` / `engagements`, incremented
from `triggerBloom()`, `handleApproach()`, and `Engage.vue`'s `confirmEngagement()`
respectively. No timestamps, no identity, no per-event log — just numbers going up,
consistent with "anonymous, always". Two backends, both best-effort:
- **Firestore** — `engagementCounts/{DEVICE_ID}` (falls back to `default-device` if
  `DEVICE_ID` isn't set), in its **own dedicated Firebase project**
  (`lumea-workplace-reset`, config in `src/firebase/counter-firebase.ts`) —
  deliberately *not* the Fitsee project (`fitsee-d45e6`, `firebase.ts`) used by the
  real face-login/vectors flow, since access to that project wasn't available. This
  is the one that actually matters: the mirror has no physical access, only remote
  updates (handoff doc §2), so this is what makes the counts checkable at all. Uses
  `counterFirebaseApp` directly rather than vuefire's `useFirestore()` (which needs a
  component context this service doesn't have) — works from both Electron and the
  GitHub Pages preview build, since `counter-firebase.ts` has no `window.electronAPI`
  dependency. Firestore security rules for the `engagementCounts` collection were set
  up directly in that project's console (open read/write scoped to just that one
  collection, deny-all elsewhere) — not something checked into this repo.
- **Local JSON file** via IPC (`counts:increment`/`counts:get` in `main.ts`),
  Electron-only, survives restarts — kept as an offline-tolerant secondary record.
  No retry queue, so a Firestore write that fails while offline is just lost from
  Firestore's side (the local file still has it).

Logged to DevTools console on every increment (both backends) for visibility. No UI
to view them yet — check the `engagementCounts` collection directly in the Firebase
console, read the local file, or call `window.electronAPI.getCounts()` from DevTools.

## Running it

```bash
yarn install
yarn dev
```

Then navigate to `/ambient-standby` or `/engage` (dev-jump links can be added to
`App.vue` the same way the existing views are, if useful).

## Browser preview (GitHub Pages)

`yarn build:web` builds just the ambient/engage screens as a static site (no
Electron, no Firebase — see `src/main.web.ts` / `vite.web.config.mts`), deployed by
`.github/workflows/deploy-pages.yml` on push to `main`.

This repo is now **public** (GitHub Pages isn't available on a private repo without a
paid plan) and Pages is enabled, deploying to
https://jovanmladenovic.github.io/lumea-workplace-reset/.

**Setup still required:**
- Add a repo secret `FITSEE_PACKAGES_TOKEN` — a PAT with `read:packages`, authorized
  for SSO access to the Fitsee org — so the Actions workflow can install `@fitsee/*`
  from GitHub Packages. Without it the workflow fails at `yarn install` (confirmed —
  same `401 Unauthorized` you'd get locally without registry auth).
- Since gesture recognition and presence detection both need `window.electronAPI`
  (set up by `preload.ts`, Electron-only), the Pages build can't do a real-hardware
  demo of either — both screens fall back to manual "Simulate…" buttons outside
  Electron.

## Open items (not yet resolved)

- **`APPROACH_DWELL_MS` (1.5s) in `AmbientStandby.vue` is an untuned placeholder.**
  It's the only thing distinguishing "walked by" from "stopped" since
  `PersonDetection` only reports present/missing, not distance or duration on its
  own. Needs real-world tuning once this runs on the actual device.
  `checkInterval`/`logoutTimeWindow` in `person-detection.service.ts` (500ms / 3s)
  are similarly untuned.
- **Two mediapipe pose models run concurrently** (`PersonDetection`'s own +
  `userTasks`'s existing one) on the same camera feed — functional but wasteful;
  would need the `@fitsee/user-tasks` package itself to expose a shared tracker to
  fix properly.
- **No viewing UI** — check the `engagementCounts` collection directly in the
  `lumea-workplace-reset` Firebase project's console for now.
- **The `engagementCounts` collection is open read/write to anyone with the
  project's client config** (which isn't itself secret, but the rule is
  intentionally permissive to avoid needing auth for a kiosk device with no user
  sign-in). Fine for an anonymous aggregate counter with no personal data; worth
  tightening later if that stops being true.
- `yarn install` / `yarn dev` are confirmed working locally (2026-08-11) with proper
  `@fitsee` registry auth. Real-camera presence detection and the thumbs-up gesture
  still need to be verified end-to-end in front of an actual webcam — I've only been
  able to verify this by reading the code, not by running it.
