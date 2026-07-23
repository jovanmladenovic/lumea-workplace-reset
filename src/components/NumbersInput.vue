<script setup lang="ts">
  import { onBeforeUnmount, ref } from 'vue';

  import { userInput } from '@/services';

  import { ComponentAnimationEvents, animate } from '@/utils';
  import { InputReceiveEvents, InputEmitEvents, BASE_ANIMATION_DURATION } from '@/constants';
  import Animation from '@/components/Animation.vue';

  const emit = defineEmits(['change', ComponentAnimationEvents.left]);

  const value = ref<number | null>(null);
  const holderRef = ref();
  const valueRef = ref();
  const hintRef = ref();
  const labelRef = ref();
  const valueHolderRef = ref();
  const completeRef = ref();

  const animateIn = async () => {
    holderRef.value?.animateIn();

    userInput.emit(InputEmitEvents.request_user_input);

    userInput.on(InputReceiveEvents.user_input, (response: number) => {
      setValue(response);
    });

    setTimeout(() => {
      if (!value.value) {
        hintRef.value?.animateIn();
      }
    }, 6000);
  };

  const animateOut = async () => {
    valueRef.value?.animateOut();
    holderRef.value?.animateOut();

    animate([labelRef.value, valueHolderRef.value], {
      opacity: 0,
      duration: BASE_ANIMATION_DURATION,
    });

    completeRef.value?.animateOut();

    emit(ComponentAnimationEvents.left);
  };

  const setValue = async (val: number) => {
    value.value = val;
    showValue();
    hintRef.value?.animateOut();
    await completeRef.value?.animateIn();
    emit('change', val);
  };

  const showValue = () => {
    valueRef.value?.animateIn();

    animate(holderRef.value.$el, { backgroundColor: '#fff', duration: BASE_ANIMATION_DURATION });
    animate([labelRef.value, valueRef.value.$el], {
      color: '#000',
      duration: BASE_ANIMATION_DURATION,
    });
    animate([valueHolderRef.value], {
      borderColor: '#000',
      duration: BASE_ANIMATION_DURATION,
    });
  };

  onBeforeUnmount(() => {
    userInput.off(InputReceiveEvents.user_input);
  });

  defineExpose({
    animateIn,
    animateOut,
  });
</script>

<template>
  <div class="flex items-center flex-col" @click="setValue(5)">
    <Animation
      ref="holderRef"
      ignore-mount
      direction="up"
      class="flex flex-col items-center pt-3 pb-2 w-[400px] border-2 rounded-[22px]"
    >
      <div ref="labelRef" class="pb-7 font-base">Your Energy Level</div>
      <div ref="valueHolderRef" class="w-[160px] h-[120px] border-b-2">
        <Animation
          ref="valueRef"
          ignore-mount
          direction="down"
          class="text-[140px] leading-[100px]"
        >
          {{ value }}
        </Animation>
      </div>
      <div class="pt-1 font-base">
        10 = very high <br />
        1 = very low
      </div>
    </Animation>

    <div class="relative w-full">
      <Animation
        ref="completeRef"
        ignore-mount
        direction="up"
        class="top-[80px] absolute top-0 left-0 w-full text-xl"
      >
        Thank you!
      </Animation>
      <Animation ref="hintRef" ignore-mount direction="up" class="pt-[80px]">
        <div class="text-sm pb-0.5">Remember</div>
        <div class="h-[1px] border-b w-[90px] my-[20px] mx-auto"></div>
        <div class="flex flex-col gap-[32px]">
          <div>1. Show a number by using your fingers</div>
          <div>2. Combine two numbers to show a sum</div>
        </div>
      </Animation>
    </div>
  </div>
</template>
