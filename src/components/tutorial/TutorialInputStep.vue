<script setup lang="ts">
  import { nextTick, Ref, ref } from 'vue';
  import { createTimeline } from 'animejs';

  import { sleep, TutorialOptions } from '@/utils';
  import Numbers from '../Numbers.vue';

  import TutorialStepGestures from './TutorialStepGestures.vue';

  interface TutorialInputStepProps {
    hints: {
      initText?: string;
      gestures: {
        type: string;
        label: string;
      }[];
      completeText: string;
    }[];
    gestureType: TutorialOptions[];
    onChangeInput: (value: number) => void;
    onComplete: () => void;
  }

  const props = defineProps<TutorialInputStepProps>();

  const currentHint = ref(0);
  const currentInput = ref(0);
  const finalInputValue = ref<number | null>(null);

  const inputRef = ref<InstanceType<typeof Numbers> | null>(null);
  const initText = ref<Ref<HTMLElement> | null>(null);
  const completeText = ref<Ref<HTMLElement> | null>(null);
  const gesturesRef = ref<InstanceType<typeof TutorialStepGestures> | null>(null);

  const hintAnimationIn = (onComplete?: () => void) => {
    const tl = createTimeline({
      onComplete: onComplete,
    });

    if (props.hints[currentHint.value].initText) {
      tl.add(initText.value, {
        opacity: 1,
        translateY: [50, 0],
        easing: 'easeOutQuart',
        duration: 700,
      });
      tl.add(
        initText.value,
        {
          opacity: 0,
          easing: 'linear',
          duration: 100,
        },
        1500
      );
    }

    tl.call(() => {
      gesturesRef.value && gesturesRef.value.animateIn();
    }, 5000);
  };

  const hintAnimationOut = (onComplete: () => void) => {
    const tl = createTimeline({
      complete: onComplete,
    });

    tl.call(() => {
      gesturesRef.value && gesturesRef.value.animateOut();
    })
      .add(
        completeText.value,
        {
          opacity: 1,
          translateY: [50, 0],
          easing: 'easeOutQuart',
          duration: 700,
        },
        100
      )
      .add(
        completeText.value,
        {
          opacity: 0,
          easing: 'linear',
          duration: 200,
        },
        1000
      );
  };

  const animateIn = async () => {
    inputRef.value && inputRef.value.animateIn();
    await sleep(5000);
    hintAnimationIn();
  };

  const onSelect = (value: TutorialOptions | number) => {
    const finalValue = value === 0 ? 'train' : value;
    if (finalValue === props.gestureType[currentHint.value]) {
      if (currentHint.value === props.hints.length - 1) {
        finalInputValue.value = parseInt(
          props.gestureType.map(val => (val === 'train' ? 0 : val)).join('')
        );
        hintAnimationOut(() => {
          props.onComplete();
        });
        return;
      }
      inputRef.value && inputRef.value.setValue(currentHint.value, value as number);
      hintAnimationOut(async () => {
        await sleep(800);
        currentInput.value = currentInput.value + 1;
        currentHint.value = currentInput.value;
        nextTick(() => {
          hintAnimationIn();
        });
      });
    }
  };

  defineExpose({
    animateIn,
    onSelect,
  });
</script>

<template>
  <div :class="'w-full flex flex-col items-center'">
    <Numbers
      ref="inputRef"
      :inputs-number="hints.length"
      :manual="false"
      :label="''"
      :value="finalInputValue"
      :current-index="currentInput"
      @change="
        e => {
          onChangeInput(parseInt(e));
        }
      "
    />

    <div
      :class="'w-full mt-[100px] relative'"
      v-if="currentInput == currentHint"
      :key="currentHint"
    >
      <p
        ref="initText"
        v-html="hints[currentHint].initText"
        class="text-xxl absolute top-0 w-full text-center opacity-0"
      ></p>
      <TutorialStepGestures
        ref="gesturesRef"
        :title="'Try showing this'"
        :gestures="hints[currentHint].gestures"
      />
      <p
        ref="completeText"
        v-html="hints[currentHint].completeText"
        class="text-xxl absolute top-0 w-full text-center opacity-0"
      ></p>
    </div>
  </div>
</template>

<style lang="scss"></style>
