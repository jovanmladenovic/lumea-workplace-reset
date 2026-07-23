<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
  import { useRoute } from 'vue-router';

  import { sleep, createCancellableSequence, type CancellableSequence } from '@/utils';
  import { RoutePaths, router } from '@/router';
  import { BASE_ANIMATION_DURATION } from '@/constants';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BlobsBackground from '@/components/BlobsBackground.vue';
  import ActivityIntro from '@/components/activity/ActivityIntro.vue';
  import MentalBalance1Step2 from '@/components/activity/MentalBalance1Step2.vue';
  import MentalBalance1Step3 from '@/components/activity/MentalBalance1Step3.vue';
  import MentalBalance1Step4 from '@/components/activity/MentalBalance1Step4.vue';
  import MentalBalance1Step5 from '@/components/activity/MentalBalance1Step5.vue';

  const blobsBackgroundRef = ref<InstanceType<typeof BlobsBackground>>();

  const step1Ref = ref<InstanceType<typeof ActivityIntro>>();
  const step2Ref = ref<InstanceType<typeof MentalBalance1Step2>>();
  const step3Ref = ref<InstanceType<typeof MentalBalance1Step3>>();
  const step4Ref = ref<InstanceType<typeof MentalBalance1Step4>>();
  const step5Ref = ref<InstanceType<typeof MentalBalance1Step5>>();

  const route = useRoute();
  const startStep = computed(() => {
    const step = Number(route.query.step);
    return step >= 1 && step <= 5 ? step : 1;
  });

  const showStep1 = ref(startStep.value === 1);
  const showStep2 = ref(startStep.value === 2);
  const showStep3 = ref(startStep.value === 3);
  const showStep4 = ref(startStep.value === 4);
  const showStep5 = ref(startStep.value === 5);

  const introMessages: { text: string; class?: string }[] = [
    {
      text: `It's hard to <b>think clearly</b> when emotions are taking over.`,
      class: 'text-xl px-[140px]',
    },
    {
      text: `<b>Take a moment</b> to calm down and regain clarity.`,
      class: 'text-xl px-[140px]',
    },
  ];

  const initStep1 = () => {
    return createCancellableSequence([
      () => Promise.all([blobsBackgroundRef.value?.showBlobs(), step1Ref.value?.animateIn()]),
      () => sleep(BASE_ANIMATION_DURATION * 2),
      () => Promise.all([blobsBackgroundRef.value?.moveBlobs(), step1Ref.value?.showMessage()]),
      () => sleep(BASE_ANIMATION_DURATION * 2),
      () => Promise.all([blobsBackgroundRef.value?.moveBlobs2(), step1Ref.value?.showMessage()]),
      () => sleep(BASE_ANIMATION_DURATION * 3),
      () => Promise.all([step1Ref.value?.animateOut(), blobsBackgroundRef.value?.hideBlobs()]),
      () => sleep(BASE_ANIMATION_DURATION * 2),
      () => {
        showStep1.value = false;
        showStep2.value = true;
      },
      () => nextTick(),
    ]);
  };

  const initStep2 = () => {
    return createCancellableSequence([
      () => blobsBackgroundRef.value?.setBackgroundColor('#EA909E'),
      () => step2Ref.value?.animateIn(),
      () => sleep(BASE_ANIMATION_DURATION * 2),
      () => step2Ref.value?.animateOut(),
      () => sleep(BASE_ANIMATION_DURATION * 2),
      () => {
        showStep2.value = false;
        showStep3.value = true;
      },
      () => nextTick(),
    ]);
  };

  const initStep3 = () => {
    return createCancellableSequence([
      () => blobsBackgroundRef.value?.setBackgroundColor('#90B8EA'),
      () => step3Ref.value?.animateIn(),
      () => sleep(BASE_ANIMATION_DURATION),
      () => step3Ref.value?.animateOut(),
      () => sleep(BASE_ANIMATION_DURATION * 2),
      () => {
        showStep3.value = false;
        showStep4.value = true;
      },
      () => nextTick(),
    ]);
  };

  const initStep4 = () => {
    return createCancellableSequence([
      () => blobsBackgroundRef.value?.setBackgroundColor('#EAB090'),
      () => step4Ref.value?.animateIn(),
      () => sleep(BASE_ANIMATION_DURATION * 2),
      () => step4Ref.value?.animateOut(),
      () => sleep(BASE_ANIMATION_DURATION * 2),
      () => {
        showStep4.value = false;
        showStep5.value = true;
      },
      () => nextTick(),
    ]);
  };

  const initStep5 = () => {
    return createCancellableSequence([
      () => blobsBackgroundRef.value?.setBackgroundColor('#E8D977'),
      () => step5Ref.value?.animateIn(),
      () => sleep(BASE_ANIMATION_DURATION * 2),
      () => step5Ref.value?.animateOut(),
      () => sleep(BASE_ANIMATION_DURATION),
      () => {
        showStep5.value = false;
      },
    ]);
  };

  let flowSequence: CancellableSequence;

  onMounted(async () => {
    await blobsBackgroundRef.value?.setBackgroundColor('#B490EA');
    await sleep(BASE_ANIMATION_DURATION);

    const allSteps = [
      () => initStep1().promise,
      () => initStep2().promise,
      () => initStep3().promise,
      () => initStep4().promise,
      () => initStep5().promise,
      () => {
        router.push(RoutePaths.CheckOut);
      },
    ];

    flowSequence = createCancellableSequence(allSteps.slice(startStep.value - 1));
  });

  onBeforeUnmount(() => {
    flowSequence?.cancel();
    showStep1.value = true;
    showStep2.value = false;
    showStep3.value = false;
    showStep4.value = false;
    showStep5.value = false;
  });
</script>

<template>
  <DefaultLayout>
    <BlobsBackground
      ref="blobsBackgroundRef"
      topBlobColor="#EAB090"
      rightBlobColor="#A8C5B6"
      bottomBlobColor="#EAB090"
      leftBlobColor="#90B8EA"
    />

    <div class="relative z-10 text-black">
      <ActivityIntro v-if="showStep1" ref="step1Ref" :messages="introMessages" title="Welcome" />
      <MentalBalance1Step2 v-if="showStep2" ref="step2Ref" class="absolute top-0 left-0 right-0" />
      <MentalBalance1Step3 v-if="showStep3" ref="step3Ref" class="absolute top-0 left-0 right-0" />
      <MentalBalance1Step4 v-if="showStep4" ref="step4Ref" class="absolute top-0 left-0 right-0" />
      <MentalBalance1Step5 v-if="showStep5" ref="step5Ref" class="absolute top-0 left-0 right-0" />
    </div>
  </DefaultLayout>
</template>
