<script setup lang="ts">
  import { ref } from 'vue';

  import Animation from './Animation.vue';

  defineProps<{
    images: {
      src: string;
      class?: string;
    }[];
  }>();

  type AnimationInstance = InstanceType<typeof Animation>;

  const imageRefs = ref<AnimationInstance[]>([]);
  const currentMessageIndex = ref(0);

  const showNext = () => {
    const promises: Promise<void>[] = [];

    const prevIdx = currentMessageIndex.value - 1;
    if (prevIdx >= 0 && imageRefs.value[prevIdx]) {
      promises.push(imageRefs.value[prevIdx].animateOut());
    }

    const currIdx = currentMessageIndex.value;
    const curr = imageRefs.value[currIdx];
    if (curr) {
      promises.push(curr.animateIn());
      currentMessageIndex.value = currIdx + 1;
    } else {
      // No more images; no-op to keep API stable
      return Promise.resolve([] as unknown as void);
    }

    return Promise.all(promises);
  };

  const animateOut = () => {
    const promises: Promise<void>[] = [];

    imageRefs.value.forEach(ref => {
      if (ref) {
        promises.push(ref.animateOut());
      }
    });

    return Promise.all(promises);
  };

  const reset = async () => {
    // Ensure all images are hidden and start index from 0
    await animateOut();
    currentMessageIndex.value = 0;
  };

  defineExpose({ animateOut, showNext, reset });
</script>

<template>
  <div class="absolute top-[740px] z-10 left-0 right-0">
    <Animation
      v-for="(image, index) in images"
      :key="index"
      ref="imageRefs"
      ignore-mount
      class="flex justify-center"
      :class="{ 'absolute top-0 left-0 right-0': index > 0 }"
    >
      <img :src="image.src" :class="image.class" />
    </Animation>
  </div>
</template>
