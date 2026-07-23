<script setup lang="ts">
  import { createTimeline, stagger } from 'animejs';
  import { onMounted, ref } from 'vue';

  const props = defineProps({
    onComplete: {
      type: Function,
      required: true,
    },
  });

  const titleRef = ref();
  const firstCopyRef = ref();

  onMounted(() => {
    const tl = createTimeline();
    tl.set([titleRef.value, firstCopyRef.value], {
      translateY: 40,
      opacity: 0,
    })
      .add([titleRef.value, firstCopyRef.value], {
        opacity: 1,
        translateY: 0,
        duration: 1000,
        delay: stagger(50),
        easing: 'easeOutQuart',
      })
      .call(() => {
        props.onComplete();
      }, 5000);
  });
</script>

<template>
  <div
    ref="completeRef"
    class="relative w-full h-full flex items-center justify-start flex-col pt-[50%] font-quicksand"
  >
    <h1 ref="titleRef" class="text-xxl mb-[80px] opacity-0">Congratulations!</h1>
    <p ref="firstCopyRef" class="mb-[80px] opacity-0">
      You've graduated from <br />
      Hand Gestures Academy.
    </p>
  </div>
</template>

<style lang="scss"></style>
