<script setup lang="ts">
  import { ref } from 'vue';

  import ActivityStep from '@/components/ActivityStep.vue';
  import StackedMessages from '@/components/StackedMessages.vue';

  const stepRef = ref<InstanceType<typeof ActivityStep>>();
  const messagesRef = ref<InstanceType<typeof StackedMessages>>();

  const animateIn = async () => {
    await stepRef.value?.animateIn();
    return true;
  };

  const animateOut = async () => {
    return Promise.all([stepRef.value?.animateOut(), messagesRef.value?.animateOut()]);
  };

  const showMessage = () => {
    return messagesRef.value?.showMessage();
  };

  defineExpose({ animateIn, animateOut, showMessage });
  const { messages, title = 'Welcome' } = defineProps<{
    messages: { text: string; class?: string }[];
    title?: string;
  }>();
</script>

<template>
  <ActivityStep ref="stepRef" step="1/5" :title="title">
    <StackedMessages ref="messagesRef" :messages="messages" />
  </ActivityStep>
</template>
