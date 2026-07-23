# Luméa — Workplace Reset — Project Handoff

**Purpose of this doc:** context to carry into Claude Code so work can continue there without re-deriving the reasoning behind each decision. The canonical prototype file is `lumea-workplace-reset-connected.html` — bring that file into the Claude Code project; this doc explains *why* it looks the way it does.

---

## 1. Origin story (interview-prep exercise)

Luméa started as a gesture-controlled AI fitness mirror. Reframed for this exercise as a **workplace device** offering short, science-backed mindful "resets" — not workouts. Key pivots, in order:

1. **Original problem:** onboarding conversion was low — gesture calibration failed silently, no feedback to the user.
2. **First redesign:** real-time visual confirmation during calibration (lo-fi wireframe, now superseded).
3. **Real constraint surfaced:** the actual bottleneck was face recognition — fragile and privacy-sensitive.
4. **Fix:** drop face recognition entirely. Body pose detection only. No identification step.
5. **Trade-off named explicitly:** this removes personalization ("who is this"). A deliberate sequencing decision, not a gap.
6. **Decision:** no identification at all, to remove every barrier to first use *and* because anonymity is a **trust** decision in a workplace — it's what makes a body-tracking device safe to use around colleagues.
7. **Domain shift:** fitness workouts → workplace mindful micro-interventions (paced breathing etc.), changing vocabulary, pacing (1–3 min, interruptible), and adding a need for a science-backed trust cue.

## 2. Second pivot — the real deployment context

Partway through, new constraints emerged that changed the actual problem being solved:

- Mirror is **already placed in an office**, in a different city — **no physical access**, only remote updates via a **GitHub repo**.
- Employees have **completely forgotten** the mirror exists and show no initiative to use it.
- Hardware available for remote-triggered ambient behavior: **screen + speaker** (confirmed capability — no ambient LED beyond the panel).
- Hand-gesture recognition module is **already built into the device** (used later for the thumbs-up confirmation).
- The original 5-screen flow (intro → standby → picker → reset → close) was validated for *logic*, but doesn't solve *this* problem — nobody was reaching screen one. Reframed as: **Awareness → Approach → Session**. The old work solved Approach→Session; the real gap is Awareness.

## 3. Ambient re-engagement layer (built)

Three escalating tiers, all clock/proximity-based only — **no personal history, ever**:

- **A — Foot-traffic bloom:** pose sensor detects someone walking *near* (not stopping) → orb blooms softly 2–3s + one quiet two-tone chime (Web Audio, generated in-browser, no asset file). Cooldown throttling included (demo uses 6s; real deployment needs longer/decaying cooldown, needs tuning against the real pose model's proximity threshold — flagged as unresolved).
- **B — Time-of-day pulse:** idle state's color/glow/one line of copy shifts at a few clock-based windows — Regular hours / Post-lunch slump (~2:45pm) / Monday AM / Evening. Deliberately clock-only, never personalized, to preserve the "nothing is tracked" promise.
- **C — Stop & look escalation:** currently the **simplified engagement-confirmation version** (see §5) rather than the original full-session handoff. The full handoff still exists in the file, parked.

Direction chosen and implemented: **A + B combined**, with a passive social-proof layer (C in the original brainstorm) explicitly deferred until real usage numbers exist.

## 4. Real intervention content (sourced from `FITSEE_PP_Frameworks_-_Aug_2025.md`)

Three techniques selected from the original doc, one per need, **not simply trimmed for time** — reworked for a socially-observed open-office context:

- **Dropped globally, regardless of which flow:** face-recognition-based user matching, the 1–10 energy scale (before/after), gesture tutorial screens, the end-of-session confirm gesture, and **anything spoken aloud** (affirmations, mirror declarations) — all of these either contradict the anonymity/no-tracking decision or would be socially exposing in front of colleagues. Also dropped physically unusual poses (power poses, shadowboxing) that would look strange to a passerby.
- **Stressed** ← *3.2.2 Stress Relief*: grounding (notice 3 things, 15s, silent) → physiological sigh breathing (2 short inhales/1 long exhale, 1.2s/1.2s/5.6s ×3, 24s) → quiet close (8s).
- **Need a break** ← *3.1.2 Midday Energy Dip Flow*: shoulder roll (8s) → arm shake (6s) → breathe+stretch+sigh (3s in/3s out ×3, 18s) → quiet close (7s). Deliberately echoes the "Post-lunch slump" ambient time-of-day state — same real-world moment, same content family.
- **Losing focus** ← *3.3.1 Entering Flow State*: neck roll (10s) → shoulder-blade squeeze (9s) → paced breathing (4s in/6s out ×3, 30s) → silent internal prompt, not spoken ("what deserves my attention right now?", 10s).

## 5. Latest pivot — narrowing to prove engagement first

Decision: **for now, success = proving people respond to the mirror at all**, not delivering the full reset. Step C (the "stop and look" escalation) was simplified:

- Old: stop → full need-picker → breathing reset → soft close.
- **New:** stop → **"Thanks for stopping by."** screen with a dim orb + thumbs-up icon → **thumbs-up gesture** (hardware already supports this) → orb blooms warm + soft tone (**reciprocity** — the mirror "waves back") + one **random one-line teaser** from a small pool of the real technique facts above (no memory of what was shown last — deliberately ephemeral, consistent with "not recorded") → auto-fades back to standby after ~4.2s.
- The full picker/reset/close flow **still exists in the file**, relabeled "(parked)" in the dev-jump controls — not deleted. To reconnect it: in `simulateApproach()`, change the line `setTimeout(()=>{ go('engage'); }, 850);` back to `setTimeout(()=>{ go('picker'); }, 850);`.
- **Open question, not yet resolved:** what "success" is actually measured as. A thumbs-up produces no data on its own — something has to count gesture-recognition events somewhere, and that's a real decision about what "anonymous" means in practice (an aggregate counter is very different from anything tied to a person, but it hasn't been decided).

