<script setup lang="ts">
  import { ref } from 'vue';

  import { sleep } from '@/utils';
  import { BASE_ANIMATION_DURATION } from '@/constants';
  import { PoseTasks } from '@/services';
  import { useTaskMonitoring } from '@/composables/useTaskMonitoring';
  import ActivityStep from '@/components/ActivityStep.vue';
  import StackedMessages from '@/components/StackedMessages.vue';
  import AnimatedImages from '@/components/AnimatedImages.vue';
  import ProgressBar from '@/components/ProgressBar.vue';

  const stepRef = ref<InstanceType<typeof ActivityStep>>();
  const messagesRef = ref<InstanceType<typeof StackedMessages>>();
  const messagesRef2 = ref<InstanceType<typeof StackedMessages>>();
  const imagesRef = ref<InstanceType<typeof AnimatedImages>>();

  let canceled = false;

  const animateIn = async () => {
    await stepRef.value?.animateIn();
    await sleep(BASE_ANIMATION_DURATION * 2);
    startTaskMonitoring(PoseTasks.PowerPose);
    await showNext();
    await sleep(BASE_ANIMATION_DURATION * 2);
    await showNext();
    await sleep(BASE_ANIMATION_DURATION * 2);
    await showNext();
    await sleep(BASE_ANIMATION_DURATION * 2);
    await startTimer();
    return progressBarRef.value?.nextMessage();
  };

  const animateOut = async () => {
    canceled = true;
    return Promise.all([
      stepRef.value?.animateOut(),
      messagesRef2.value?.animateOut(),
      imagesRef.value?.animateOut(),
      progressBarRef.value?.animateOut(),
    ]);
  };

  const showNext = () => {
    return Promise.all([messagesRef.value?.showMessage(), imagesRef.value?.showNext()]);
  };

  const messages = [
    {
      text: 'Stand tall.',
      class: 'text-xl px-[140px]',
    },
    {
      text: 'Hands on hips.',
      class: 'text-xl px-[140px]',
    },
    {
      text: 'Chin up.',
      class: 'text-xl px-[140px]',
    },
  ];

  const messages2 = [
    {
      text: 'Feel the shift in posture, and your power rising.',
      class: 'text-xl px-[140px]',
    },
  ];

  const images = [
    {
      src: '/images/illustrations/Characters-01.svg',
    },
    {
      src: '/images/illustrations/Characters-02.svg',
    },
    {
      src: '/images/illustrations/Characters-03.svg',
    },
  ];

  const { startTaskMonitoring } = useTaskMonitoring();

  const emit = defineEmits(['done']);

  const handleStepDone = () => {
    emit('done');
  };

  const progressBarRef = ref<InstanceType<typeof ProgressBar>>();

  const timerLength = 20;

  const startTimer = async () => {
    await progressBarRef.value?.animateIn();

    sleep((timerLength / 2) * BASE_ANIMATION_DURATION).then(() => {
      if (canceled) return;
      messagesRef.value?.animateOut();
      messagesRef2.value?.showMessage();
    });
    return progressBarRef.value?.start();
  };

  defineExpose({ animateIn, animateOut });
</script>

<template>
  <ActivityStep ref="stepRef" step="2/5" title="Quick Exercise">
    <StackedMessages ref="messagesRef" :messages="messages" />
    <StackedMessages
      ref="messagesRef2"
      :messages="messages2"
      class="absolute top-[400px] z-10 left-0 right-0"
    />

    <ProgressBar
      :length="timerLength"
      ref="progressBarRef"
      @done="handleStepDone"
      class="absolute top-[650px] z-10 left-0 right-0"
      bgClasses="bg-[#EAEAEA]/30"
      barClasses="bg-[#EEE399]"
      :messages="[`Hold for ${timerLength} seconds.`, 'Done!']"
    />

    <AnimatedImages ref="imagesRef" :images="images" />
  </ActivityStep>
</template>
