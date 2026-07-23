<script setup lang="ts">
  import { ref } from 'vue';

  import Animation from '@/components/Animation.vue';

  defineProps<{ step: string; title: string }>();

  const stepRef = ref<typeof Animation>();
  const titleRef = ref<typeof Animation>();

  const animateIn = async () => {
    await Promise.all([stepRef.value?.animateIn(), titleRef.value?.animateIn()]);
  };

  const animateOut = () => {
    return Promise.all([stepRef.value?.animateOut(), titleRef.value?.animateOut()]);
  };

  defineExpose({ animateIn, animateOut });
</script>

<template>
  <div>
    <Animation ref="stepRef" ignore-mount direction="up" class="my-[140px] text-sm"
      >Step {{ step }}</Animation
    >
    <Animation ref="titleRef" ignore-mount direction="up" class="mb-[40px] text-base">{{
      title
    }}</Animation>

    <div class="">
      <slot />
    </div>
  </div>
</template>
