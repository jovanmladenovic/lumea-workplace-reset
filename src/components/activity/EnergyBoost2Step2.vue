<script setup lang="ts">
  import { computed, ref } from 'vue';

  import { sleep } from '@/utils';
  import { BASE_ANIMATION_DURATION } from '@/constants';
  import { PoseTasks } from '@/services';
  import { useTaskMonitoring } from '@/composables/useTaskMonitoring';
  import ActivityStep from '@/components/ActivityStep.vue';
  import StackedMessages from '@/components/StackedMessages.vue';
  import AnimatedImages from '@/components/AnimatedImages.vue';
  const ROUNDS = 3;

  const stepRef = ref<InstanceType<typeof ActivityStep>>();
  const messagesRef = ref<InstanceType<typeof StackedMessages>>();
  const messagesRef2 = ref<InstanceType<typeof StackedMessages>>();
  const imagesRef = ref<InstanceType<typeof AnimatedImages>>();
  const round = ref(1);

  let canceled = false;

  const { startTaskMonitoring } = useTaskMonitoring();

  const animateRound = async () => {
    await Promise.all([messagesRef.value?.showMessage(), imagesRef.value?.showNext()]);
    await sleep(BASE_ANIMATION_DURATION * 2);
    await Promise.all([messagesRef.value?.showMessage(), imagesRef.value?.showNext()]);
    await sleep(BASE_ANIMATION_DURATION * 2);
    await Promise.all([messagesRef.value?.showMessage(), imagesRef.value?.showNext()]);
    await sleep(BASE_ANIMATION_DURATION * 2);
    await Promise.all([
      messagesRef.value?.animateOut(),
      messagesRef2.value?.showMessage(),
      imagesRef.value?.showNext(),
    ]);
    await sleep(BASE_ANIMATION_DURATION * 2);
    await messagesRef2.value?.showMessage();
    await sleep(BASE_ANIMATION_DURATION * 3);
    await messagesRef2.value?.animateOut();
    return sleep(BASE_ANIMATION_DURATION * 2);
  };

  const resetAll = async () => {
    await Promise.all([
      messagesRef.value?.reset?.(),
      messagesRef2.value?.reset?.(),
      imagesRef.value?.reset?.(),
    ]);
  };

  const animateIn = async () => {
    await stepRef.value?.animateIn();
    await sleep(BASE_ANIMATION_DURATION * 2);
    await resetAll();
    startTaskMonitoring(PoseTasks.BodyActivation);
    await animateRound();
    round.value++;
    await resetAll();
    await animateRound();
    round.value++;
    await resetAll();
    await animateRound();
    round.value++;
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
      text: 'Stand tall.',
      class: 'text-xl px-[140px]',
    },
    {
      text: 'Roll your shoulders.',
      class: 'text-xl px-[140px]',
    },
    {
      text: 'Shake out your arms for 3 seconds.',
      class: 'text-xl px-[140px]',
    },
  ];

  const messages2 = computed(() => {
    const remaining = Math.max(ROUNDS - round.value, 0);

    const arr = [
      {
        text: 'Now, take one strong breath in, stretch up, and sigh it out.',
        class: 'text-xl px-[140px]',
      },
    ] as { text: string; class?: string }[];

    if (remaining > 0) {
      const plural = remaining === 1 ? 'time' : 'times';
      arr.push({
        text: `Let’s repeat everything ${remaining} more ${plural}.`,
        class: 'text-lg px-[140px]',
      });
    } else {
      arr.push({
        text: '<b>Done.</b>',
        class: 'text-lg px-[140px]',
      });
    }

    return arr;
  });

  const images = [
    {
      src: '/images/illustrations/boost-2-1.svg',
    },
    {
      src: '/images/illustrations/boost-2-2.svg',
    },
    {
      src: '/images/illustrations/boost-2-3.svg',
    },
    {
      src: '/images/illustrations/boost-2-4.svg',
    },
  ];

  defineExpose({ animateIn, animateOut });
</script>

<template>
  <ActivityStep ref="stepRef" step="2/5" title="Body Activation">
    <StackedMessages ref="messagesRef" :messages="messages" />
    <StackedMessages
      ref="messagesRef2"
      :messages="messages2"
      class="absolute top-[400px] z-10 left-0 right-0"
    />

    <AnimatedImages ref="imagesRef" :images="images" />
  </ActivityStep>
</template>
