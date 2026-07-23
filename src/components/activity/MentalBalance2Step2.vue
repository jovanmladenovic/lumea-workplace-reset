<script setup lang="ts">
  import { ref } from 'vue';

  import { sleep } from '@/utils';
  import { BASE_ANIMATION_DURATION } from '@/constants';
  import ActivityStep from '@/components/ActivityStep.vue';
  import StackedMessages from '@/components/StackedMessages.vue';
  import Confirm from '@/components/Confirm.vue';

  const stepRef = ref<InstanceType<typeof ActivityStep>>();
  const messagesRef = ref<InstanceType<typeof StackedMessages>>();

  const animateIn = async () => {
    await stepRef.value?.animateIn();

    await sleep(BASE_ANIMATION_DURATION * 2);
    await showNext();

    await sleep(BASE_ANIMATION_DURATION);
    await showNext();

    await sleep(BASE_ANIMATION_DURATION * 2);
    await showNext();

    await sleep(BASE_ANIMATION_DURATION * 5);
    await showNext();

    await sleep(BASE_ANIMATION_DURATION * 2);
    await showNext();

    await showConfirm();
  };

  const animateOut = async () => {
    return Promise.all([
      stepRef.value?.animateOut(),
      confirmRef.value?.animateOut(),
      messagesRef.value?.animateOut(),
    ]);
  };

  const showNext = () => {
    return messagesRef.value?.showMessage();
  };

  const messages = [
    {
      text: `Let’s try something first:`,
      class: 'text-xl px-[140px] pb-2',
    },
    {
      text: 'Look at your reflection.',
      class: 'text-xl px-[140px] pb-4',
    },
    {
      text: 'Notice and name <b>3 things you</b> see.',
      class: 'text-xl px-[140px] pb-2',
    },
    {
      text: 'You are now in the present.',
      class: 'text-xl px-[140px]',
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
  <ActivityStep ref="stepRef" step="2/5" title="Micro-Gratitude">
    <StackedMessages ref="messagesRef" :messages="messages" />
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
