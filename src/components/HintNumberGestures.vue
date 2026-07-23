<script setup lang="ts">
  import { ref } from 'vue';
  import { createTimeline } from 'animejs';

  import { animate } from '@/utils';

  const animationInTl = ref();
  const elRef = ref(null);
  const titleRef = ref(null);
  const textRef = ref(null);
  const gesturesRef = ref(null);

  const gestures = [
    {
      name: 'Zero',
      img: 'icons-hand-train-active',
    },
    {
      name: 'One',
      img: 'icons-hand-one-active',
    },
    {
      name: 'Two',
      img: 'icons-hand-two-active',
    },
    {
      name: 'Three',
      img: 'icons-hand-three-active',
    },
    {
      name: 'Four',
      img: 'icons-hand-four-active',
    },
    {
      name: 'Five',
      img: 'icons-hand-five-active',
    },
  ];

  const animateIn = () => {
    animationInTl.value = createTimeline();

    animationInTl.value
      .set([titleRef.value, textRef.value, gesturesRef.value], {
        translateY: 50,
        opacity: 0,
      })

      .add({
        targets: [titleRef.value, textRef.value],
        translateY: 0,
        opacity: 1,
        duration: 1500,
        easing: 'easeOutQuart',
        // delay: anime.stagger(100),
      })
      .add(
        {
          targets: gesturesRef.value,
          translateY: 0,
          opacity: 1,
          duration: 1000,
          easing: 'easeOutQuart',
          // delay: anime.stagger(50),
        },
        500
      );
  };

  const animateOut = () => {
    animate(elRef.value, {
      opacity: 0,
      duration: 500,
      ease: 'easeInCubic',
    });
  };

  defineExpose({
    animateIn,
    animateOut,
  });
</script>

<template>
  <div class="relative" ref="elRef">
    <h3
      ref="titleRef"
      class="text-sm text-[#7f807f] mb-[20px] after:content-[''] after:w-[90px] after:h-px after:bg-[#7f807f] after:block after:mx-auto after:mt-[15px] opacity-0"
    >
      Reminder
    </h3>

    <p ref="textRef" class="text-sm text-[#ffffff] text-center opacity-0">
      Numbers are shown by using fingers of your hand.
      <br />
      <br />
      For example:
    </p>

    <ul class="flex gap-3 text-center justify-center mt-[60px] text-sm">
      <li class="opacity-0" v-for="gesture in gestures" :key="gesture.name" ref="gesturesRef">
        <img class="mb-5 h-[170px]" :src="`../assets/images/${gesture.img}.svg`" />
        <span>{{ gesture.name }}</span>
      </li>
    </ul>
  </div>
</template>
