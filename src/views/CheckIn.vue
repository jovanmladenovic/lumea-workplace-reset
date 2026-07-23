<script setup lang="ts">
  import { onMounted, ref, nextTick } from 'vue';

  import { RoutePaths, router } from '@/router';
  import { sleep } from '@/utils';
  import { BASE_ANIMATION_DURATION, InterventionType } from '@/constants';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BlobsBackground from '@/components/BlobsBackground.vue';
  import EnergyCheckIn from '@/components/check-in/EnergyCheckIn.vue';
  import InterventionSelection from '@/components/check-in/InterventionSelection.vue';
  import { useSessionData } from '@/composables/useSessionData';

  const backgroundRef = ref<typeof BlobsBackground>();
  const energyCheckInRef = ref<typeof EnergyCheckIn>();
  const interventionSelectionRef = ref<typeof InterventionSelection>();
  const energyCheckinActive = ref<boolean>(false);
  const interventionSelectionActive = ref<boolean>(false);

  const { startSession, updateSession, sessionData, fetchPreviousSession } = useSessionData();

  const interventionRouteMap = {
    [InterventionType.EnergyBoost]: [RoutePaths.EnergyBoost1, RoutePaths.EnergyBoost2],
    [InterventionType.MentalBalance]: [RoutePaths.MentalBalance1, RoutePaths.MentalBalance2],
    [InterventionType.ResetFocus]: [RoutePaths.ResetAndFocus1, RoutePaths.ResetAndFocus2],
  };

  onMounted(async () => {
    backgroundRef.value?.setBackgroundColor('#27686B');
    backgroundRef.value?.showCornerBlobs();

    await startSession();

    energyCheckinActive.value = true;

    nextTick(() => {
      energyCheckInRef.value?.animateIn();
    });
  });

  const handleEnergySelected = async (value: number) => {
    await updateSession({ startEnergyLevel: value });
  };

  const handleEnergyCheckInDone = async () => {
    await energyCheckInRef.value?.animateOut();

    await sleep(BASE_ANIMATION_DURATION);

    energyCheckinActive.value = false;
    interventionSelectionActive.value = true;

    nextTick(() => {
      interventionSelectionRef.value?.animateIn();
      backgroundRef.value?.moveBlobs();
    });
  };

  const handleInterventionSelected = async (option: InterventionType) => {
    const previousSession = await fetchPreviousSession(option);

    let previousSessionInterventionIndex = previousSession?.interventionIndex || 0;

    // Currently, there are only 2 interventions but we expect to have more in the future. Accomodate for that.
    let interventionIndex = previousSessionInterventionIndex === 0 ? 1 : 0;

    updateSession({ selectedIntervention: option, interventionIndex });
  };

  const handleInterventionSelectionDone = async () => {
    await Promise.all([
      interventionSelectionRef.value?.animateOut(),
      backgroundRef.value?.moveBlobs2(),
    ]);
    await sleep(BASE_ANIMATION_DURATION);

    const { selectedIntervention, interventionIndex } = sessionData.value;

    const nextRoute =
      interventionRouteMap[selectedIntervention as InterventionType][interventionIndex];

    router.push(nextRoute);
  };
</script>

<template>
  <DefaultLayout class="">
    <BlobsBackground
      ref="backgroundRef"
      topBlobColor="#EAB090"
      rightBlobColor="#ABCEBC"
      bottomBlobColor="#EAB090"
      leftBlobColor="#B589D1"
      blob-classes="opacity-40"
    />

    <div class="relative w-full pt-[400px]">
      <EnergyCheckIn
        v-if="energyCheckinActive"
        sub-text="Let’s get started"
        @energySelected="handleEnergySelected"
        @done="handleEnergyCheckInDone"
        ref="energyCheckInRef"
      />
      <div class="absolute top-[400px] z-10 left-0 right-0">
        <InterventionSelection
          v-if="interventionSelectionActive"
          ref="interventionSelectionRef"
          @interventionSelected="handleInterventionSelected"
          @done="handleInterventionSelectionDone"
        />
      </div>
    </div>
  </DefaultLayout>
</template>
