<script setup lang="ts">
  import { ref } from 'vue';

  import Animation from '@/components/Animation.vue';

  const messageRef = ref<typeof Animation>();
  const imageRef = ref<typeof Animation>();

  const animateIn = async () => {
    return Promise.all([messageRef.value.animateIn(), imageRef.value.animateIn()]);
  };

  const animateOut = async () => {
    return Promise.all([messageRef.value?.animateOut(), imageRef.value?.animateOut()]);
  };

  defineExpose({ animateIn, animateOut });
</script>

<template>
  <div class="pt-[420px]">
    <Animation
      ref="messageRef"
      ignore-mount
      direction="up"
      class="text-3xl font-bold px-[140px] text-black"
    >
      <span class="text-[120px]">👏</span><br />
      Well done!
    </Animation>

    <Animation
      ref="imageRef"
      ignore-mount
      direction="up"
      class="absolute top-[840px] left-[40px] right-[40px]"
    >
      <img src="/images/illustrations/Characters-05.svg" alt="" />
    </Animation>
  </div>
</template>
