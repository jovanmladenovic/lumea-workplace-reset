<script setup lang="ts">
  import { onMounted, ref, computed } from 'vue';

  import { animate, itemFadeOut, AnimationDirection, ComponentAnimationEvents } from '@/utils';
  import { BASE_ANIMATION_DURATION } from '@/constants';

  const props = defineProps({
    onMount: {
      type: Boolean,
      default: true,
    },
    ignoreMount: {
      type: Boolean,
    },
    direction: {
      type: String,
    },
    delay: {
      type: Number,
      default: 0,
    },
    // used differentiate components for logging
    log: {},
  });

  const emit = defineEmits([ComponentAnimationEvents.entered]);

  const elementRef = ref();
  const rendered = ref(true);
  const initialOpacity = ref('');

  const offset = 45;
  let transforms = {};

  const animationStarted = ref(false);

  if (props.direction) {
    if (props.direction === AnimationDirection.up) {
      // @ts-ignore
      transforms = { translateY: [offset, 0] };
    } else if (props.direction === AnimationDirection.down) {
      transforms = { translateY: [-offset, 0] };
    } else if (props.direction === AnimationDirection.left) {
      transforms = { translateX: [offset, 0] };
    } else {
      transforms = { translateX: [-offset, 0] };
    }
  }

  const animateIn = (delay?: number): Promise<void> => {
    if (initialOpacity.value === '') {
      const opacity = getComputedStyle(elementRef.value).opacity;

      initialOpacity.value = opacity === '0' ? '1' : opacity;
    }

    elementRef.value.style.opacity = 0;
    elementRef.value.style.visibility = 'visible';

    return new Promise(resolve => {
      animate(elementRef.value, {
        duration: BASE_ANIMATION_DURATION,
        delay: delay || props.delay || 0,
        // Fade in to original opacity
        opacity: initialOpacity.value,
        ...transforms,
        onComplete: () => {
          emit(ComponentAnimationEvents.entered);
          resolve();
        },
      });
    });
  };

  const animateOut = (delay: number = 0): Promise<void> => {
    let transforms = {
      opacity: 0,
      translateY: 0,
      translateX: 0,
    };

    if (props.direction) {
      if (props.direction === AnimationDirection.up) {
        // @ts-ignore
        transforms = { ...transforms, translateY: offset };
      } else if (props.direction === AnimationDirection.down) {
        transforms = { ...transforms, translateY: -offset };
      } else if (props.direction === AnimationDirection.left) {
        transforms = { ...transforms, translateX: offset };
      }
    }

    return new Promise(resolve => {
      animate(elementRef.value, {
        duration: BASE_ANIMATION_DURATION,
        delay: delay || props.delay || 0,
        // Fade out to 0 opacity on exit
        opacity: 0,
        ...transforms,
        onComplete: () => {
          emit(ComponentAnimationEvents.entered);
          resolve();
        },
      });
    });
  };

  const remove = () => {
    rendered.value = false;
  };

  onMounted(() => {
    if (props.onMount && !props.ignoreMount) {
      animateIn();
    }
  });

  const classes = computed(() => {
    return {
      invisible: !animationStarted.value,
    };
  });

  defineExpose({
    animateIn,
    animateOut,
    remove,
  });
</script>

<template>
  <div v-if="rendered" :class="classes" ref="elementRef">
    <slot></slot>
  </div>
</template>
