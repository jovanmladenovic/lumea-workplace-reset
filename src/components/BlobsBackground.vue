<script setup lang="ts">
  import { onMounted, onBeforeUnmount, ref } from 'vue';
  import { utils, animate as jsAnimate } from 'animejs';

  import { animate } from '@/utils';

  const holderRef = ref();

  const topBlobRef = ref();
  const rightBlobRef = ref();
  const bottomBlobRef = ref();
  const leftBlobRef = ref();

  defineProps<{
    topBlobColor: string;
    rightBlobColor: string;
    bottomBlobColor: string;
    leftBlobColor: string;
    blobClasses?: string;
  }>();

  onMounted(() => {
    utils.set(topBlobRef.value, {
      top: -1200,
      left: -1200,
    });

    utils.set(rightBlobRef.value, {
      top: 0,
      left: 1200,
    });

    utils.set(bottomBlobRef.value, {
      top: 2000,
      left: 1200,
    });

    utils.set(leftBlobRef.value, {
      top: 1000,
      left: -1200,
    });

    // Start subtle continuous drift around current positions
    startDrift();
  });

  onBeforeUnmount(() => {
    stopDrift();
  });

  // Subtle continuous drift animation instances
  let topDrift: any | null = null;
  let rightDrift: any | null = null;
  let bottomDrift: any | null = null;
  let leftDrift: any | null = null;

  const createDrift = (
    el: HTMLElement,
    rangeX: [number, number],
    rangeY: [number, number],
    duration: number
  ) => {
    // Use transforms only so we do not interfere with top/left/rotate animations
    return jsAnimate(el, {
      translateX: rangeX.map(x => x * 3),
      translateY: rangeY.map(y => y * 3),
      duration,
      alternate: true,
      loop: true,
    });
  };

  const startDrift = () => {
    // If already running, stop first
    stopDrift();

    if (topBlobRef.value) {
      topDrift = createDrift(topBlobRef.value, [-14, 14], [-10, 10], 12000);
    }
    if (rightBlobRef.value) {
      rightDrift = createDrift(rightBlobRef.value, [10, -12], [-14, 8], 14000);
    }
    if (bottomBlobRef.value) {
      bottomDrift = createDrift(bottomBlobRef.value, [-12, 12], [-8, 12], 15000);
    }
    if (leftBlobRef.value) {
      leftDrift = createDrift(leftBlobRef.value, [-16, 10], [-12, 14], 13000);
    }
  };

  const stopDrift = () => {
    try {
      topDrift && topDrift.pause && topDrift.pause();
      rightDrift && rightDrift.pause && rightDrift.pause();
      bottomDrift && bottomDrift.pause && bottomDrift.pause();
      leftDrift && leftDrift.pause && leftDrift.pause();
    } finally {
      topDrift = rightDrift = bottomDrift = leftDrift = null;
    }
  };

  const setBackgroundColor = (bgColor: string, instant?: boolean) => {
    if (instant) {
      utils.set(holderRef.value, {
        backgroundColor: bgColor,
      });
      return;
    }

    return animate(holderRef.value, {
      backgroundColor: bgColor,
    });
  };

  const animateOut = () => {
    return animate(holderRef.value, {
      opacity: 0,
    });
  };

  const showCornerBlobs = () => {
    return Promise.all([
      animate(topBlobRef.value, {
        top: -719,
        left: -563,
        rotate: 0,
      }),
      animate(rightBlobRef.value, {
        top: 0,
        left: 872,
        rotate: -10,
      }),
      animate(bottomBlobRef.value, {
        top: 1500,
        left: 210,
        rotate: 20,
      }),
      animate(leftBlobRef.value, {
        top: 200,
        left: -1000,
        rotate: 0,
      }),
    ]);
  };

  const showBlobs = () => {
    return Promise.all([
      animate(topBlobRef.value, {
        top: -619,
        left: -663,
        rotate: -20,
      }),
      animate(rightBlobRef.value, {
        top: 82,
        left: 772 + 200,
        rotate: 18,
      }),
      animate(bottomBlobRef.value, {
        top: 1200,
        left: 210,
        rotate: -7,
      }),
      animate(leftBlobRef.value, {
        top: 800,
        left: -700,
        rotate: -36,
      }),
    ]);
  };

  const hideBlobs = () => {
    return Promise.all([
      animate(topBlobRef.value, {
        top: -1000,
        left: -1000,
      }),
      animate(rightBlobRef.value, {
        top: 0,
        left: 1200,
      }),
      animate(bottomBlobRef.value, {
        top: 2000,
        left: 1200,
      }),
      animate(leftBlobRef.value, {
        top: 1000,
        left: -1500,
      }),
    ]);
  };

  const moveBlobs = () => {
    return Promise.all([
      animate(topBlobRef.value, {
        top: -719,
        left: -463,
        rotate: -8,
      }),
      animate(rightBlobRef.value, {
        top: -180,
        left: 656 + 200,
        rotate: 7.8,
      }),
      animate(bottomBlobRef.value, {
        top: 1207,
        left: 247,
        rotate: 0,
      }),
      animate(leftBlobRef.value, {
        top: 800,
        left: -900,
        rotate: -36,
      }),
    ]);
  };

  const moveBlobs2 = () => {
    return Promise.all([
      animate(topBlobRef.value, {
        top: -619,
        left: -663,
        rotate: -20,
      }),
      animate(rightBlobRef.value, {
        top: 380,
        left: 656 + 300,
        rotate: 18.8,
      }),
      animate(bottomBlobRef.value, {
        top: 1357,
        left: 247,
        rotate: -10,
      }),
      animate(leftBlobRef.value, {
        top: 1000,
        left: -800,
        rotate: -46,
      }),
    ]);
  };

  const moveBlobs3 = () => {
    return Promise.all([
      animate(topBlobRef.value, {
        top: -619,
        left: -672,
        rotate: -4,
      }),
      animate(rightBlobRef.value, {
        top: -370,
        left: 740,
        rotate: -12.2,
      }),
      animate(bottomBlobRef.value, {
        top: 1382,
        left: 106,
        rotate: 22,
      }),
      animate(leftBlobRef.value, {
        top: 1100,
        left: -900,
        rotate: -48,
      }),
    ]);
  };

  defineExpose({
    setBackgroundColor,
    animateOut,
    showBlobs,
    showCornerBlobs,
    moveBlobs,
    moveBlobs2,
    moveBlobs3,
    hideBlobs,
  });
