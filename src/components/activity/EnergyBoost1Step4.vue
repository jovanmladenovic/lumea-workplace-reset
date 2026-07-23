<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { utils } from 'animejs';

  import { sleep, animate } from '@/utils';
  import { BASE_ANIMATION_DURATION } from '@/constants';
  import ActivityStep from '@/components/ActivityStep.vue';
  import StackedMessages from '@/components/StackedMessages.vue';

  const stepRef = ref<InstanceType<typeof ActivityStep>>();
  const messagesRef = ref<InstanceType<typeof StackedMessages>>();
  const pulseCircleRef = ref();

  const animateIn = async () => {
    await stepRef.value?.animateIn();
    await sleep(BASE_ANIMATION_DURATION * 2);
    await messagesRef.value?.showMessage();
    await sleep(BASE_ANIMATION_DURATION * 2);
    await Promise.all([
      messagesRef.value?.showMessage(),
      animate(pulseCircleRef.value, {
        opacity: [0, 1],
      }),
    ]);

    await sleep(BASE_ANIMATION_DURATION * 2);

    return animate(pulseCircleRef.value, {
      scale: [1, 0.5, 1],
      duration: BASE_ANIMATION_DURATION * 3,
      easing: 'easeInOutQuint',
      loop: 2,
    });
  };

  onMounted(() => {
    utils.set(pulseCircleRef.value, {
      opacity: 0,
    });
  });

  const animateOut = async () => {
    return Promise.all([
      stepRef.value?.animateOut(),
      messagesRef.value?.animateOut(),
      animate(pulseCircleRef.value, {
        opacity: 0,
      }),
    ]);
  };

  const messages = [
    {
      text: `Say to yourself:`,
      class: 'text-xl px-[140px]',
    },
    {
      text: `“I am capable. I bring value. I am ready.”`,
      class: 'text-3xl px-[140px] mt-[32px] font-bold font-raleway',
    },
  ];

  defineExpose({ animateIn, animateOut });
</script>

<template>
  <ActivityStep ref="stepRef" step="4/5" title="Identity Affirmation">
    <StackedMessages ref="messagesRef" :messages="messages" />
    <img ref="pulseCircleRef" class="w-full" src="/images/pulse-circle.png" alt="Pulse Circle" />
  </ActivityStep>
</template>
