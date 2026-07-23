<script setup lang="ts">
  import { ref } from 'vue';
  import twMerge from 'tailwind-merge';

  import Animation from './Animation.vue';

  const props = defineProps<{
    messages: {
      text: string;
      class?: string;
    }[];
  }>();

  type AnimationInstance = InstanceType<typeof Animation>;

  const messageRefs = ref<AnimationInstance[]>([]);
  const currentMessageIndex = ref(0);

  const showMessage = () => {
    const currentIndex = currentMessageIndex.value;
    const prevMessageIndex = currentIndex - 1;

    if (prevMessageIndex > -1) {
      messageRefs.value[prevMessageIndex].animateOut();
    }

    currentMessageIndex.value === props.messages.length - 1
      ? (currentMessageIndex.value = 0)
      : currentMessageIndex.value++;

    return messageRefs.value[currentIndex].animateIn();
  };

  const animateOut = () => {
    const promises: Promise<void>[] = [];

    messageRefs.value.forEach(ref => {
      if (ref) {
        promises.push(ref.animateOut());
      }
    });

    return Promise.all(promises);
  };

  const reset = async () => {
    // Ensure all messages are hidden and start index from 0
    await animateOut();
    currentMessageIndex.value = 0;
  };

  defineExpose({ animateOut, showMessage, reset });
</script>

<template>
  <div class="w-full">
    <Animation
      v-for="(message, index) in messages"
      :key="index"
      ref="messageRefs"
      direction="up"
      ignore-mount
      class="absolute top-0 w-full"
      :class="message.class"
      v-html="message.text"
    />
  </div>
</template>
