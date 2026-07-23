<script setup lang="ts">
  import { nextTick, ref, onMounted } from 'vue';
  import { createTimeline } from 'animejs';
  import { useRouter } from 'vue-router';

  import Skip from '@/components/Skip.vue';
  import TutorialFinal from '@/components/tutorial/TutorialFinal.vue';
  import TutorialStep from '@/components/tutorial/TutorialStep.vue';
  import { TutorialOptions, SKIP_VIDEOS, BASE_ANIMATION_DURATION } from '@/constants';
  import { type TutorialStep as TutorialStepType } from '@/types';

  const steps: TutorialStepType[] = [
    {
      gestureType: TutorialOptions.one,
      text: "Try showing <b>Number 1</b> <br/>like it's shown here",
      gestures: [
        {
          type: 'one',
          label: 'Number 1',
        },
      ],
      hints: [
        'Place your hand to the side of your body',
        'Make sure your fingers are facing the camera',
      ],
      completeText: 'Amazing!',
    },
    {
      gestureType: TutorialOptions.seven,
      text: "Try showing <b>Number 7</b> <br/> like it's shown here",
      gestures: [
        {
          type: 'two',
          label: 'Number 2',
        },
        {
          type: 'five',
          label: 'Number 5',
        },
      ],
      hints: [
        'Place your hands to the sides of your body',
        'Make sure your fingers are facing the camera',
      ],
      completeText: "That's correct!",
    },
    {
      gestureType: TutorialOptions.stop,
      text: "Try showing <b>STOP</b> <br/> like it's shown here",
      gestures: [
        {
          type: 'edit',
          label: 'Gesture used for Edit, or Cancel',
        },
      ],
      hints: [
        'Place your hand to the side of your body',
        'Make sure your fingers are all tight together',
        'Make sure your palm is facing the camera',
      ],
      completeText: 'Excellent!',
    },
    {
      gestureType: TutorialOptions.ok,
      text: "Try showing <b>OKAY</b> <br/> like it's shown here",
      label: 'Final step',
      gestures: [
        {
          type: 'ok',
          label: 'Gesture used for Yes, or Okay',
        },
      ],
      hints: ['Show the thumb-up comfortably', 'You can place this gesture in front of you'],
      completeText: 'Like a champ!',
    },
  ];
  const router = useRouter();
  const currentStep = ref(0);
  const titleRef = ref(null);
  const stepRef = ref(null);
  const isCompleted = ref(false);
  const isVideoCompleted = ref(false);
  const videoRef = ref(null);
  const skipRef = ref();
  const showSkip = ref(true);

  const handleOnChangeStep = (step: number) => {
    if (step === steps.length - 1) {
      isCompleted.value = true;
    } else {
      if (steps[step + 1].gestureType === TutorialOptions.stop) {
        showSkip.value = false;
      }
      currentStep.value = step + 1;
      nextTick(() => {
        stepRef.value && stepRef.value.animateIn();
      });
    }
  };

  const handleTutorialComplete = () => {
    router.push('/check-in');
  };

  const handleTransitionIn = () => {
    const tl = createTimeline();

    skipRef.value.animateIn();

    tl.set(titleRef.value, {
      translateY: 160,
      opacity: 0,
    })
      .add(titleRef.value, {
        translateY: 130,
        opacity: 1,
        duration: BASE_ANIMATION_DURATION / 2,
        easing: 'easeOutCirc',
      })
      .add(
        titleRef.value,
        {
          translateY: 0,
          duration: BASE_ANIMATION_DURATION,
          easing: 'easeOutQuart',
        },
        BASE_ANIMATION_DURATION * 2
      )
      .call(() => {
        stepRef.value && stepRef.value.animateIn();
      }, '-=800');
  };
  const handleVideoEnded = () => {
    isVideoCompleted.value = true;
    nextTick(() => {
      handleTransitionIn();
    });
  };

  const handleOnSkip = () => {
    handleTutorialComplete();
  };

  onMounted(() => {
    if (SKIP_VIDEOS) {
      handleVideoEnded();
    }
  });
</script>

<template>
  <template v-if="!isVideoCompleted && !SKIP_VIDEOS">
    <video
      ref="videoRef"
      autoplay
      muted
      playsinline
      onComplete
      @ended="handleVideoEnded"
      class="absolute w-full left-0"
    >
      <source src="/videos/tutorial-video.mp4" type="video/mp4" />
    </video>
  </template>

  <template v-else>
    <Skip v-if="showSkip" ref="skipRef" :onSkip="handleOnSkip" />
    <div
      v-if="!isCompleted"
      class="relative w-full h-full flex items-center justify-start pt-[265px] flex-col font-quicksand"
    >
      <h1 class="text-xxl mb-[140px]" ref="titleRef">Learn to use hand gestures</h1>

      <div :key="currentStep" class="w-full">
        <TutorialStep
          ref="stepRef"
          :index="currentStep"
          :step="steps[currentStep]"
          :onComplete="handleOnChangeStep"
        />
      </div>
    </div>
    <TutorialFinal v-else :onComplete="handleTutorialComplete" />
  </template>
</template>
