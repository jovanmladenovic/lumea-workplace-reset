<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { useRouter } from 'vue-router';
  import { utils } from 'animejs';

  import { animate, sleep } from '@/utils';
  import { faceRecognition, FaceRecognitionEvents } from '@/services';
  import { BASE_ANIMATION_DURATION } from '@/constants';

  import ActivityStep from '@/components/ActivityStep.vue';
  import StackedMessages from '@/components/StackedMessages.vue';
  import Confirm from '@/components/Confirm.vue';
  import { RoutePaths } from '@/router';

  const router = useRouter();

  const stepRef = ref<InstanceType<typeof ActivityStep>>();
  const messagesRef = ref<InstanceType<typeof StackedMessages>>();
  const messagesRef2 = ref<InstanceType<typeof StackedMessages>>();
  const circlesRef = ref<HTMLElement[]>();
  const ringRef = ref<HTMLElement>();
  const confirmRef = ref<InstanceType<typeof Confirm>>();

  const emit = defineEmits(['done']);

  const animateIn = async () => {
    await stepRef.value?.animateIn();

    await sleep(BASE_ANIMATION_DURATION * 2);

    await Promise.all([
      messagesRef.value?.showMessage(),
      animate(ringRef.value, {
        opacity: 1,
      }),
    ]);

    await sleep(BASE_ANIMATION_DURATION * 2);
    faceRecognition.pauseMonitoring();
    faceRecognition.startInactivityTimer();
    faceRecognition.on(FaceRecognitionEvents.INACTIVITY_WARNING, () => {
      router.push(`${RoutePaths.Inactive}?returnPath=${RoutePaths.ResetAndFocus1}?step=5`);
    });

    await messagesRef.value?.showMessage();

    await sleep(BASE_ANIMATION_DURATION * 2);

    await messagesRef2.value?.showMessage();

    await Promise.all([messagesRef2.value?.showMessage(), animateCircles()]);

    await sleep(BASE_ANIMATION_DURATION * 2);

    animate(ringRef.value, {
      opacity: 0,
    });

    await sleep(BASE_ANIMATION_DURATION * 2);

    await showConfirm();
    faceRecognition.resumeMonitoring();
    faceRecognition.stopInactivityTimer();
  };

  const animateCircles = async () => {
    await Promise.all([
      animate(ringRef.value, {
        width: '488px',
        height: '488px',
        top: '1081px',
      }),
      animate(circlesRef.value[0], {
        transform: 'translate(-160px, 0px)',
      }),
      animate(circlesRef.value[1], {
        transform: 'translate(160px, 0px)',
      }),
      animate(circlesRef.value[2], {
        transform: 'translate(0px, 0px)',
      }),
    ]);
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
      top: '1040px',
      opacity: 0,
    });

    utils.set(circlesRef.value[0], {
      transform: 'translate(-117px, -40px)',
    });

    utils.set(circlesRef.value[1], {
      transform: 'translate(80px, -102px)',
    });

    utils.set(circlesRef.value[2], {
      transform: 'translate(31px, 120px)',
    });
  });

  const messages = [
    {
      text: 'List <b>3 small steps</b> you’ll take to complete the task.',
      class: 'text-xl px-[140px]',
    },
    {
      text: '<b>Write them down</b> on a piece of paper found next to you.',
      class: 'text-lg px-[140px] pt-1',
    },
    {
      text: 'Make them <b>time bound</b> and use your newfound focus to make progress.',
      class: 'text-xl px-[140px] pt-1',
    },
  ];

  const confirmResolve = ref();

  const showConfirm = async () => {
    await confirmRef.value?.animateIn();
    return new Promise<void>(resolve => {
      confirmResolve.value = resolve;
    });
  };

  onBeforeUnmount(() => {
    faceRecognition.off(FaceRecognitionEvents.INACTIVITY_WARNING);
    faceRecognition.stopInactivityTimer();
  });

  defineExpose({ animateIn, animateOut });
</script>

<template>
  <ActivityStep ref="stepRef" step="4/5" title="Action Plan">
    <StackedMessages ref="messagesRef" :messages="messages" />

    <!-- Ring -->
    <div
      ref="ringRef"
      class="absolute z-10 h-[550px] w-[550px] left-[50%] flex justify-center items-center -translate-x-[50%] rounded-full border-[7px] border-white"
      aria-hidden="true"
    >
      <div
        v-for="circle in 3"
        :key="circle"
        ref="circlesRef"
        class="w-[160px] h-[160px] rounded-[50%] bg-white absolute top-[calc(50%-80px)] left-[calc(50%-80px)]"
      ></div>
    </div>

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
