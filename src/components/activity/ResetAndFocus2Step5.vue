<script setup lang="ts">
  import { ref } from 'vue';

  import { sleep } from '@/utils';
  import { BASE_ANIMATION_DURATION } from '@/constants';

  import ActivityStep from '@/components/ActivityStep.vue';
  import StackedMessages from '@/components/StackedMessages.vue';
  import AnimatedImages from '@/components/AnimatedImages.vue';

  const stepRef = ref<InstanceType<typeof ActivityStep>>();
  const messagesRef = ref<InstanceType<typeof StackedMessages>>();
  const messagesRef2 = ref<InstanceType<typeof StackedMessages>>();

  const imagesRef = ref<InstanceType<typeof AnimatedImages>>();

  let canceled = false;

  const animateIn = async () => {
    await stepRef.value?.animateIn();
    await sleep(BASE_ANIMATION_DURATION * 2);
    await Promise.all([messagesRef.value?.showMessage(), imagesRef.value?.showNext()]);
    await sleep(BASE_ANIMATION_DURATION * 4);
    await Promise.all([messagesRef.value?.showMessage(), imagesRef.value?.showNext()]);
    await sleep(BASE_ANIMATION_DURATION * 3);
    await Promise.all([messagesRef2.value?.showMessage(), messagesRef.value.animateOut()]);
  };

  const animateOut = async () => {
    canceled = true;
    return Promise.all([
      stepRef.value?.animateOut(),
      messagesRef2.value?.animateOut(),
      imagesRef.value?.animateOut(),
    ]);
  };

  const messages = [
    {
      text: '<b>Visualize</b> the outcome of this idea coming to life.',
      class: 'text-xl px-[140px]',
    },
    {
      text: 'Notice <b>the energy</b> in that vision.',
      class: 'text-xl px-[140px]',
    },
  ];

  const messages2 = [
    {
      text: 'Creativity is energy in motion and you just made yours happen!',
      class: 'text-xl px-[140px]',
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
  <ActivityStep ref="stepRef" step="5/5" title="Future Vision">
    <StackedMessages ref="messagesRef" :messages="messages" />
    <StackedMessages
      ref="messagesRef2"
      :messages="messages2"
      class="absolute top-[400px] z-10 left-0 right-0"
    />

    <AnimatedImages ref="imagesRef" :images="images" />
  </ActivityStep>
</template>
