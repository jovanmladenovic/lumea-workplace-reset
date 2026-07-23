<script setup lang="ts">
  import { Ref, ref, onMounted } from 'vue';
  import { createTimeline, utils } from 'animejs';

  import { GestureNumberType } from '@/constants';
  import { userInput } from '@/services';
  import { InputEmitEvents, InputReceiveEvents } from '@/utils';

  const props = defineProps<{ options: string[] }>();
  const elRef = ref<Ref<HTMLElement> | null>(null);
  const gesturesRef = ref<Ref<HTMLElement> | null>(null);
  const titleRef = ref<Ref<HTMLParagraphElement> | null>(null);
  const selectedIndex = ref<number | null>(null);

  const emit = defineEmits(['selected']);

  const animateIn = () => {
    const tl = createTimeline();

    tl.add(titleRef.value ? [gesturesRef.value, titleRef.value] : gesturesRef.value, {
      scale: 1,
      translateY: 0,
      opacity: 1,
      duration: 1000,
      easing: 'easeOutQuart',
    });

    requestUserInput();
  };

  const gestures = [
    GestureNumberType.ONE,
    GestureNumberType.TWO,
    GestureNumberType.THREE,
    GestureNumberType.FOUR,
    GestureNumberType.FIVE,
  ];

  const getGestureImage = (index: number) => {
    return `/images/icons/icons-hand-${gestures[index]}-active.svg`;
  };

  const requestUserInput = () => {
    userInput.emit(InputEmitEvents.request_user_input, {
      options: props.options.map((_option, index) => index + 1),
      type: 'number',
    });

    userInput.on(InputReceiveEvents.user_input, handleOnSelect);
  };

  const handleOnSelect = async (selected: number) => {
    selectedIndex.value = selected - 1;
    emit('selected', selected);
  };

  onMounted(() => {
    utils.set(titleRef.value, {
      opacity: 0,
    });
    utils.set(gesturesRef.value, {
      scale: 0.95,
      translateY: 50,
      opacity: 0,
    });
  });

  const animateOut = () => {
    utils.set(elRef.value, {
      opacity: 0,
    });
  };

  defineExpose({
    animateIn,
    animateOut,
  });
</script>

<template>
  <div ref="elRef" class="mt-[80px] px-[80px] justify-center">
    <div ref="gesturesRef" class="opacity-0 flex items-start gap-x-[40px] w-full items-center">
      <template v-for="(option, index) in options" :key="gestures[index]">
        <div
          class="flex flex-col w-full space-y-[24px] items-center justify-start"
          :class="{ 'opacity-50': selectedIndex !== null && selectedIndex !== index }"
        >
          <div
            class="border-white border-2 rounded-[20px] w-full h-[140px] text-lg px-5 flex items-center justify-center leading-[44px]"
            :class="{ 'bg-white text-black': selectedIndex === index }"
          >
            {{ option }}
          </div>
          <p class="text-sm text-[rgba(255,255,255,0.5)]">Option {{ index + 1 }}</p>

          <div class="w-[200px] h-[265px] flex items-end justify-center">
            <img class="" :src="getGestureImage(index)" alt="" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss"></style>
