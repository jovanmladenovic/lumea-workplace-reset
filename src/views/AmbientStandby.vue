<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import { useRouter } from 'vue-router';

  import { RoutePaths } from '@/router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import { useChime } from '@/composables/useChime';

  const router = useRouter();
  const { playChime } = useChime();

  const isElectron = typeof window !== 'undefined' && Boolean((window as unknown as { electronAPI?: unknown }).electronAPI);
  const presenceStatus = ref<'unavailable' | 'watching' | 'present'>('unavailable');

  // ---------- B: time-of-day pulse — clock-only, never personalized ----------
  type TimeMode = {
    color: string;
    glow: string;
    bg1: string;
    bg2: string;
    line: string;
    tag: string;
  };

  const TIME_MODES: Record<'regular' | 'postLunch' | 'mondayAm' | 'evening', TimeMode> = {
    regular: {
      color: '#e8a94c',
      glow: 'rgba(232,169,76,0.35)',
      bg1: '#1c1815',
      bg2: '#14110f',
      line: 'Standing by.',
      tag: 'Regular hours',
    },
    postLunch: {
      color: '#d97757',
      glow: 'rgba(217,119,87,0.4)',
      bg1: '#241a15',
      bg2: '#160f0c',
      line: 'Still here, if you need it.',
      tag: 'Post-lunch — 2:45pm',
    },
    mondayAm: {
      color: '#6b7fb3',
      glow: 'rgba(107,127,179,0.4)',
      bg1: '#171a24',
      bg2: '#0f1016',
      line: 'Easing into the week.',
      tag: 'Monday morning',
    },
    evening: {
      color: '#8a6fa3',
      glow: 'rgba(138,111,163,0.4)',
      bg1: '#1c1622',
      bg2: '#110d16',
      line: 'Winding down, too.',
      tag: 'Evening',
    },
  };

  function computeTimeMode(): TimeMode {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday
    const hour = now.getHours();
    const minutes = now.getMinutes();

    const isEvening = hour >= 18 || hour < 7;
    const isMondayMorning = day === 1 && hour >= 7 && hour < 11;
    const isPostLunchSlump = (hour === 14 && minutes >= 30) || (hour === 15 && minutes < 15);

    if (isEvening) return TIME_MODES.evening;
    if (isMondayMorning) return TIME_MODES.mondayAm;
    if (isPostLunchSlump) return TIME_MODES.postLunch;
    return TIME_MODES.regular;
  }

  const timeMode = ref<TimeMode>(computeTimeMode());
  const deviceBackground = computed(
    () => `radial-gradient(120% 90% at 50% 12%, ${timeMode.value.bg1} 0%, ${timeMode.value.bg2} 62%)`
  );
  let timeModeInterval: number | undefined;

  // ---------- A: foot-traffic bloom ----------
  const COOLDOWN_MS = 6000;
  const cooldownUntil = ref(0);
  const bloomPlaying = ref(false);
  const cooldownRemaining = ref(0);
  let cooldownStatusTimer: number | undefined;

  function triggerBloom(): void {
    const now = Date.now();
    if (now < cooldownUntil.value) return;

    bloomPlaying.value = false;
    requestAnimationFrame(() => {
      bloomPlaying.value = true;
    });
    playChime(0.05);

    cooldownUntil.value = now + COOLDOWN_MS;
    updateCooldownStatus();
  }

  function updateCooldownStatus(): void {
    const remaining = Math.max(0, Math.ceil((cooldownUntil.value - Date.now()) / 1000));
    cooldownRemaining.value = remaining;
    if (remaining > 0) {
      cooldownStatusTimer = window.setTimeout(updateCooldownStatus, 300);
    }
  }

  // ---------- C: approach -> engage ----------
  // Also fires from a direct tap (a real affordance if the mirror has a touch panel)
  // or the dev control below.
  const approaching = ref(false);
  let approachTimer: number | undefined;

  function handleApproach(): void {
    if (approaching.value) return; // already navigating to Engage
    approaching.value = true;
    playChime(0.06);
    approachTimer = window.setTimeout(() => {
      router.push(RoutePaths.Engage);
    }, 850);
  }

  // ---------- real presence sensor: @fitsee/user-tasks' PersonDetection ----------
  // Body-pose only (mediapipe landmarks), no face, no identity — see
  // src/services/person-detection.service.ts. It only reports present/missing, so
  // the bloom-vs-approach distinction is a dwell-time heuristic here: present only
  // briefly -> someone walked by (Tier A bloom); present past APPROACH_DWELL_MS ->
  // someone stopped (Tier C approach). APPROACH_DWELL_MS is a placeholder, not yet
  // tuned against real foot traffic — see README "Open items".
  const APPROACH_DWELL_MS = 1500;
  let dwellTimer: number | undefined;
  let stopListeningPresence: (() => void) | null = null;

  function handlePersonPresent(): void {
    presenceStatus.value = 'present';
    window.clearTimeout(dwellTimer);
    dwellTimer = window.setTimeout(() => {
      dwellTimer = undefined;
      handleApproach();
    }, APPROACH_DWELL_MS);
  }

  function handlePersonMissing(): void {
    presenceStatus.value = 'watching';
    const wasDwelling = dwellTimer !== undefined;
    window.clearTimeout(dwellTimer);
    dwellTimer = undefined;
    if (wasDwelling) {
      // present for less than APPROACH_DWELL_MS, then gone — a walk-by, not a stop
      triggerBloom();
    }
  }

  async function listenForPresence(): Promise<void> {
    const { personDetectionService, PersonDetectionEvents } = await import('@/services');
    const detector = await personDetectionService.onReady();

    presenceStatus.value = 'watching';
    detector.subscribe(PersonDetectionEvents.PERSON_PRESENT, handlePersonPresent);
    detector.subscribe(PersonDetectionEvents.PERSON_MISSING, handlePersonMissing);

    stopListeningPresence = () => {
      detector.unsubscribe(PersonDetectionEvents.PERSON_PRESENT, handlePersonPresent);
      detector.unsubscribe(PersonDetectionEvents.PERSON_MISSING, handlePersonMissing);
    };
  }

  onMounted(() => {
    timeModeInterval = window.setInterval(() => {
      timeMode.value = computeTimeMode();
    }, 60_000);

    if (isElectron) {
      listenForPresence();
    }
  });

  onBeforeUnmount(() => {
    window.clearInterval(timeModeInterval);
    window.clearTimeout(cooldownStatusTimer);
    window.clearTimeout(approachTimer);
    window.clearTimeout(dwellTimer);
    stopListeningPresence?.();
  });