## 6. UI/interaction fixes made along the way (worth knowing before touching the code)

- Orb visuals are **mode-aware**: movement steps sway, reflection/grounding steps go still, only real breathing steps get the pulsing animation — and that pulse's *speed* is tempo-matched to each technique's actual cycle length (8s for the physiological sigh, 6s for break, 10s for focus), not a generic fixed rate.
- Every reset step has a **depleting ring** around the orb (reused visual language from the picker's hold-to-confirm ring) showing time remaining for that specific instruction — added because text + orb alone didn't tell someone *how long* to keep doing a movement.
- Layout: device (400×720) and control panel now sit **side by side** at matching height; panel scrolls internally if content overflows; falls back to stacked layout under 860px viewport width.
- Trust badge copy: **"Anonymous, always"** (was "Not recorded" — chosen because it closes the "is it watched live even if not recorded" loophole in one phrase).
- Engage-screen headline: **"Thanks for stopping by."** (was "Still here?").

## 7. Current file state

- **`lumea-workplace-reset-connected.html`** — the canonical, current file. Single self-contained HTML file (vanilla JS, no build step), contains: intro, standby (with A/B ambient layers), engage (thumbs-up confirmation), picker/reset/close (parked full flow), plus an on-page director's control panel for demoing all triggers without needing real hardware.

**Key functions, verified against the current file (for quick reference, not guessed):**
| Function | Does |
|---|---|
| `go(name)` | Central screen state machine — `'standby'`, `'intro'`, `'engage'`, `'picker'`, `'reset'`, `'close'` |
| `simulatePass()` | Ambient tier A — foot-traffic bloom + chime, respects `COOLDOWN_MS` |
| `simulateApproach()` | Ambient tier C trigger — orb brightens, then `go('engage')` after 850ms |
| `simulateThumbsUp()` | Confirms engagement — reciprocity bloom + random line from `teasers[]`, auto-returns to standby after 4.2s |
| `selectNeed(key)` | Entry point into the parked full flow — builds step dots, starts `runSteps()` and the overall timer |
| `runSteps(steps, idx)` | Drives the parked reset screen's step-by-step text/orb-mode/ring per intervention |
| `playChime(vol)` | Shared Web Audio two-tone chime, used by both the bloom and the thumbs-up confirmation |

- Superseded/earlier files from this project (for reference, not current):
  - `lumea-onboarding-wireframe.html` — original fitness-mirror lo-fi wireframe.
  - `lumea-workplace-reset-wireframe.html` — earlier workplace lo-fi wireframe.
  - `lumea-workplace-reset-hifi.html` — first hi-fi build, before the ambient layer existed.
  - `lumea-ambient-trigger-prototype.html` — ambient-only prototype, before it was merged with the full flow.

## 8. Open items / things not yet decided

- How engagement is actually measured/counted (see §5) — anonymity vs. aggregate telemetry needs a real decision.
- Foot-traffic bloom's proximity threshold and cooldown decay need tuning against the real pose-detection model once there's hardware access — current cooldown (6s) is demo pacing only.
- Whether the passive social-proof ambient layer (deferred direction from the engagement-value brainstorm) gets built once real usage numbers exist.
- The full picker/reset/close flow is intentionally paused, not abandoned — reconnect once engagement itself is validated.
