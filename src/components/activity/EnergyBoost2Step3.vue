<script setup lang="ts">
  import { ref } from 'vue';

  import { sleep } from '@/utils';
  import { BASE_ANIMATION_DURATION } from '@/constants';

  import ActivityStep from '@/components/ActivityStep.vue';
  import StackedMessages from '@/components/StackedMessages.vue';
  import AnimatedImages from '@/components/AnimatedImages.vue';

  const stepRef = ref<InstanceType<typeof ActivityStep>>();
  const messagesRef = ref<InstanceType<typeof StackedMessages>>();
  const imagesRef = ref<InstanceType<typeof AnimatedImages>>();

  let canceled = false;

  const animateIn = async () => {
    await stepRef.value?.animateIn();
    await sleep(BASE_ANIMATION_DURATION * 2);
    await Promise.all([messagesRef.value?.showMessage(), imagesRef.value?.showNext()]);
    await sleep(BASE_ANIMATION_DURATION * 4);
    await Promise.all([messagesRef.value?.showMessage(), imagesRef.value?.showNext()]);
    await sleep(BASE_ANIMATION_DURATION * 4);
    await messagesRef.value?.showMessage();
    await sleep(BASE_ANIMATION_DURATION * 2);
  };

  const animateOut = async () => {
    canceled = true;
    return Promise.all([
      stepRef.value?.animateOut(),
      messagesRef.value?.animateOut(),
      imagesRef.value?.animateOut(),
    ]);
  };

  const messages = [
    {
      text: 'Now bring your attention to <b>one thing</b> you’re proud of today, even something small.',
      class: 'text-xl px-[140px]',
    },
    {
      text: 'You’ve already done something <b>that matters</b>.',
      class: 'text-xl px-[140px]',
    },
    {
      text: 'Let’s build from that, not start from scratch.',
      class: 'text-lg px-[140px]',
    },
  ];

  const images = [
    {
      src: '/images/illustrations/Characters-23.svg',
    },
    {
      src: '/images/illustrations/Characters-24.svg',
    },
  ];

  defineExpose({ animateIn, animateOut });
</script>

<template>
  <ActivityStep ref="stepRef" step="3/5" title="Mental Refresh">
    <StackedMessages ref="messagesRef" :messages="messages" />

    <AnimatedImages ref="imagesRef" :images="images" />
  </ActivityStep>
</template>
