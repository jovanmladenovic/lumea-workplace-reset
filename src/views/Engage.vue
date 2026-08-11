<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { useRouter } from 'vue-router';

  import { RoutePaths } from '@/router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import { useChime } from '@/composables/useChime';
  import { TEASERS } from '@/constants/teasers';

  const router = useRouter();
  const { playChime } = useChime();

  // Guards real-hardware calls: @/services touches window.electronAPI.env at import
  // time (see src/constants/env.constants.ts), which only exists inside the Electron
  // app. Dynamic-importing it only when isElectron is true keeps this screen safe to
  // mount in a plain browser (GitHub Pages preview build) too.
  const isElectron = typeof window !== 'undefined' && Boolean((window as unknown as { electronAPI?: unknown }).electronAPI);

  const confirmed = ref(false);
  const line = ref('Thanks for stopping by.');
  const sub = ref('A quick thumbs up is all we need.');

  // Fade+scale in on mount, fade+scale out before handing back to AmbientStandby —
  // mirrors the same transition pattern used there instead of a hard cut.
  const entering = ref(true);
  const leaving = ref(false);
  const LEAVE_TRANSITION_MS = 480;

  let returnTimer: number | undefined;
  let leaveTransitionTimer: number | undefined;
  let stopListening: (() => void) | null = null;

  function confirmEngagement(): void {
    const teaser = TEASERS[Math.floor(Math.random() * TEASERS.length)];

    confirmed.value = true;
    line.value = 'Good to see you.';
    sub.value = teaser;
    playChime(0.07);

    window.clearTimeout(returnTimer);
    returnTimer = window.setTimeout(() => {
      leaving.value = true;
      leaveTransitionTimer = window.setTimeout(() => {
        router.push(RoutePaths.AmbientStandby);
      }, LEAVE_TRANSITION_MS);
    }, 4200);
  }

  async function listenForThumbsUp(): Promise<void> {
    const { userInput } = await import('@/services');
    const { InputEmitEvents, InputReceiveEvents } = await import('@/utils');

    // Reuses the existing thumbs-up gesture mapping already wired for 'confirm'/'yes'
    // in src/services/user-input.service.ts (ConfirmSelectOptionsToGesturesMappings).
    userInput.emit(InputEmitEvents.request_user_input, { type: 'confirm', options: ['yes'] });

    const handler = () => confirmEngagement();
    userInput.on(InputReceiveEvents.user_input, handler);
    stopListening = () => userInput.off(InputReceiveEvents.user_input, handler);
  }

  onMounted(() => {
    if (isElectron) {
      listenForThumbsUp();
    }

    requestAnimationFrame(() => {
      entering.value = false;
    });
  });

  onBeforeUnmount(() => {
    window.clearTimeout(returnTimer);
    window.clearTimeout(leaveTransitionTimer);
    stopListening?.();
  });
</script>

<template>
  <DefaultLayout>
    <div class="engage" :class="{ entering, leaving }">
      <div class="engage-orb-wrap" :class="{ confirmed }">
        <div class="engage-ring"></div>
        <div class="engage-orb"></div>
        <svg class="engage-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3zM7 10l4.5-6.5a1.5 1.5 0 0 1 2.7.9V9h5.1a2 2 0 0 1 1.98 2.3l-1.2 8A2 2 0 0 1 18.1 21H10a3 3 0 0 1-3-3v-8z" />
        </svg>
      </div>
      <h2>{{ line }}</h2>
      <p>{{ sub }}</p>

      <!-- No Electron hand-gesture hardware available (plain-browser preview, or dev
           machine without the camera pipeline) — fall back to a manual confirm. -->
      <button v-if="!isElectron" class="dev-btn" @click="confirmEngagement">Simulate thumbs up</button>
    </div>
  </DefaultLayout>
</template>

<style scoped>
  .engage {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 40px;
    font-family: 'Archivo', sans-serif;
    color: #f4efe7;
    background: radial-gradient(120% 90% at 50% 12%, #1c1815 0%, #14110f 62%);
    opacity: 1;
    transform: scale(1);
    transition:
      opacity 0.48s cubic-bezier(0.2, 0.7, 0.3, 1),
      transform 0.48s cubic-bezier(0.2, 0.7, 0.3, 1);
  }
  .engage.entering {
    opacity: 0;
    transform: scale(0.96);
  }
  .engage.leaving {
    opacity: 0;
    transform: scale(1.04);
  }

  .engage-orb-wrap {
    position: relative;
    width: 250px;
    height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .engage-ring {
    position: absolute;
    inset: -34px;
    border-radius: 50%;
    border: 1px solid rgba(244, 239, 231, 0.12);
    opacity: 0.5;
    transition:
      opacity 0.5s ease,
      transform 0.5s ease;
  }
  .engage-orb {
    width: 208px;
    height: 208px;
    border-radius: 50%;
    background: radial-gradient(circle at 38% 32%, #f7cf8e, #c8934a 60%, #8a6530 100%);
    box-shadow: 0 0 30px rgba(232, 169, 76, 0.18);
    opacity: 0.55;
    transition:
      box-shadow 0.6s ease,
      transform 0.6s ease,
      opacity 0.6s ease;
  }
  .engage-orb-wrap.confirmed .engage-orb {
    opacity: 1;
    box-shadow: 0 0 70px rgba(232, 169, 76, 0.5);
    transform: scale(1.12);
  }
  .engage-orb-wrap.confirmed .engage-ring {
    opacity: 0.9;
    transform: scale(1.15);
  }
  .engage-icon {
    position: absolute;
    width: 62px;
    height: 62px;
    color: #14110f;
    opacity: 0.8;
    transition: transform 0.3s ease;
  }
  .engage-orb-wrap.confirmed .engage-icon {
    transform: scale(1.1) rotate(-6deg);
  }

  h2 {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-style: italic;
    font-size: 39px;
    margin-top: 49px;
    min-height: 55px;
  }
  p {
    margin-top: 21px;
    font-size: 25px;
    line-height: 1.55;
    color: #8c8378;
    max-width: 559px;
    min-height: 75px;
  }

  .dev-btn {
    all: unset;
    cursor: pointer;
    margin-top: 38px;
    font-size: 22px;
    color: #c9c1b4;
    background: rgba(244, 239, 231, 0.06);
    border: 1px solid rgba(244, 239, 231, 0.12);
    padding: 17px 34px;
    border-radius: 100px;
  }
</style>
