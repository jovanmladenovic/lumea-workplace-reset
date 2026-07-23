<script setup lang="ts">
  import { ref } from 'vue';

  import { sleep } from '@/utils';
  import { BASE_ANIMATION_DURATION } from '@/constants';

  import ActivityStep from '@/components/ActivityStep.vue';
  import StackedMessages from '@/components/StackedMessages.vue';
  import Breathe from '@/components/activity/Breathe.vue';
  import Animation from '@/components/Animation.vue';
  import BlendingMessages from '../BlendingMessages.vue';

  const stepRef = ref<InstanceType<typeof ActivityStep>>();
  const messagesRef = ref<InstanceType<typeof StackedMessages>>();
  const getReadyRef = ref<InstanceType<typeof Animation>>();
  const breatheRef = ref<InstanceType<typeof Breathe>>();
  const roundMessagesRef = ref<InstanceType<typeof BlendingMessages>>();

  const animateIn = async () => {
    await stepRef.value?.animateIn();
    await messagesRef.value?.showMessage();
    await sleep(BASE_ANIMATION_DURATION * 2);
    getReadyRef.value?.animateIn();
    await breatheRef.value?.animateIn();
    await sleep(BASE_ANIMATION_DURATION * 2);
    getReadyRef.value?.animateOut();
    await animateRound(false);
    await animateRound(true);
    await animateRound(true);
    roundMessagesRef.value?.showMessage();
  };

  const animateRound = async (showRoundMessage: boolean) => {
    if (showRoundMessage) {
      roundMessagesRef.value?.showMessage();
    }
    await breatheRef.value?.animateRound();
  };

  const animateOut = async () => {
    return Promise.all([stepRef.value?.animateOut(), messagesRef.value?.animateOut()]);
  };

  const messages = [
    {
      text: 'Breathe with the rhythm:',
      class: 'text-xl px-[140px]',
    },
  ];

  const roundMessages = [
    {
      text: 'Round 2/3',
      class: 'text-lg px-[140px] font-bold',
    },
    {
      text: 'Round 3/3',
      class: 'text-lg px-[140px] font-bold',
    },
    {
      text: 'Done!',
      class: 'text-lg px-[140px] font-bold',
    },
  ];

  defineExpose({ animateIn, animateOut });
</script>

<template>
  <ActivityStep ref="stepRef" step="2/5" title="Breathing Exercise">
    <StackedMessages ref="messagesRef" :messages="messages" />
    <BlendingMessages
      ref="roundMessagesRef"
      :messages="roundMessages"
      class="text-lg absolute top-[480px]"
    />
    <Animation
      ref="getReadyRef"
      ignore-mount
      class="text-lg absolute top-[480px] left-1/2 transform -translate-x-1/2"
      >Get ready to start</Animation
    >
    <Breathe ref="breatheRef" with-hold />
  </ActivityStep>
</template>
