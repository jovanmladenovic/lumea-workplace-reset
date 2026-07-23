<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
  import { useRoute } from 'vue-router';

  import { sleep, createCancellableSequence, type CancellableSequence } from '@/utils';
  import { RoutePaths, router } from '@/router';
  import { BASE_ANIMATION_DURATION } from '@/constants';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';

  import ResetAndFocus1Step1 from '@/components/activity/ResetAndFocus1Step1.vue';
  import ResetAndFocus1Step2 from '@/components/activity/ResetAndFocus1Step2.vue';
  import ResetAndFocus1Step3 from '@/components/activity/ResetAndFocus1Step3.vue';
  import ResetAndFocus1Step4 from '@/components/activity/ResetAndFocus1Step4.vue';
  import ResetAndFocus1Step5 from '@/components/activity/ResetAndFocus1Step5.vue';
  import BlobsBackground from '@/components/BlobsBackground.vue';

  const blobsRef = ref<InstanceType<typeof BlobsBackground>>();
  const step1Ref = ref<InstanceType<typeof ResetAndFocus1Step1>>();
  const step2Ref = ref<InstanceType<typeof ResetAndFocus1Step2>>();
  const step3Ref = ref<InstanceType<typeof ResetAndFocus1Step3>>();
  const step4Ref = ref<InstanceType<typeof ResetAndFocus1Step4>>();
  const step5Ref = ref<InstanceType<typeof ResetAndFocus1Step5>>();

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

  const initStep1 = () => {
    return createCancellableSequence([
      () => blobsRef.value?.setBackgroundColor('#E8D977'),
      () => sleep(BASE_ANIMATION_DURATION),
      () => step1Ref.value?.animateIn(),
      () => sleep(BASE_ANIMATION_DURATION),
      () => step1Ref.value?.animateOut(),
      () => {
        showStep1.value = false;
        showStep2.value = true;
      },
      () => nextTick(),
    ]);
  };

  const initStep2 = () => {
    return createCancellableSequence([
      () => blobsRef.value?.setBackgroundColor('#8BB29E'),
      () => sleep(BASE_ANIMATION_DURATION * 2),
      () => step2Ref.value?.animateIn(),
      () => sleep(BASE_ANIMATION_DURATION * 2),
      () => step2Ref.value?.animateOut(),
      () => {
        showStep2.value = false;
        showStep3.value = true;
      },
      () => nextTick(),
    ]);
  };

  const initStep3 = () => {
    return createCancellableSequence([
      () => blobsRef.value?.setBackgroundColor('#90B8EA'),
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
      () => blobsRef.value?.setBackgroundColor('#EAB090'),
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
      () => blobsRef.value?.setBackgroundColor('#B589D1'),
      () => step5Ref.value?.animateIn(),
      () => sleep(BASE_ANIMATION_DURATION * 2),
      () => step5Ref.value?.animateOut(),
      () => {
        showStep5.value = false;
      },
    ]);
  };

  let flowSequence: CancellableSequence;

  onMounted(() => {
    const allSteps = [
      () => initStep1().promise,
      () => initStep2().promise,
      () => initStep3().promise,
      () => initStep4().promise,
      () => initStep5().promise,
      async () => {
        await blobsRef.value?.animateOut();
        router.push(RoutePaths.CheckOutAnimated);
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
      ref="blobsRef"
      topBlobColor="#EAB090"
      rightBlobColor="#A8C5B6"
      bottomBlobColor="#EAB090"
      leftBlobColor="#90B8EA"
    />
    <div class="relative z-10 text-black">
      <ResetAndFocus1Step1 v-if="showStep1" ref="step1Ref" />
      <ResetAndFocus1Step2 v-if="showStep2" ref="step2Ref" />
      <ResetAndFocus1Step3 v-if="showStep3" ref="step3Ref" />
      <ResetAndFocus1Step4 v-if="showStep4" ref="step4Ref" />
      <ResetAndFocus1Step5 v-if="showStep5" ref="step5Ref" />
    </div>
  </DefaultLayout>
</template>
