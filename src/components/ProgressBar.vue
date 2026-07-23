<script setup lang="ts">
  import { ref, computed, onBeforeUnmount } from 'vue';
  import { twMerge } from 'tailwind-merge';

  import { BASE_ANIMATION_DURATION } from '@/constants';

  import Animation from './Animation.vue';

  const props = defineProps<{
    length: number; // length in seconds
    bgClasses: string;
    barClasses: string;
    messages: string[];
  }>();

  const progress = ref(1); // 1 = 100%
  let rafId: number | null = null;
  let startTime = 0;
  const currentMessageIndex = ref(0);

  const nextMessage = () => {
    const nextIndex = currentMessageIndex.value + 1;
    if (nextIndex >= props.messages.length) return;

    if (messageRefs.value[currentMessageIndex.value]) {
      messageRefs.value[currentMessageIndex.value].animateOut();
    }

    currentMessageIndex.value = nextIndex;
    messageRefs.value[nextIndex].animateIn();
  };

  function cancel() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function start() {
    return new Promise<void>(resolve => {
      cancel();
      progress.value = props.length > 0 ? 1 : 0;
      startTime = 0;

      if (props.length <= 0) return resolve();

      const step = (ts: number) => {
        if (startTime === 0) startTime = ts;
        // Use real seconds based on wall-clock time
        const elapsedSec = (ts - startTime) / BASE_ANIMATION_DURATION;
        const remaining = Math.max(props.length - elapsedSec, 0);
        progress.value = remaining / props.length;
        if (remaining > 0) {
          rafId = requestAnimationFrame(step);
        } else {
          cancel();
          slotHolderRef.value?.animateOut();
          emit('done');
          resolve();
        }
      };

      rafId = requestAnimationFrame(step);
    });
  }

  onBeforeUnmount(cancel);

  const widthStyle = computed(() => {
    const pct = Math.max(0, Math.min(100, progress.value * 100));
    return { width: `${pct}%` } as const;
  });

  const emit = defineEmits(['done']);

  const holderRef = ref<InstanceType<typeof Animation>>();
  const slotHolderRef = ref<InstanceType<typeof Animation>>();
  const messageRefs = ref<InstanceType<typeof Animation>[]>([]);

  const animateIn = () => {
    const promises: Promise<void>[] = [];
    if (holderRef.value) promises.push(holderRef.value.animateIn());
    if (slotHolderRef.value) promises.push(slotHolderRef.value.animateIn());
    if (messageRefs.value && messageRefs.value[0]) {
      promises.push(messageRefs.value[0].animateIn());
    }
    return Promise.all(promises);
  };

  const animateOut = () => {
    return Promise.all([holderRef.value?.animateOut(), slotHolderRef.value?.animateOut()]);
  };

  defineExpose({
    start,
    cancel,
    animateIn,
    animateOut,
    nextMessage,
  });
</script>

<template>
  <Animation ref="holderRef" ignore-mount direction="up" class="flex flex-col items-center">
    <Animation
      v-for="(message, index) in messages"
      :key="index"
      ref="messageRefs"
      direction="up"
      ignore-mount
      class="absolute top-0 left-0 top-0 right-0 font-bold"
    >
      {{ message }}
    </Animation>
    <div
      :class="
        twMerge(
          'w-[700px] h-[20px] mt-[60px] rounded-[20px] mx-auto flex justify-end overflow-hidden',
          bgClasses
        )
      "
    >
      <div :class="twMerge('h-[20px] rounded-[20px]', barClasses)" :style="widthStyle"></div>
    </div>
  </Animation>
</template>
