<script setup lang="ts">
  import { ref } from 'vue';

  import Animation from './Animation.vue';

  defineProps<{
    messages: {
      text: string;
      class?: string;
    }[];
  }>();

  type AnimationInstance = InstanceType<typeof Animation>;

  const messageRefs = ref<AnimationInstance[]>([]);
  const currentMessageIndex = ref(0);

  const showMessage = () => {
    const idx = currentMessageIndex.value;
    const inst = messageRefs.value[idx];
    if (!inst) {
      // Nothing to show
      return Promise.resolve();
    }
    const promise = inst.animateIn();
    currentMessageIndex.value = idx + 1;
    return promise;
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
  <div class="space-y-[12px]">
    <Animation
      v-for="(message, index) in messages"
      :key="index"
      ref="messageRefs"
      direction="up"
      ignore-mount
      :class="message.class"
      v-html="message.text"
    >
    </Animation>
  </div>
</template>
