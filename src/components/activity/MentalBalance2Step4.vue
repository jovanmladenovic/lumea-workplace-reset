<script setup lang="ts">
  import { ref } from 'vue';

  import { sleep } from '@/utils';
  import { BASE_ANIMATION_DURATION } from '@/constants';
  import { PoseTasks } from '@/services/PoseTasks';
  import { useTaskMonitoring } from '@/composables/useTaskMonitoring';
  import ActivityStep from '@/components/ActivityStep.vue';
  import StackedMessages from '@/components/StackedMessages.vue';
  import AnimatedImages from '@/components/AnimatedImages.vue';
  import Confirm from '@/components/Confirm.vue';

  const stepRef = ref<InstanceType<typeof ActivityStep>>();
  const messagesRef = ref<InstanceType<typeof StackedMessages>>();
  const animatedImagesRef = ref<InstanceType<typeof AnimatedImages>>();

  const { startTaskMonitoring } = useTaskMonitoring();

  const animateIn = async () => {
    await stepRef.value?.animateIn();
    startTaskMonitoring(PoseTasks.StretchInhale);

    await sleep(BASE_ANIMATION_DURATION * 2);
    await Promise.all([messagesRef.value?.showMessage(), animatedImagesRef.value?.showNext()]);
    await sleep(BASE_ANIMATION_DURATION * 2);
    await messagesRef.value?.showMessage();
    await sleep(BASE_ANIMATION_DURATION * 10);
    await animatedImagesRef.value?.animateOut();

    await showConfirm();
  };

  const animateOut = async () => {
    return Promise.all([
      stepRef.value?.animateOut(),
      confirmRef.value?.animateOut(),
      messagesRef.value?.animateOut(),
      animatedImagesRef.value?.animateOut(),
    ]);
  };

  const messages = [
    {
      text: `Now take <b>a long inhale</b>, stretch up, and then exhale.`,
      class: 'text-xl px-[140px] pb-2',
    },
    {
      text: 'Repeat this <b>3 times</b>.',
      class: 'text-xl px-[140px] pb-4',
    },
  ];

  const confirmRef = ref<InstanceType<typeof Confirm>>();
  const confirmResolve = ref();

  const showConfirm = async () => {
    await confirmRef.value?.animateIn();
    return new Promise<void>(resolve => {
      confirmResolve.value = resolve;
    });
  };

  defineExpose({ animateIn, animateOut });
</script>

<template>
  <ActivityStep ref="stepRef" step="4/5" title="Deep breaths">
    <StackedMessages ref="messagesRef" :messages="messages" />
    <AnimatedImages
      ref="animatedImagesRef"
      class="absolute top-[840px] z-10 left-0 right-0"
      :images="[
        {
          src: '/images/illustrations/Characters-20.svg',
        },
      ]"
    />
    <Confirm
      ref="confirmRef"
      @confirm="confirmResolve"
      class="absolute top-[924px] z-10 left-0 right-0"
      active-image-url="/images/icons/icons-hand-ok-selected.svg"
      selected-image-url="/images/icons/icons-hand-ok-selected.svg"
      >Ready to continue?</Confirm
    >
  </ActivityStep>
</template>
