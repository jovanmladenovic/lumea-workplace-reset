<script setup lang="ts">
  import { nextTick, onMounted, ref } from 'vue';
  import { Timestamp } from 'firebase/firestore';

  import { sleep } from '@/utils';
  import { BASE_ANIMATION_DURATION } from '@/constants';
  import { RoutePaths, router } from '@/router';

  import { useSessionData } from '@/composables/useSessionData';
  import { useUserStore } from '@/stores/user.store';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BlobsBackground from '@/components/BlobsBackground.vue';
  import EnergyCheckIn from '@/components/check-in/EnergyCheckIn.vue';
  import ActivityDone from '@/components/activity/ActivityDone.vue';
  import RepeatQuestion from '@/components/check-in/RepeatQuestion.vue';
  import SessionEnd from '@/components/check-in/SessionEnd.vue';

  const backgroundRef = ref<typeof BlobsBackground>();
  const energyCheckInRef = ref<typeof EnergyCheckIn>();
  const activityDoneRef = ref<typeof ActivityDone>();
  const repeatQuestionRef = ref<typeof RepeatQuestion>();
  const sessionEndRef = ref<typeof SessionEnd>();
  const energyCheckinActive = ref<boolean>(false);
  const repeatQuestionActive = ref<boolean>(false);
  const sessionEndActive = ref<boolean>(false);

  const { updateSession } = useSessionData();
  const userStore = useUserStore();

  const props = defineProps<{ animated: boolean }>();

  const initDoneAnimation = async () => {
    await backgroundRef.value?.setBackgroundColor('#E8D977', !props.animated);

    return Promise.all([backgroundRef.value?.moveBlobs3(), activityDoneRef.value?.animateIn()]);
  };

  const handleEnergySelected = async (value: number) => {
    await updateSession({ endEnergyLevel: value });
  };

  const handleEnergyCheckInDone = async () => {
    backgroundRef.value?.setBackgroundColor('#000000');
    await backgroundRef.value?.moveBlobs2();

    repeatQuestionActive.value = true;

    return energyCheckInRef.value?.animateOut().then(() => {
      // Remove component and all event handlers
      energyCheckinActive.value = false;
      repeatQuestionActive.value = true;
      nextTick(() => {
        repeatQuestionRef.value?.animateIn();
      });
    });
  };

  const handleRepeatQuestionSelected = async (value: boolean) => {
    updateSession({ willingToRepeat: value });
  };

  const handleRepeatQuestionDone = async () => {
    await repeatQuestionRef.value?.animateOut();
    repeatQuestionActive.value = false;
    sessionEndActive.value = true;
    nextTick(() => {
      sessionEndRef.value?.animateIn();
    });
  };

  const handleSessionEndDone = async () => {
    await updateSession({ endedAt: Timestamp.now() });
    await sessionEndRef.value?.animateOut();
    userStore.clearUserId();
    await sleep(BASE_ANIMATION_DURATION);
    router.push(RoutePaths.Idle);
  };

  onMounted(async () => {
    await initDoneAnimation();
    await sleep(BASE_ANIMATION_DURATION * 2);

    energyCheckinActive.value = true;

    await Promise.all([activityDoneRef.value?.animateOut(), backgroundRef.value?.moveBlobs2()]);
    await sleep(BASE_ANIMATION_DURATION * 2);
    nextTick(() => {
      backgroundRef.value?.moveBlobs();
      energyCheckInRef.value?.animateIn();
    });
  });
</script>

<template>
  <DefaultLayout class="">
    <BlobsBackground
      ref="backgroundRef"
      topBlobColor="#EAB090"
      rightBlobColor="#A8C5B6"
      bottomBlobColor="#EAB090"
      leftBlobColor="#90B8EA"
      blob-classes="opacity-40"
    />

    <ActivityDone ref="activityDoneRef" class="absolute top-0 left-0 right-0" />

    <div class="relative w-full pt-[400px]">
      <EnergyCheckIn
        v-if="energyCheckinActive"
        sub-text="Now tell us"
        @energySelected="handleEnergySelected"
        @done="handleEnergyCheckInDone"
        ref="energyCheckInRef"
        class="text-black border-black"
      />
      <RepeatQuestion
        v-if="repeatQuestionActive"
        @selected="handleRepeatQuestionSelected"
        @done="handleRepeatQuestionDone"
        ref="repeatQuestionRef"
        class="absolute top-[400px] left-0 right-0"
      />
      <SessionEnd
        v-if="sessionEndActive"
        @done="handleSessionEndDone"
        ref="sessionEndRef"
        class="absolute top-[400px] left-0 right-0"
      />
    </div>
  </DefaultLayout>
</template>
