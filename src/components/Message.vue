<script setup lang="ts">
  import { ref } from 'vue';
  import { twMerge } from 'tailwind-merge';

  import Animation from './Animation.vue';
  import { BASE_ANIMATION_DURATION } from '@/constants';

  const props = defineProps<{ subText: string; messages: string[]; messageClass?: string }>();

  const subTextRef = ref(null);
  const messageRefs = ref([]);

  const animateIn = () => {
    const promises = [];
    promises.push(subTextRef.value?.animateIn());

    messageRefs.value.forEach((ref, index) => {
      const delay = index * (BASE_ANIMATION_DURATION * 1.5) + BASE_ANIMATION_DURATION * 2;

      promises.push(ref.animateIn(delay));
    });

    return Promise.all(promises);
  };

  const animateOut = () => {
    const promises = [];
    promises.push(subTextRef.value?.animateOut(0));

    messageRefs.value.forEach(ref => {
      promises.push(ref.animateOut());
    });

    return Promise.all(promises);
  };

  const messageClass = twMerge('text-xl w-full', props.messageClass);

  defineExpose({ animateIn, animateOut });
</script>

<template>
  <div class="">
    <Animation ref="subTextRef" direction="up" ignore-mount class="font-quicksand">
      {{ subText }}
    </Animation>
    <div class="mt-[80px]">
      <Animation
        v-for="(message, index) in messages"
        :key="index"
        ref="messageRefs"
        direction="up"
        ignore-mount
        :class="messageClass"
        v-html="message || ''"
      >
      </Animation>
    </div>
  </div>
</template>
