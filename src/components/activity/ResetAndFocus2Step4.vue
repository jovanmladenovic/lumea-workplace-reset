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
  const confirmRef = ref<InstanceType<typeof Confirm>>();

  const emit = defineEmits(['done']);

  const animateIn = async () => {
    await stepRef.value?.animateIn();

    await sleep(BASE_ANIMATION_DURATION * 2);

    animate(ringRef.value, {
      opacity: 1,
    });

    await messagesRef.value?.showMessage();

    await sleep(BASE_ANIMATION_DURATION * 2);

    animate(ringRef.value, {
      // top: '1140px',
      top: '940px',
      width: '550px',
      height: '550px',
    });

    await messagesRef.value?.showMessage();

    await sleep(BASE_ANIMATION_DURATION * 4);

    animate(circleRef.value, {
      // top: '1215px',
      top: '915px',
      width: '400px',
      height: '400px',
    });

    await messagesRef.value?.showMessage();

    await sleep(BASE_ANIMATION_DURATION * 2);

    await Promise.all([
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

  onMounted(() => {
    utils.set(ringRef.value, {
      // top: '1265px',
      top: '1065px',
      width: '300px',
      height: '300px',
      opacity: 0,
    });

    utils.set(circleRef.value, {
      // top: '1315px',
      top: '1115px',
      width: '200px',
      height: '200px',
    });
  });

  const messages = [
    {
      text: 'Pick one idea that excites you most and say:',
      class: 'text-xl px-[140px]',
    },
    {
      text: '‘This idea excites me because…’',
      class: 'text-3xl px-[140px] pt-1 font-bold font-raleway',
    },
    {
      text: 'Focus on the excitement, not the obstacles.',
      class: 'text-xl px-[140px]',
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
  <ActivityStep ref="stepRef" step="4/5" title="Pick & Shape">
    <StackedMessages ref="messagesRef" :messages="messages" />

    <!-- Ring -->
    <div
      ref="ringRef"
      class="absolute z-10 left-[50%] flex justify-center items-center -translate-x-[50%] rounded-full border-[7px] border-[#E8D977]"
      aria-hidden="true"
    >
      <div ref="circleRef" class="rounded-[50%] bg-[#E8D977]"></div>
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
