<script setup lang="ts">
  import { ref } from 'vue';

  import { sleep } from '@/utils';
  import { BASE_ANIMATION_DURATION } from '@/constants';
  import { PoseTasks } from '@/services/PoseTasks';
  import { useTaskMonitoring } from '@/composables/useTaskMonitoring';

  import ActivityStep from '@/components/ActivityStep.vue';
  import StackedMessages from '@/components/StackedMessages.vue';
  import BlendingMessages from '@/components/BlendingMessages.vue';
  import Exercises from '@/components/activity/Exercises.vue';

  const { startTaskMonitoring } = useTaskMonitoring();

  const stepRef = ref<InstanceType<typeof ActivityStep>>();
  const messagesRef = ref<InstanceType<typeof StackedMessages>>();
  const exercisesRef = ref<InstanceType<typeof Exercises>>();

  let canceled = false;

  const animateIn = async () => {
    await stepRef.value?.animateIn();
    await sleep(BASE_ANIMATION_DURATION * 2);
    await messagesRef.value?.showMessage();
    await sleep(BASE_ANIMATION_DURATION * 2);
    await messagesRef.value?.showMessage();
    await sleep(BASE_ANIMATION_DURATION * 2);
    startTaskMonitoring(PoseTasks.CuriosityWarmUp);
    await exercisesRef.value?.showNext();
    await sleep(BASE_ANIMATION_DURATION * 8);
    await exercisesRef.value?.showNext();
    await sleep(BASE_ANIMATION_DURATION * 8);
    await exercisesRef.value?.showNext();
    await sleep(BASE_ANIMATION_DURATION * 8);
  };

  const animateOut = async () => {
    canceled = true;
    return Promise.all([
      stepRef.value?.animateOut(),
      messagesRef.value?.animateOut(),
      exercisesRef.value?.animateOut(),
    ]);
  };

  const messages = [
    {
      text: 'Let’s open space in your body and in your thinking.',
      class: 'text-xl px-[140px]',
    },
    {
      text: 'Let’s do some light movement:',
      class: 'text-xl px-[140px]',
    },
  ];

  const exercises = [
    {
      name: 'Neck Release',
      description: 'Tilt head right, back to center, then left.',
      image: '/images/illustrations/Characters-12.svg',
    },
    {
      name: 'Shoulder Rolls',
      description: '5 forward, 5 backward.',
      image: '/images/illustrations/Characters-13.svg',
    },
    {
      name: 'Torso Twist',
      description: 'Gentle twist right and left, arms swinging loose.',
      image: '/images/illustrations/Characters-26.svg',
    },
  ];

  const emit = defineEmits(['done']);

  defineExpose({ animateIn, animateOut });
</script>

<template>
  <ActivityStep ref="stepRef" step="2/5" title="Curiosity Warm-Up">
    <BlendingMessages ref="messagesRef" :messages="messages" class="relative" />
    <Exercises ref="exercisesRef" :exercises="exercises" />
  </ActivityStep>
</template>
