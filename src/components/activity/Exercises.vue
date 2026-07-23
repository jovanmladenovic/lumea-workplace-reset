<script setup lang="ts">
  import { ref } from 'vue';

  import { BASE_ANIMATION_DURATION } from '@/constants';

  import Animation from '@/components/Animation.vue';

  const props = defineProps<{
    exercises: {
      name: string;
      description: string;
      image: string;
    }[];
  }>();

  type AnimationInstance = InstanceType<typeof Animation>;

  const exerciseNameRefs = ref<AnimationInstance[]>([]);
  const exerciseDescriptionRefs = ref<AnimationInstance[]>([]);
  const exerciseImageRefs = ref<AnimationInstance[]>([]);
  const currentExerciseIndex = ref(0);

  const showNext = async () => {
    const currentIndex = currentExerciseIndex.value;
    const prevIndex = currentIndex - 1;

    if (prevIndex > -1) {
      exerciseNameRefs.value[prevIndex].animateOut();
      exerciseDescriptionRefs.value[prevIndex].animateOut();
      exerciseImageRefs.value[prevIndex].animateOut();
    }

    currentExerciseIndex.value === props.exercises.length - 1
      ? (currentExerciseIndex.value = 0)
      : currentExerciseIndex.value++;

    return Promise.all([
      exerciseNameRefs.value[currentIndex].animateIn(),
      exerciseDescriptionRefs.value[currentIndex].animateIn(BASE_ANIMATION_DURATION * 2),
      exerciseImageRefs.value[currentIndex].animateIn(),
    ]);
  };

  const animateOut = () => {
    const promises: Promise<void>[] = [];

    exerciseNameRefs.value.forEach(ref => {
      if (ref) {
        promises.push(ref.animateOut());
      }
    });
    exerciseDescriptionRefs.value.forEach(ref => {
      if (ref) {
        promises.push(ref.animateOut());
      }
    });
    exerciseImageRefs.value.forEach(ref => {
      if (ref) {
        promises.push(ref.animateOut());
      }
    });

    return Promise.all(promises);
  };

  const reset = async () => {
    // Ensure all messages are hidden and start index from 0
    await animateOut();
    currentExerciseIndex.value = 0;
  };

  defineExpose({ animateOut, showNext, reset });
</script>

<template>
  <div class="w-full absolute top-[520px] w-full">
    <div v-for="(exercise, index) in exercises" :key="index" class="w-full absolute">
      <Animation ignore-mount direction="up" ref="exerciseNameRefs" class="text-[52px] font-bold">{{
        exercise.name
      }}</Animation>
      <Animation ignore-mount direction="up" ref="exerciseDescriptionRefs" class="pt-2 pb-4">{{
        exercise.description
      }}</Animation>
      <Animation ignore-mount ref="exerciseImageRefs" class="w-full flex justify-center">
        <img :src="exercise.image" alt="" />
      </Animation>
    </div>
  </div>
</template>
