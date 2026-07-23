<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref } from 'vue';
  import { utils, animate } from 'animejs';

  import { BASE_ANIMATION_DURATION } from '@/constants';
  import { useBackgroundStore } from '@/stores/background.store';

  const leftBlobRef = ref();
  const rightBlobRef = ref();
  const bottomBlobRef = ref();
  const topBlobRef = ref();

  const backgroundStore = useBackgroundStore();

  function getCurrentBubbleStyle(el: HTMLElement | undefined | null) {
    const defaultStyle = { translateX: 0, translateY: 0, rotate: 0 };
    if (!el) return defaultStyle;
    const style = getComputedStyle(el);
    const t = style.transform;

    if (!t || t === 'none') return defaultStyle;
    // Expecting matrix(a, b, c, d, tx, ty) or matrix3d(...)
    if (t.startsWith('matrix3d(')) {
      // matrix3d(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44)
      const nums = t
        .slice('matrix3d('.length, -1)
        .split(',')
        .map(n => parseFloat(n.trim()));
      const a = nums[0]; // m11
      const b = nums[1]; // m12
      const tx = nums[12]; // m41
      const ty = nums[13]; // m42
      const rotate = (Math.atan2(b, a) * 180) / Math.PI;
      return { translateX: tx, translateY: ty, rotate };
    }
    if (t.startsWith('matrix(')) {
      // matrix(a, b, c, d, tx, ty)
      const nums = t
        .slice('matrix('.length, -1)
        .split(',')
        .map(n => parseFloat(n.trim()));
      const a = nums[0];
      const b = nums[1];
      const tx = nums[4];
      const ty = nums[5];
      const rotate = (Math.atan2(b, a) * 180) / Math.PI;
      return { translateX: tx, translateY: ty, rotate };
    }
    return defaultStyle;
  }

  const initGatheredAnimation = () => {
    // Update centralized layout in the store first so it persists
    backgroundStore.setToGatheredLayout();

    // Then animate DOM elements to those positions
    animate(rightBlobRef.value, backgroundStore.styles.right);
    animate(topBlobRef.value, backgroundStore.styles.top);
    animate(leftBlobRef.value, backgroundStore.styles.left);
    animate(bottomBlobRef.value, backgroundStore.styles.bottom);
  };

  const initRandomAnimation = () => {
    const animationProps = {
      duration: 1 * 60 * BASE_ANIMATION_DURATION,
      loop: true,
    };

    // Animations
    animate(rightBlobRef.value, {
      translateY: [
        backgroundStore.styles.right.translateY,
        backgroundStore.styles.right.translateY - 100,
        backgroundStore.styles.right.translateY,
      ],
      translateX: [
        backgroundStore.styles.right.translateX,
        backgroundStore.styles.right.translateX - 120,
        backgroundStore.styles.right.translateX,
      ],
      rotate: [
        backgroundStore.styles.right.rotate,
        backgroundStore.styles.right.rotate - 45,
        backgroundStore.styles.right.rotate,
      ],
      ...animationProps,
    });

    animate(bottomBlobRef.value, {
      translateY: [
        backgroundStore.styles.bottom.translateY,
        backgroundStore.styles.bottom.translateY - 120,
        backgroundStore.styles.bottom.translateY,
      ],
      translateX: [
        backgroundStore.styles.bottom.translateX,
        backgroundStore.styles.bottom.translateX - 80,
        backgroundStore.styles.bottom.translateX,
      ],
      rotate: [
        backgroundStore.styles.bottom.rotate,
        backgroundStore.styles.bottom.rotate - 45,
        backgroundStore.styles.bottom.rotate,
      ],
      ...animationProps,
    });

    animate(topBlobRef.value, {
      translateY: [
        backgroundStore.styles.top.translateY,
        backgroundStore.styles.top.translateY + 300,
        backgroundStore.styles.top.translateY,
      ],
      translateX: [
        backgroundStore.styles.top.translateX,
        backgroundStore.styles.top.translateX + 100,
        backgroundStore.styles.top.translateX,
      ],
      rotate: [
        backgroundStore.styles.top.rotate,
        backgroundStore.styles.top.rotate + 45,
        backgroundStore.styles.top.rotate,
      ],
      ...animationProps,
    });

    animate(leftBlobRef.value, {
      translateY: [
        backgroundStore.styles.left.translateY,
        backgroundStore.styles.left.translateY - 200,
        backgroundStore.styles.left.translateY,
      ],
      translateX: [
        backgroundStore.styles.left.translateX,
        backgroundStore.styles.left.translateX - 100,
        backgroundStore.styles.left.translateX,
      ],
      rotate: [
        backgroundStore.styles.left.rotate,
        backgroundStore.styles.left.rotate - 45,
        backgroundStore.styles.left.rotate,
      ],
      ...animationProps,
    });
  };

  onMounted(() => {
    // Initial positions
    utils.set(rightBlobRef.value, backgroundStore.styles.right);
    utils.set(bottomBlobRef.value, backgroundStore.styles.bottom);
    utils.set(topBlobRef.value, backgroundStore.styles.top);
    utils.set(leftBlobRef.value, backgroundStore.styles.left);
  });

  onBeforeUnmount(() => {
    // Persist current on-screen transforms into the store
    backgroundStore.setBubbleStyle('right', getCurrentBubbleStyle(rightBlobRef.value));
    backgroundStore.setBubbleStyle('bottom', getCurrentBubbleStyle(bottomBlobRef.value));
    backgroundStore.setBubbleStyle('top', getCurrentBubbleStyle(topBlobRef.value));
    backgroundStore.setBubbleStyle('left', getCurrentBubbleStyle(leftBlobRef.value));
  });

  const animateOut = () => {
    return animate([rightBlobRef.value, bottomBlobRef.value, topBlobRef.value, leftBlobRef.value], {
      opacity: 0,
    });
  };

  defineExpose({ initRandomAnimation, initGatheredAnimation, animateOut });
</script>

<template>
  <div class="">
    <img
      ref="rightBlobRef"
      src="/backgrounds/right-blob.svg"
      class="absolute w-full h-full w-[846px] h-[1355px]"
    />
    <img
      ref="bottomBlobRef"
      src="/backgrounds/bottom-blob.svg"
      class="absolute left-0 top-0 w-full h-full w-[1094px] h-[933px]"
    />
    <img
      ref="topBlobRef"
      src="/backgrounds/top-blob.svg"
      class="absolute left-0 top-0 w-full h-full w-[1326px] h-[1393px]"
    />
    <img
      ref="leftBlobRef"
      src="/backgrounds/left-blob.svg"
      class="absolute left-0 top-0 w-full h-full w-[1588px] h-[1736px]"
    />
  </div>
</template>