</script>

<template>
  <DefaultLayout>
    <div
      class="ambient-standby"
      :style="{ background: deviceBackground, '--mode-color': timeMode.color, '--mode-glow': timeMode.glow }"
    >
      <div class="badge"><span class="dot"></span> Anonymous, always</div>

      <div class="standby-center" @click="handleApproach">
        <div class="orb-wrap">
          <div class="orb-ring"></div>
          <div class="orb-ring r2"></div>
          <div class="orb-ring r3"></div>
          <div class="orb-core" :class="{ approaching }"></div>
          <div class="bloom-ring" :class="{ play: bloomPlaying }" @animationend="bloomPlaying = false"></div>
        </div>
        <div class="standby-copy">
          <h2>{{ timeMode.line }}</h2>
          <p>A session starts the moment you step in.</p>
        </div>
      </div>

      <div class="mode-tag">{{ timeMode.tag }}</div>

      <!-- Dev/demo controls — real presence detection (PersonDetection) drives the
           bloom/approach automatically inside Electron; these stay as manual test
           aids and as the only trigger in the browser preview build. -->
      <div class="dev-controls">
        <span v-if="isElectron" class="dev-status">presence sensor: {{ presenceStatus }}</span>
        <button class="dev-btn" @click="triggerBloom">
          Simulate someone walking by{{ cooldownRemaining > 0 ? ` (${cooldownRemaining}s)` : '' }}
        </button>
        <button class="dev-btn accent" @click="handleApproach">Simulate stepping close</button>
      </div>
    </div>
  </DefaultLayout>
