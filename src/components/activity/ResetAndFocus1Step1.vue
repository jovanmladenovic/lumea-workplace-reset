<script setup lang="ts">
  import { ref } from 'vue';

  import { sleep } from '@/utils';
  import { BASE_ANIMATION_DURATION } from '@/constants';
  import { PoseTasks } from '@/services';
  import { useTaskMonitoring } from '@/composables/useTaskMonitoring';

  import ActivityStep from '@/components/ActivityStep.vue';
  import StackedMessages from '@/components/StackedMessages.vue';
  import BlendingMessages from '@/components/BlendingMessages.vue';
  import Exercises from '@/components/activity/Exercises.vue';

  const stepRef = ref<InstanceType<typeof ActivityStep>>();
  const messagesRef = ref<InstanceType<typeof StackedMessages>>();
  const messagesRef2 = ref<InstanceType<typeof StackedMessages>>();
  const exercisesRef = ref<InstanceType<typeof Exercises>>();

  const { startTaskMonitoring } = useTaskMonitoring();

  let canceled = false;

  const animateIn = async () => {
    await stepRef.value?.animateIn();
    await sleep(BASE_ANIMATION_DURATION * 2);
    await messagesRef.value?.showMessage();
    await sleep(BASE_ANIMATION_DURATION * 2);
    await messagesRef.value?.showMessage();
    startTaskMonitoring(PoseTasks.BodyAndMind);
    await sleep(BASE_ANIMATION_DURATION * 2);
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
      messagesRef2.value?.animateOut(),
      exercisesRef.value?.animateOut(),
    ]);
  };

  const messages = [
    {
      text: 'Align your body and mind so focus feels natural.',
      class: 'text-xl px-[140px]',
    },
    {
      text: 'Let’s do some light movement:',
      class: 'text-xl px-[140px]',
    },
  ];

  const exercises = [
    {
      name: 'Neck Rolls',
      description: 'Slow circle clockwise, then counterclockwise.',
      image: '/images/illustrations/Characters-12.svg',
    },
    {
      name: 'Shoulder Blade Squeeze',
      description: 'Pull shoulders back, squeeze, release (3x)',
      image: '/images/illustrations/Characters-13.svg',
    },
    {
      name: 'Shake It Out',
      description: 'Release arms and legs to reset energy.',
      image: '/images/illustrations/Characters-14.svg',
    },
  ];

  const emit = defineEmits(['done']);

  defineExpose({ animateIn, animateOut });
</script>

<template>
  <ActivityStep ref="stepRef" step="1/5" title="Body + Mind">
    <BlendingMessages ref="messagesRef" :messages="messages" class="relative" />
    <Exercises ref="exercisesRef" :exercises="exercises" />
  </ActivityStep>
</template>
