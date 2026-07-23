<script setup lang="ts">
  import { ref, onBeforeUnmount } from 'vue';

  import { sleep } from '@/utils';
  import { PoseTasks } from '@/services';
  import { useTaskMonitoring } from '@/composables/useTaskMonitoring';

  import { BASE_ANIMATION_DURATION } from '@/constants';

  import ActivityStep from '@/components/ActivityStep.vue';
  import StackedMessages from '@/components/StackedMessages.vue';
  import AnimatedImages from '@/components/AnimatedImages.vue';
  import ProgressBar from '@/components/ProgressBar.vue';

  const stepRef = ref<InstanceType<typeof ActivityStep>>();
  const messagesRef = ref<InstanceType<typeof StackedMessages>>();
  const imagesRef = ref<InstanceType<typeof AnimatedImages>>();

  const animateIn = async () => {
    await stepRef.value?.animateIn();
    await sleep(BASE_ANIMATION_DURATION * 2);
    await messagesRef.value?.showMessage();
    await sleep(BASE_ANIMATION_DURATION * 2);
    await messagesRef.value?.showMessage();
    await sleep(BASE_ANIMATION_DURATION * 2);
    await Promise.all([imagesRef.value?.showNext(), startTimer()]);
  };

  const animateOut = async () => {
    return Promise.all([
      stepRef.value?.animateOut(),
      imagesRef.value?.animateOut(),
      progressBarRef.value?.animateOut(),
      messagesRef.value?.animateOut(),
    ]);
  };

  const messages = [
    {
      text: 'Now it’s <b>time to move:</b>',
      class: 'text-xl px-[140px]',
    },
    {
      text: 'Shadowbox for just 20 seconds.',
      class: 'text-xl px-[140px]',
    },
  ];

  const images = [
    {
      src: '/images/illustrations/Characters-04.svg',
    },
  ];

  const { startTaskMonitoring } = useTaskMonitoring();

  const emit = defineEmits(['done']);

  const handleStepDone = () => {
    emit('done');
  };

  const progressBarRef = ref<InstanceType<typeof ProgressBar>>();

  const timerLength = 20;

  let interval: number | null = null;

  const startTimer = async () => {
    startShadowBoxMonitoring();
    await progressBarRef.value?.animateIn();

    await sleep(BASE_ANIMATION_DURATION * 2);
    progressBarRef.value?.nextMessage();

    return progressBarRef.value?.start();
  };

  const cleanupInterval = () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  };

  const startShadowBoxMonitoring = async () => {
    await startTaskMonitoring(PoseTasks.ShadowBox);
  };

  onBeforeUnmount(() => {
    cleanupInterval();
  });

  defineExpose({ animateIn, animateOut });
</script>

<template>
  <ActivityStep ref="stepRef" step="5/5" title="Energy activation">
    <StackedMessages ref="messagesRef" :messages="messages" />

    <ProgressBar
      :length="timerLength"
      ref="progressBarRef"
      @done="handleStepDone"
      class="absolute top-[650px] z-10 left-0 right-0"
      bg-classes="bg-[#7F807F]/30"
      bar-classes="bg-[#698677]"
      :messages="['Get ready.', 'Go for it!']"
    >
      Get ready.
    </ProgressBar>

    <AnimatedImages ref="imagesRef" :images="images" />
  </ActivityStep>
</template>
