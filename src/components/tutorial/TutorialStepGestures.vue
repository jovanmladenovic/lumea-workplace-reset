<script setup lang="ts">
  import { Ref, ref, watch, onMounted } from 'vue';
  import { createTimeline, utils } from 'animejs';

  interface TutorialStepGesturesProps {
    isSelected?: boolean;
    gestures?: {
      type: string;
      label: string;
    }[];
    onClick?: () => void;
    title?: string;
  }

  const props = defineProps<TutorialStepGesturesProps>();
  const elRef = ref<Ref<HTMLElement> | null>(null);
  const gesturesRef = ref<Ref<HTMLElement> | null>(null);
  const titleRef = ref<Ref<HTMLParagraphElement> | null>(null);

  const animateIn = () => {
    const tl = createTimeline();

    tl.add(titleRef.value ? [gesturesRef.value, titleRef.value] : gesturesRef.value, {
      scale: 1,
      translateY: 0,
      opacity: 1,
      duration: 1000,
      easing: 'easeOutQuart',
    });
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

  watch(
    () => props.isSelected,
    (newVal, oldVal) => {
      if (newVal) {
      }
    }
  );

  const getGestureImage = (gesture: string) => {
    return `/images/icons/icons-hand-${gesture}-${props.isSelected ? 'selected' : 'active'}.svg`;
  };
</script>

<template>
  <div ref="elRef" class="grid gap-y-[41px] justify-center">
    <p
      v-if="title"
      ref="titleRef"
      class="text-sm text-[#7f807f] after:content-[''] after:w-[90px] after:h-px after:bg-[#7f807f] after:block after:mx-auto after:mt-[20px]"
    >
      {{ title }} 1
    </p>
    <div ref="gesturesRef" class="opacity-0 inline-flex gap-x-[40px] items-center">
      <template v-for="(gesture, index) in props.gestures" :key="gesture.type">
        <span v-if="index > 0" class="text-xxl mt-[-20px]">+</span>

        <div>
          <component
            :is="onClick ? 'button' : 'div'"
            v-bind="onClick && { onClick }"
            :class="`${
              isSelected ? 'bg-white' : ''
            } border-white border-2 rounded-[20px] w-[270px] h-[270px] p-1 mb-[31px]`"
          >
            <img class="block w-full h-full" :src="getGestureImage(gesture.type)" alt="" />
          </component>
          <p class="text-sm text-[#7f807f]">{{ gesture.label }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss"></style>
