<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref } from 'vue';
  import { userInput } from '@/services';
  import { AnimationDirection, InputEmitEvents, InputReceiveEvents } from '@/utils';
  import Animation from './Animation.vue';

  const props = defineProps({
    onSkip: {
      type: Function,
      required: true,
    },
  });

  const skipRef = ref();

  const animateIn = async () => {
    return skipRef.value.animateIn();
  };

  const animateOut = async (
    delay: number = 0,
    duration: number = 1000,
    direction?: AnimationDirection
  ) => {
    return skipRef.value.animateOut(delay, duration, direction);
  };

  onMounted(() => {
    userInput.emit(InputEmitEvents.request_back);

    userInput.on(InputReceiveEvents.back, () => {
      userInput.off(InputReceiveEvents.back);
      props.onSkip();
    });
  });

  onBeforeUnmount(() => {
    userInput.emit(InputEmitEvents.cancel_request_back);
    userInput.off(InputEmitEvents.request_back);

    userInput.off(InputReceiveEvents.back);
  });

  defineExpose({
    animateIn,
    animateOut,
  });
</script>

<template>
  <Animation
    is="button"
    ref="skipRef"
    class="back absolute right-[75px] top-[75px] flex justify-center items-center font-quicksand"
    ignore-mount
    :onclick="
      () => {
        props.onSkip();
      }
    "
  >
    <div class="back__icon">
      <img src="/images/icons/icons-hand-edit-active.svg" alt="" />
    </div>
    <span class="px-2">Skip this</span>
    <img class="arrow" src="/images/icons/icons-arrows-back.svg" alt="" />
  </Animation>
</template>

<style lang="scss">
  .back {
    z-index: 10;

    .arrow {
      transform: rotateY(180deg);
    }

    &__icon {
      width: 120px;
      height: 120px;
      border-radius: 10px;
      border: 1px solid #fff;
    }
  }
</style>