</script>

<template>
  <div ref="holderRef" class="absolute w-full h-full z-0">
    <svg
      ref="topBlobRef"
      class="absolute"
      :class="blobClasses"
      width="1326"
      height="1393"
      viewBox="0 0 1719 1088"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        :fill="topBlobColor"
        d="M341.425 1048.5C247.636 1111.2 167.721 1105.3 23.1312 982.588C-121.459 859.876 477.81 161.085 672.274 94.2142C866.737 27.3436 1006.31 -74.3087 1198.72 84.8299C1391.14 243.968 1900.31 482.39 1650.5 654.168C1571.04 708.804 1438.53 770.073 1291.47 805.945C1107.63 850.786 829.719 796.663 666.311 836.521C502.903 876.38 458.661 970.129 341.425 1048.5Z"
      />
    </svg>

    <svg
      ref="bottomBlobRef"
      class="absolute"
      :class="blobClasses"
      width="1131"
      height="866"
      viewBox="0 0 1131 866"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M789.422 52.7442C837.305 -5.89091 889.751 -17.7888 1006.64 32.5794C1123.53 82.9477 1183.26 678.931 1071.58 760C959.906 841.069 583.174 903.688 428.435 839.332C273.696 774.975 -99.8992 721.901 26.6982 562.655C66.9636 512.006 139.976 446.689 227.319 394.812C336.497 329.965 525.488 310.159 622.536 252.518C719.583 194.876 729.569 126.038 789.422 52.7442Z"
        :fill="bottomBlobColor"
      />
    </svg>

    <svg
      ref="rightBlobRef"
      class="absolute"
      :class="blobClasses"
      width="841"
      height="1401"
      viewBox="0 0 841 1401"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M63.1359 460.306C11.2262 330.471 15.1755 152.091 254.592 18.1238C489.08 -59.8296 500.311 137.903 506.662 312.859C513.014 487.815 659.358 598.107 757.147 778.915C854.936 959.724 922.625 1128.93 621.607 1304.29C320.589 1479.65 115.402 1400.07 22.1813 1191.25C-49.4452 1030.81 70.6195 920.006 144.941 769.12C219.262 618.235 115.046 590.14 63.1359 460.306Z"
        :fill="rightBlobColor"
      />
    </svg>
    <svg
      ref="leftBlobRef"
      class="absolute"
      :class="blobClasses"
      width="1588"
      height="1736"
      viewBox="0 0 1198 2184"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1046.79 942.666C1125.41 676.13 993.08 443.274 771.466 170.748C549.852 -101.778 483.91 -7.42114 416.438 173.38C348.965 354.182 466.659 476.193 285.407 761.396C104.154 1046.6 -214.04 1049.23 215.136 1703.88C644.311 2358.53 977.372 2231.2 1052.55 1974.56C1127.73 1717.91 1238.74 1652.18 1182.5 1463.19C1126.25 1274.2 968.173 1209.2 1046.79 942.666Z"
        :fill="leftBlobColor"
      />
    </svg>
  </div>
</template>
