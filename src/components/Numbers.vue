<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { animate } from '@/utils';

  import { AnimationDirection, itemFadeOut, pulse, sleep } from '../utils';

  import Animation from './Animation.vue';

  const NUMBER_WORDS = ['first', 'second', 'third'];

  const props = defineProps([
    'inputsNumber',
    'label',
    'hint',
    'value',
    'manual',
    'successHint',
    'currentIndex',
  ]);
  const emit = defineEmits(['change']);

  const inputs = ref(Array.apply(null, Array(Number(props.inputsNumber))).map(() => ''));
  const bordersRef = ref();
  const elementWidth = ref();
  const elementHeight = ref();
  const wrapperRef = ref();
  const inputsRef = ref();
  const visible = ref(false);
  const instructionsRef = ref();

  const completed = computed(() => props.value || props.currentIndex === props.inputsNumber);

  let pulseAnimation: any = null;

  const handleChange = async (index: number) => {
    emit('change', inputs.value[index]);
  };

  watch(
    () => props.currentIndex,
    () => {
      animatePulse();
    }
  );

  const animatePulse = async () => {
    await sleep(300);
    if (props.manual) {
      pulseAnimation = pulse('.number-input__holder input');
    } else {
      pulseAnimation = pulse('.number-input__holder--active input');
    }
  };

  const animateNumberResult = async () => {
    pulseAnimation.pause();

    animate(['.number-input__holder--active input', instructionsRef.value.$el], {
      duration: 100,
      opacity: 0,
      easing: 'linear',
    });

    return animate(['.number-input__holder--active input', instructionsRef.value.$el], {
      duration: 400,
      translateY: ['-30%', 0],
      opacity: [0, 1],
      easing: 'linear',
    });
  };

  const animateBorder = async (index: number) => {
    animate(bordersRef.value[index], {
      delay: 100,
      duration: 400,
      opacity: 1,
      easing: 'linear',
    });

    const borderIndex = index + 1;
    const marginY = borderIndex * 3;
    const marginX = borderIndex * 2;

    return animate(bordersRef.value[borderIndex], {
      delay: 100,
      duration: 400,
      top: `${marginY}%`,
      height: [`100%`, `${100 - marginY * 2}%`],
      left: `${marginX}%`,
      width: [`100%`, `${100 - marginX * 2}%`],
      easing: 'linear',
      opacity: 0.5,
      borderRadius: `${4 - index}%`,
    });
  };

  const animateIndicator = async (index: number) => {
    const wrapperRect = wrapperRef.value.getBoundingClientRect();
    const nextInputRect = inputsRef.value.$el
      .querySelectorAll('input')
      [index].getBoundingClientRect();

    const left = `${nextInputRect.left - wrapperRect.left - 38}px`;
    let properties;

    if (index === 0) {
      wrapperRef.value.querySelector('.number-input__indicator').style.left = left;
      properties = {
        opacity: [0, 1],
      };
    } else {
      properties = {
        left,
      };
    }

    return animate(`.number-input__indicator`, {
      delay: 100,
      duration: 400,
      ...properties,
      easing: 'linear',
    }).finished;
  };

  const setValue = async (index: number, value: number) => {
    if (index < props.inputsNumber - 1 && !props.manual) {
      animateBorder(index);
      animateIndicator(index + 1);
    }

    await animateNumberResult();

    inputs.value[index] = value.toString();
  };

  const getValue = () => {
    return inputs.value.join('');
  };

  const animateIn = async () => {
    visible.value = true;

    await sleep(100);
    const clientRect = wrapperRef.value.getBoundingClientRect();
    elementWidth.value = clientRect.width + 'px';
    elementHeight.value = clientRect.height + 'px';

    // animate initial border
    animate(bordersRef.value[0], {
      delay: 100,
      duration: 400,
      opacity: 0.5,
      easing: 'linear',
    });

    animatePulse();

    if (!props.manual) {
      animateIndicator(0);
    }

    return inputsRef.value.animateIn();
  };

  const animateOut = () => {
    return itemFadeOut(wrapperRef.value, 1000, 1000, AnimationDirection.up);
  };

  defineExpose({
    setValue,
    getValue,
    animateIn,
    animateOut,
  });
</script>

<template>
  <div
    v-if="visible"
    ref="wrapperRef"
    class="number-input pb-6 pt-5 px-5 flex flex-col justify-between"
    :class="{
      'number-input--completed': completed,
      'number-input--manual': props.manual,
    }"
    :style="{ width: elementWidth, height: elementHeight }"
  >
    <div ref="bordersRef" v-for="input in inputs" class="number-input__border" />
    <div class="pb-2 text-sm">
      <template v-if="props.manual">
        <Animation v-if="!props.value" :direction="AnimationDirection.down">
          {{ props.hint }}
        </Animation>
        <span v-else> {{ props.successHint }} </span>
      </template>
      <template v-else>
        <Animation v-if="!completed" direction="down" ref="instructionsRef">
          Show
          <span class="underline">{{ NUMBER_WORDS[currentIndex] }}</span> number
        </Animation>
        <Animation v-else> Awesome!</Animation>
      </template>
    </div>
    <Animation class="number-input__value" v-if="props.value">
      {{ props.value }}
    </Animation>
    <Animation v-else class="flex justify-center relative" ref="inputsRef" :on-mount="false">
      <div v-if="!props.manual" class="number-input__indicator"></div>
      <div
        class="number-input__holder flex justify-center"
        :class="{ 'number-input__holder--active': index === currentIndex }"
        v-for="(input, index) in inputs"
      >
        <input
          v-model="inputs[index]"
          type="text"
          @change="handleChange(index)"
          maxlength="1"
          placeholder="0"
        />
      </div>
    </Animation>
    <Animation class="pt-5 text-sm">
      {{ props.label }}
    </Animation>
  </div>
</template>

<style lang="scss">
  .number-input {
    float: left;
    position: relative;
    border-radius: 20px;
    margin-bottom: 10px;
    min-width: 420px;

    &__border {
      border: 2px solid #fff;
      width: 100%;
      height: 100%;
      position: absolute;
      z-index: -1;
      left: 0;
      top: 0;
      border-radius: 5%;
      opacity: 0;
    }

    &--manual {
      .number-input__holder {
        position: relative;

        &:after {
          content: ' ';
          width: 80%;
          height: 1px;
          background-color: #fff;
          position: absolute;
          bottom: 0;
          left: 10%;
        }
      }
    }

    &--completed {
      background: white;
      color: #000;

      input {
        background: white !important;
      }

      .number-input__value {
        font-size: 140px;
        color: #000;
      }
    }

    &__holder {
      width: 90px;
      height: 150px;
      margin: 0 2px;
    }

    &__indicator {
      width: 72px;
      height: 2px;
      position: absolute;
      bottom: 0;
      background-color: #fff;
    }

    input {
      background: transparent;
      font-size: 140px;
      width: 80px;
      text-align: center;

      &:focus {
        outline: none;
      }
    }
  }
</style>
