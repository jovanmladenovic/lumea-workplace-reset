<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { utils } from 'animejs';

  import { animate, sleep } from '@/utils';
  import { BASE_ANIMATION_DURATION } from '@/constants';

  import ActivityStep from '@/components/ActivityStep.vue';
  import StackedMessages from '@/components/StackedMessages.vue';
  import Confirm from '@/components/Confirm.vue';

  const stepRef = ref<InstanceType<typeof ActivityStep>>();
  const messagesRef = ref<InstanceType<typeof StackedMessages>>();
  const circleRef = ref<HTMLElement>();
  const ringRef = ref<HTMLElement>();

  const emit = defineEmits(['done']);

  const animateIn = async () => {
    await stepRef.value?.animateIn();

    messagesRef.value?.showMessage();
    // 1) Move to center of the screen
    await Promise.all([
      animate(circleRef.value, {
        left: '50%',
        translateX: '-50%',
      }),
      animate(ringRef.value, {
        opacity: 1,
      }),
    ]);

    await sleep(BASE_ANIMATION_DURATION * 2);

    messagesRef.value?.showMessage();
    // 2) Then un-blur and resize to 150px
    await animate(circleRef.value, {
      filter: 'blur(0px)',
      width: '150px',
      height: '150px',
      top: 1250,
      duration: BASE_ANIMATION_DURATION * 1.5,
    });

    await sleep(BASE_ANIMATION_DURATION * 4);
    messagesRef.value?.showMessage();

    await sleep(BASE_ANIMATION_DURATION * 4);
    await Promise.all([
      animate(circleRef.value, {
        opacity: 0,
      }),
      animate(ringRef.value, {
        opacity: 0,
      }),
    ]);
    await showConfirm();
  };

  const animateOut = async () => {
    return Promise.all([
      stepRef.value?.animateOut(),
      messagesRef.value?.animateOut(),
      confirmRef.value?.animateOut(),
    ]);
  };

  const confirmRef = ref<InstanceType<typeof Confirm>>();
  const confirmResolve = ref();

  const showConfirm = async () => {
    await confirmRef.value?.animateIn();
    return new Promise<void>(resolve => {
      confirmResolve.value = resolve;
    });
  };

  onMounted(async () => {
    // Set initial state using our anime.js util with zero-duration
    // Move by left so we don't clash with Tailwind's transform classes
    utils.set(circleRef.value, {
      left: '-150vw',
      translateX: '0%',
      filter: 'blur(50px)',
      width: '400px',
      height: '400px',
    });

    utils.set(ringRef.value, {
      opacity: 0,
    });
  });

  const messages = [
    {
      text: 'Pick <b>one task</b> that feels light but useful, just one clear step forward.',
      class: 'text-xl px-[140px]',
    },
    {
      text: 'When you leave, give it <b>5-10 focused minutes</b>.',
      class: 'text-xl px-[140px]',
    },
    {
      text: 'Energy follows clarity.',
      class: 'text-lg px-[140px]',
    },
  ];

  defineExpose({ animateIn, animateOut });
</script>

<template>
  <ActivityStep ref="stepRef" step="4/5" title="Focus reset">
    <StackedMessages ref="messagesRef" :messages="messages" />

    <!-- Ring -->
    <div
      ref="ringRef"
      class="absolute top-[1050px] z-10 h-[550px] w-[550px] left-[50%] -translate-x-[50%] rounded-full border-[7px] border-[#88679D]"
      aria-hidden="true"
    ></div>

    <!-- Circle -->
    <div ref="circleRef" class="absolute top-[1125px] z-10 rounded-[50%] bg-[#88679D]"></div>

    <!-- Confirm -->
    <Confirm
      ref="confirmRef"
      class="absolute top-[1050px] left-0 right-0 z-20"
      active-image-url="/images/icons/icons-hand-ok-selected.svg"
      selected-image-url="/images/icons/icons-hand-ok-selected.svg"
      @confirm="confirmResolve"
    >
      Ready to continue?
    </Confirm>
  </ActivityStep>
</template>
