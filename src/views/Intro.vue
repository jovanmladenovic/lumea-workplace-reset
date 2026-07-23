<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  import { RoutePaths } from '@/router';
  import { getRandomItemFromArray, animate, sleep } from '@/utils';
  import Animation from '@/components/Animation.vue';

  const quotes = [
    'Turn your reflection into </br> revolution.',
    'Your best self starts with </br> one look in the mirror.',
    'Your future self is </br> already proud of you.',
    'Show up for yourself and </br> your body will reward you.',
    'Small wins today become </br> big changes tomorrow.',
  ];

  const currentQuote = getRandomItemFromArray(quotes);

  const wrapperRef = ref();
  const quoteRef = ref();
  const textRef = ref();
  const router = useRouter();

  const handleVideoEnded = async (): Promise<void> => {
    await quoteRef.value.animateIn();
    await sleep(1000);

    await textRef.value.animateIn();
    await sleep(4000);

    await animate(wrapperRef.value, {
      opacity: 0,
      duration: 2000,
      easing: 'easeOutSine',
    });

    router.push(RoutePaths.Idle);
  };

  onMounted(() => {
    // TODO
    router.push(RoutePaths.Idle);
  });
</script>

<template>
  <div ref="wrapperRef" class="bg-black text-white absolute z-0 left-0 top-0 w-full h-full">
    <video
      autoplay
      playsinline
      :onended="handleVideoEnded"
      class="absolute left-0 top-0 w-full h-full"
    >
      <source src="/videos/home-intro-animation.mp4" type="video/mp4" />
    </video>

    <div class="absolute z-10 left-0 top-[488px] w-full flex flex-col items-center">
      <Animation
        class="text-[184px] leading-[0.4]"
        is="span"
        ref="quoteRef"
        direction="up"
        ignore-mount
      >
        “”
      </Animation>
      <Animation
        class="text-xxl"
        is="p"
        ref="textRef"
        direction="up"
        ignore-mount
        v-html="currentQuote"
      />
    </div>
  </div>
</template>
