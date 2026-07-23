<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';
  import { createTimeline, utils } from 'animejs';

  import { userInput } from '@/services';
  import { BASE_ANIMATION_DURATION } from '@/constants';
  import {
    sleep,
    InputEmitEvents,
    InputReceiveEvents,
    TutorialOptions,
    InputEmitEventsPayloads,
  } from '@/utils';
  import { type TutorialStep } from '@/types';

  import TutorialStepGestures from './TutorialStepGestures.vue';

  const props = defineProps<{
    onComplete: (index: number) => void;
    index: number;
    step: TutorialStep;
  }>();

  const elementRef = ref(null);
  const indexRef = ref(null);
  const titleRef = ref<Ref<HTMLElement> | null>(null);
  const gesturesRef = ref<InstanceType<typeof TutorialStepGestures> | null>(null);
  const completeTextRef = ref<Ref<HTMLElement> | null>(null);
  const helpTextRef = ref<Ref<HTMLElement> | null>(null);
  const helpTextItemRef = ref<Ref<HTMLElement> | null>(null);

  const isSelected = ref(false);
  const animationInTl = ref();

  const animateIn = async () => {
    animationInTl.value = createTimeline();

    animationInTl.value.add([indexRef.value, titleRef.value], {
      translateY: 0,
      opacity: 1,
      duration: BASE_ANIMATION_DURATION,
      easing: 'easeOutQuart',
    });

    animationInTl.value
      .call(() => {
        gesturesRef.value.animateIn();
      }, 100)
      .add(
        [helpTextRef.value, helpTextItemRef.value],
        {
          translateY: 0,
          opacity: 1,
          duration: BASE_ANIMATION_DURATION * 1.5,
          easing: 'easeOutQuart',
        },
        BASE_ANIMATION_DURATION * 5
      );
  };

  const animateOut = () => {
    const tl = createTimeline({
      onComplete: () => props.onComplete(props.index),
    });

    tl.add(helpTextRef.value, {
      opacity: 0,
      duration: 200,
      easing: 'easeOutQuart',
    })
      .add(
        completeTextRef.value,
        {
          opacity: 1,
          translateY: 0,
          duration: 500,
          easing: 'easeOutQuart',
        },
        0
      )
      .add(
        elementRef.value,
        {
          opacity: 0,
          duration: 500,
          easing: 'easeOutQuart',
        },
        700
      );
  };

  const requestUserInput = () => {
    userInput.emit(InputEmitEvents.request_user_input, {
      ...InputEmitEventsPayloads.tutorial,
      options: [
        TutorialOptions.one,
        TutorialOptions.seven,
        TutorialOptions.eight,
        TutorialOptions.zero,
        TutorialOptions.stop,
        TutorialOptions.ok,
      ],
    });
  };

  const handleOnSelect = async (selected: TutorialOptions | number) => {
    if (selected === props.step.gestureType) {
      isSelected.value = true;
      return;
    }

    await sleep(1000);
    requestUserInput();
  };

  const handleOnClickOption = () => {
    isSelected.value = true;
  };

  watch(isSelected, isSelected => {
    if (isSelected) {
      animationInTl.value && animationInTl.value.pause();
      animateOut();
    }
  });

  onMounted(() => {
    utils.set(
      [
        completeTextRef.value,
        indexRef.value,
        titleRef.value,
        helpTextRef.value,
        helpTextItemRef.value,
      ],
      {
        translateY: 50,
        opacity: 0,
      }
    );

    requestUserInput();

    userInput.on(InputReceiveEvents.user_input, (response: TutorialOptions) => {
      handleOnSelect(response);
    });
  });

  onBeforeUnmount(() => {
    userInput.off(InputReceiveEvents.user_input);
  });

  defineExpose({
    animateIn,
  });
</script>

<template>
  <div class="flex flex-col items-center w-full" ref="elementRef">
    <span ref="indexRef" class="text-sm text-[#7f807f] mb-[20px]">
      <template v-if="step.label">{{ step.label }}</template>
      <template v-else>Step {{ index + 1 }}</template>
    </span>
    <h2 ref="titleRef" v-html="step.text" class="mb-[60px] max-w-[472px]"></h2>

    <TutorialStepGestures
      ref="gesturesRef"
      :gestures="step.gestures"
      :isSelected="isSelected"
      :onClick="handleOnClickOption"
    />

    <div class="relative mt-[140px]">
      <h3
        ref="helpTextRef"
        class="text-sm text-[#7f807f] mb-[41px] after:content-[''] after:w-[90px] after:h-px after:bg-[#7f807f] after:block after:mx-auto after:mt-[20px]"
      >
        Helpful tips
      </h3>
      <ul class="w-full text-left grid gap-y-3">
        <template v-for="(hint, index) in step.hints" :key="hint">
          <li ref="helpTextItemRef" class="">{{ index + 1 }}. {{ hint }}</li>
        </template>
      </ul>

      <p ref="completeTextRef" class="text-xxl absolute top-0 w-full text-center">
        {{ step.completeText }}
      </p>
    </div>
  </div>
</template>

<style lang="scss"></style>
