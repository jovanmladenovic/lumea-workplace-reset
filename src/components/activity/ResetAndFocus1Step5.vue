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
    await sleep(BASE_ANIMATION_DURATION * 2);
    await Promise.all([messagesRef.value?.showMessage(), imagesRef.value?.showNext()]);
    await sleep(BASE_ANIMATION_DURATION * 4);
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
      text: 'Look at yourself and say quietly:',
      class: 'text-xl px-[140px]',
    },
    {
      text: '“I am focused. I am capable. I am in control.”',
      class: 'text-3xl px-[140px] font-bold font-raleway',
    },
  ];

  const images = [
    {
      src: '/images/illustrations/Characters-15.svg',
    },
    {
      src: '/images/illustrations/Characters-16.svg',
    },
  ];

  defineExpose({ animateIn, animateOut });
</script>

<template>
  <ActivityStep ref="stepRef" step="5/5" title="Affirmation">
    <StackedMessages ref="messagesRef" :messages="messages" />

    <AnimatedImages ref="imagesRef" :images="images" />
  </ActivityStep>
</template>