</template>

<style scoped>
  .ambient-standby {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Archivo', sans-serif;
    color: #f4efe7;
    transition: background 1.4s ease;
    overflow: hidden;
  }

  .badge {
    position: absolute;
    top: 42px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 11px;
    font-size: 17px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #c9c1b4;
    background: rgba(244, 239, 231, 0.05);
    border: 1px solid rgba(244, 239, 231, 0.12);
    padding: 13px 22px;
    border-radius: 100px;
  }
  .badge .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #7fa8a3;
    box-shadow: 0 0 8px #7fa8a3;
  }

  .standby-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .orb-wrap {
    position: relative;
    width: 352px;
    height: 352px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .orb-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px solid rgba(244, 239, 231, 0.12);
    animation: ring-breathe 6s ease-in-out infinite;
  }
  .orb-ring.r2 {
    inset: -42px;
    opacity: 0.5;
    animation-delay: 0.6s;
  }
  .orb-ring.r3 {
    inset: -84px;
    opacity: 0.25;
    animation-delay: 1.2s;
  }
  @keyframes ring-breathe {
    0%,
    100% {
      transform: scale(0.96);
      opacity: 0.35;
    }
    50% {
      transform: scale(1.04);
      opacity: 0.75;
    }
  }

  .orb-core {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: radial-gradient(
      circle at 38% 32%,
      color-mix(in srgb, var(--mode-color) 55%, white),
      var(--mode-color) 60%,
      color-mix(in srgb, var(--mode-color) 70%, black) 100%
    );
    box-shadow: 0 0 60px var(--mode-glow);
    animation: core-breathe 6s ease-in-out infinite;
    transition:
      background 1.4s ease,
      box-shadow 0.5s ease,
      transform 0.5s ease;
  }
  .orb-core.approaching {
    transform: scale(1.15);
    box-shadow: 0 0 90px var(--mode-glow);
  }
  @keyframes core-breathe {
    0%,
    100% {
      transform: scale(0.94);
    }
    50% {
      transform: scale(1.06);
    }
  }

  .bloom-ring {
    position: absolute;
    inset: 0;
    margin: auto;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    border: 1.5px solid var(--mode-color);
    opacity: 0;
    pointer-events: none;
  }
  .bloom-ring.play {
    animation: bloom 1.8s cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
  }
  @keyframes bloom {
    0% {
      opacity: 0.9;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(2.6);
    }
  }

  .standby-copy {
    margin-top: 64px;
    text-align: center;
  }
  .standby-copy h2 {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-style: italic;
    font-size: 29px;
    color: #f4efe7;
  }
  .standby-copy p {
    margin-top: 10px;
    font-size: 19px;
    color: #8c8378;
  }

  .mode-tag {
    position: absolute;
    bottom: 42px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 16px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--mode-color);
    opacity: 0.85;
  }

  .dev-controls {
    position: absolute;
    top: 18px;
    right: 18px;
    display: flex;
    flex-direction: column;
    gap: 9px;
    opacity: 0.55;
  }
  .dev-controls:hover {
    opacity: 1;
  }
  .dev-btn {
    all: unset;
    cursor: pointer;
    font-size: 15px;
    color: #c9c1b4;
    background: rgba(244, 239, 231, 0.06);
    border: 1px solid rgba(244, 239, 231, 0.12);
    padding: 9px 15px;
    border-radius: 100px;
    white-space: nowrap;
  }
  .dev-btn.accent {
    color: #7fa8a3;
  }
  .dev-status {
    font-size: 14px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #7fa8a3;
    text-align: right;
    padding-right: 2px;
  }
</style>
