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
  (Tier A) and a clock-based time-of-day pulse (Tier B).
- `src/views/Engage.vue` (`/engage`) — "Thanks for stopping by." thumbs-up
  confirmation, wired to the real `@fitsee/user-input` gesture pipeline
  (`GestureLabel.THUMB_UP`) when running inside Electron.

`@fitsee/face-recognition` stays a dependency and `face-recognition.service.ts` is
untouched, but neither new screen calls it — per the handoff doc, anonymity is a
trust decision, and the ambient layer never identifies anyone.

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

**Setup required, not yet done:**
- Add a repo secret `FITSEE_PACKAGES_TOKEN` — a PAT with `read:packages`, authorized
  for SSO access to the Fitsee org — so the workflow can install `@fitsee/*` from
  GitHub Packages.
- Enable Pages in repo Settings → Pages → Source: GitHub Actions. **This repo is
  private**, and GitHub Pages on a private repo needs a GitHub Pro/Team/Enterprise
  plan — if that's not available, Pages won't enable and the fallback is sharing
  `docs/lumea-workplace-reset-connected.html` directly (zero-setup, already
  hardware-free) instead.
- Since gesture recognition needs `window.electronAPI` (set up by `preload.ts`,
  Electron-only), the Pages build can't do a real-hardware demo of the thumbs-up
  gesture — both screens fall back to manual "Simulate…" buttons outside Electron.

## Open items (not yet resolved)

- **No real presence/proximity sensor is wired up.** Both the foot-traffic bloom
  (Tier A) and the approach-to-engage trigger (Tier C) currently only fire from the
  dev controls on `AmbientStandby.vue` / a tap on the orb — there's no existing
  non-identifying sensor in this codebase to drive them automatically. Matches the
  handoff doc's own note that this needs tuning against real hardware.
- **What counts as "success" is still undecided** — a thumbs-up produces no data on
  its own; nothing currently counts gesture-recognition events anywhere.
- Local `yarn install` on this machine could not be verified end-to-end — no
  `@fitsee` registry credentials are configured here. Confirm install works with
  your own auth before relying on `yarn dev`.
