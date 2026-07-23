<script setup lang="ts">
  import { ref } from 'vue';

  import { sleep } from '@/utils';
  import Message from '@/components/Message.vue';
  import NumbersInput from '@/components/NumbersInput.vue';

  defineProps<{ subText: string }>();
  const messageRef = ref();
  const inputRef = ref();

  const emit = defineEmits(['done', 'energySelected']);

  const onInputChange = async (value: number) => {
    // Let parent handle session update
    emit('energySelected', value);
    await sleep(1000);

    await inputRef.value?.animateOut();
    emit('done');
  };

  const animateOut = async () => {
    messageRef.value?.animateOut();
    inputRef.value?.animateOut();
  };

  const animateIn = async () => {
    await messageRef.value?.animateIn();
    await sleep(1000);
    await inputRef.value?.animateIn();
  };

  defineExpose({ animateIn, animateOut });
</script>

<template>
  <div>
    <Message
      class="z-10"
      ref="messageRef"
      ignore-mount
      :sub-text="subText"
      :messages="[
        `What's your energy level, <br />
on a scale from 1 to 10?`,
      ]"
      message-class=""
    />

    <NumbersInput ref="inputRef" @change="onInputChange" class="mt-[100px]" />
  </div>
</template>
