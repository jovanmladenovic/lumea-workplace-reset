<script setup lang="ts">
  import { ref } from 'vue';

  import { animate, sleep } from '@/utils';
  import { BASE_ANIMATION_DURATION } from '@/constants';

  import Animation from '../Animation.vue';

  const inhaleRef = ref<HTMLElement | null>(null);
  const exhaleRef = ref<HTMLElement | null>(null);
  const lungRef = ref<HTMLElement | null>(null);
  const animationRef = ref<InstanceType<typeof Animation>>();

  const animateIn = () => {
    return animationRef.value?.animateIn();
  };

  const animateRound = async () => {
    await animate(inhaleRef.value, {
      opacity: 1,
      duration: BASE_ANIMATION_DURATION,
      easing: 'easeInOutQuad',
    });

    await animate([lungRef.value, inhaleRef.value], {
      scale: 1.2,
      duration: BASE_ANIMATION_DURATION * 5,
      easing: 'easeInOutQuad',
    });

    animate(inhaleRef.value, {
      opacity: 0.3,
      scale: 1,
      duration: BASE_ANIMATION_DURATION / 2,
      easing: 'easeInOutQuad',
    });

    animate(exhaleRef.value, {
      opacity: 1,
      duration: BASE_ANIMATION_DURATION,
      easing: 'easeInOutQuad',
    });

    await animate(lungRef.value, {
      scale: 1,
      duration: BASE_ANIMATION_DURATION * 3,
      easing: 'easeInOutQuad',
    });

    animate(exhaleRef.value, {
      opacity: 0.3,
      duration: BASE_ANIMATION_DURATION,
      easing: 'easeInOutQuad',
    });
  };

  const animateOut = () => {
    return animationRef.value?.animateOut();
  };

  defineExpose({ animateIn, animateOut, animateRound });

  const textClasses = 'text-xxl text-black font-bold opacity-30';
</script>

<template>
  <Animation
    ref="animationRef"
    ignore-mount
    class="absolute top-[750px] left-1/2 transform -translate-x-1/2 space-y-10"
  >
    <div ref="inhaleRef" :class="textClasses">Inhale</div>
    <div class="flex flex-row items-center justify-center space-x-10">
      <img ref="lungRef" src="/images/illustrations/lungs-small.svg" alt="Lungs" />
    </div>
    <div ref="exhaleRef" :class="textClasses">Exhale</div>
  </Animation>
</template>
