<script setup lang="ts">
  import { ref } from 'vue';
  import { userInput } from '@/services';
  import { AnimationDirection, InputEmitEvents, InputReceiveEvents } from '@/utils';
  import { BASE_ANIMATION_DURATION } from '@/constants';

  import Animation from './Animation.vue';

  defineProps<{
    activeImageUrl: string;
    selectedImageUrl: string;
  }>();

  const confirmRef = ref();
  const confirmed = ref(false);

  const animateIn = async () => {
    // TODO: use enums
    userInput.emit(InputEmitEvents.request_user_input, { type: 'confirm', options: ['yes'] });

    userInput.on(InputReceiveEvents.user_input, () => {
      confirmed.value = true;
      userInput.off(InputReceiveEvents.user_input);
      emit('confirm');
    });
    return confirmRef.value.animateIn();
  };

  const animateOut = async (
    delay: number = 0,
    duration: number = BASE_ANIMATION_DURATION,
    direction?: AnimationDirection
  ) => {
    userInput.off(InputEmitEvents.request_user_input);
    userInput.off(InputReceiveEvents.back);
    return confirmRef.value.animateOut(delay, duration, direction).then(() => {
      confirmed.value = false;
    });
  };

  const emit = defineEmits(['confirm']);

  defineExpose({
    animateIn,
    animateOut,
  });
</script>

<template>
  <Animation
    is="button"
    ref="confirmRef"
    class="flex flex-col items-center justify-center"
    ignore-mount
    @click="
      () => {
        emit('confirm');
      }
    "
  >
    <div class="text-lg mb-[60px]"><slot /></div>
    <div
      class="w-[280px] h-[280px] flex items-center justify-center border-2 rounded-[20px]"
      :class="{ 'border-white': confirmed, 'bg-white': confirmed }"
    >
      <img :src="confirmed ? selectedImageUrl : activeImageUrl" alt="" />
    </div>
  </Animation>
</template>
