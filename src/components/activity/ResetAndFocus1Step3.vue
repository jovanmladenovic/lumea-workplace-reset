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
  const messagesRef2 = ref<InstanceType<typeof StackedMessages>>();
  const circleRef = ref<HTMLElement>();
  const ringRef = ref<HTMLElement>();
  const confirmRef = ref<InstanceType<typeof Confirm>>();

  const emit = defineEmits(['done']);

  const animateIn = async () => {
    await stepRef.value?.animateIn();

    await sleep(BASE_ANIMATION_DURATION * 2);

    await messagesRef.value?.showMessage();

    await sleep(BASE_ANIMATION_DURATION * 2);

    await Promise.all([messagesRef.value?.animateOut(), messagesRef2.value?.showMessage()]);

    await sleep(BASE_ANIMATION_DURATION * 2);

    await messagesRef2.value?.showMessage();
    animate(ringRef.value, {
      opacity: 1,
    });

    await sleep(BASE_ANIMATION_DURATION * 2);

    messagesRef.value?.showMessage();

    await sleep(BASE_ANIMATION_DURATION * 2);

    await Promise.all([
      animate(ringRef.value, {
        width: '300px',
        height: '300px',
        top: '1065px',
        duration: BASE_ANIMATION_DURATION * 5,
      }),
      animate(circleRef.value, {
        filter: 'blur(0px)',
        width: '200px',
        height: '200px',
        duration: BASE_ANIMATION_DURATION * 5,
      }),
    ]);

    await sleep(BASE_ANIMATION_DURATION * 2);

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
      messagesRef2.value?.animateOut(),
      confirmRef.value?.animateOut(),
    ]);
  };

  onMounted(() => {
    utils.set(ringRef.value, {
      top: '940px',
      opacity: 0,
    });

    utils.set(circleRef.value, {
      filter: 'blur(50px)',
    });
  });

  const messages = [
    {
      text: 'You <b>brought back your focus</b> by embracing the power of your breath.',
      class: 'text-xl px-[140px]',
    },
  ];

  const messages2 = [
    {
      text: 'Now, think for a moment:',
      class: 'text-xl px-[140px]',
    },
    {
      text: '“What task truly deserves my attention now?”',
      class: 'text-3xl pt-1 font-bold px-[80px] font-raleway',
    },
  ];

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
  <ActivityStep ref="stepRef" step="3/5" title="Mirror Declaration">
    <StackedMessages ref="messagesRef" :messages="messages" />
    <StackedMessages ref="messagesRef2" :messages="messages2" class="absolute top-[420px] w-full" />

    <!-- Ring -->
    <div
      ref="ringRef"
      class="absolute z-10 h-[550px] w-[550px] left-[50%] flex justify-center items-center -translate-x-[50%] rounded-full border-[7px] border-[#698677]"
      aria-hidden="true"
    >
      <div ref="circleRef" class="w-[400px] h-[400px] rounded-[50%] bg-[#698677]"></div>
    </div>

    <!-- Confirm -->
    <Confirm
      ref="confirmRef"
      class="absolute top-[940px] left-0 right-0 z-20"
      active-image-url="/images/icons/icons-hand-ok-selected.svg"
      selected-image-url="/images/icons/icons-hand-ok-selected.svg"
      @confirm="confirmResolve"
    >
      Ready to continue?
    </Confirm>
  </ActivityStep>
</template>
