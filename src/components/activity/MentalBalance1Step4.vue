<script setup lang="ts">
  import { ref } from 'vue';

  import { sleep } from '@/utils';
  import { BASE_ANIMATION_DURATION } from '@/constants';

  import ActivityStep from '@/components/ActivityStep.vue';
  import StackedMessages from '@/components/StackedMessages.vue';
  import AnimatedImages from '@/components/AnimatedImages.vue';
  import Confirm from '@/components/Confirm.vue';

  const stepRef = ref<InstanceType<typeof ActivityStep>>();
  const messagesRef = ref<InstanceType<typeof StackedMessages>>();
  const imagesRef = ref<InstanceType<typeof AnimatedImages>>();
  const confirmRef = ref<InstanceType<typeof Confirm>>();
  const confirmResolve = ref();

  const showConfirm = async () => {
    await confirmRef.value?.animateIn();
    return new Promise<void>(resolve => {
      confirmResolve.value = resolve;
    });
  };

  const DURATION = 20;

  let canceled = false;

  const animateIn = async () => {
    await stepRef.value?.animateIn();
    await sleep(BASE_ANIMATION_DURATION * 2);
    await Promise.all([messagesRef.value?.showMessage(), imagesRef.value?.showNext()]);
    await sleep(BASE_ANIMATION_DURATION * 2);
    await Promise.all([messagesRef.value?.showMessage(), imagesRef.value?.showNext()]);
    await sleep(BASE_ANIMATION_DURATION * DURATION);
    await messagesRef.value?.showMessage();
    await sleep(BASE_ANIMATION_DURATION * 2);
    await imagesRef.value?.animateOut();
    await showConfirm();
  };

  const animateOut = async () => {
    canceled = true;
    return Promise.all([
      stepRef.value?.animateOut(),
      messagesRef.value?.animateOut(),
      confirmRef.value?.animateOut(),
    ]);
  };

  const messages = [
    {
      text: `Start counting to ${DURATION}, in your mind.`,
      class: 'text-xl px-[140px]',
    },
    {
      text: 'Now, close your eyes and just let yourself <b>be in the moment</b>.',
      class: 'text-xl px-[140px]',
    },
    {
      text: 'Done!',
      class: 'text-xl px-[140px] font-bold',
    },
  ];

  const images = [
    {
      src: '/images/illustrations/Characters-25.svg',
    },
    {
      src: '/images/illustrations/Characters-09.svg',
    },
  ];

  defineExpose({ animateIn, animateOut });
</script>

<template>
  <ActivityStep ref="stepRef" step="4/5" title="Intention Redirect">
    <StackedMessages ref="messagesRef" :messages="messages" />

    <AnimatedImages ref="imagesRef" :images="images" />

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
