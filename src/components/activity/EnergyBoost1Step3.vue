<script setup lang="ts">
  import { ref, onBeforeUnmount } from 'vue';
  import { useRouter } from 'vue-router';

  import { sleep } from '@/utils';
  import { faceRecognition } from '@/services';
  import { BASE_ANIMATION_DURATION } from '@/constants';
  import { FaceRecognitionEvents } from '@/services/face-recognition.service';
  import ActivityStep from '@/components/ActivityStep.vue';
  import StackedMessages from '@/components/StackedMessages.vue';
  import Confirm from '@/components/Confirm.vue';
  import { RoutePaths } from '@/router';

  const router = useRouter();
  const stepRef = ref<InstanceType<typeof ActivityStep>>();
  const messagesRef = ref<InstanceType<typeof StackedMessages>>();
  const messagesRef2 = ref<InstanceType<typeof StackedMessages>>();

  const animateIn = async () => {
    await stepRef.value?.animateIn();

    await sleep(BASE_ANIMATION_DURATION * 2);
    await showNext();

    await sleep(BASE_ANIMATION_DURATION * 3);
    await showNext();

    await sleep(BASE_ANIMATION_DURATION * 3);
    await showConfirm();

    faceRecognition.pauseMonitoring();
    faceRecognition.startInactivityTimer();
    faceRecognition.on(FaceRecognitionEvents.INACTIVITY_WARNING, () => {
      router.push(`${RoutePaths.Inactive}?returnPath=${RoutePaths.EnergyBoost1}?step=4`);
    });

    await sleep(BASE_ANIMATION_DURATION);
    await animateNextStep();

    await sleep(BASE_ANIMATION_DURATION * 3);
    await messagesRef2.value?.showMessage();
    await sleep(BASE_ANIMATION_DURATION * 3);

    await showConfirm();
    faceRecognition.resumeMonitoring();
    faceRecognition.stopInactivityTimer();
  };

  const confirmRef = ref<InstanceType<typeof Confirm>>();
  const confirmResolve = ref();

  const showConfirm = async () => {
    await confirmRef.value?.animateIn();
    return new Promise<void>(resolve => {
      confirmResolve.value = resolve;
    });
  };

  const animateNextStep = async () => {
    await Promise.all([
      messagesRef.value?.animateOut(),
      confirmRef.value?.animateOut(),
      messagesRef2.value?.showMessage(),
    ]);
  };

  const handleConfirm = () => {
    confirmResolve.value();
  };

  const animateOut = async () => {
    return Promise.all([
      stepRef.value?.animateOut(),
      messagesRef2.value?.animateOut(),
      confirmRef.value?.animateOut(),
    ]);
  };

  const showNext = () => {
    return Promise.all([messagesRef.value?.showMessage()]);
  };

  const messages = [
    {
      text: `Remember <b>3 things</b> you’ve already achieved.`,
      class: 'text-xl px-[140px]',
    },
    {
      text: 'Big or small - just real.',
      class: 'text-xl px-[140px]',
    },
  ];

  const messages2 = [
    {
      text: `Now <b>memorize</b> or <b>write them down</b> on a piece of paper found next to you.`,
      class: 'text-xl px-[140px]',
    },
    {
      text: `<b>Breathe in</b> that feeling of achievement.`,
      class: 'text-xl px-[140px]',
    },
  ];

  onBeforeUnmount(() => {
    faceRecognition.off(FaceRecognitionEvents.INACTIVITY_WARNING);
    faceRecognition.stopInactivityTimer();
  });

  defineExpose({ animateIn, animateOut });
</script>

<template>
  <ActivityStep ref="stepRef" step="3/5" title="Micro-Gratitude">
    <StackedMessages ref="messagesRef" :messages="messages" />
    <StackedMessages
      ref="messagesRef2"
      :messages="messages2"
      class="absolute top-[400px] z-10 left-0 right-0"
    />
    <Confirm
      ref="confirmRef"
      @confirm="handleConfirm"
      class="absolute top-[924px] z-10 left-0 right-0"
      active-image-url="/images/icons/icons-hand-ok-selected.svg"
      selected-image-url="/images/icons/icons-hand-ok-selected.svg"
      >Ready to continue?</Confirm
    >
  </ActivityStep>
</template>
