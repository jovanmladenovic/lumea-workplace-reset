<script setup lang="ts">
  import { ref } from 'vue';

  import { BASE_ANIMATION_DURATION } from '@/constants';
  import { sleep } from '@/utils';
  import Message from '@/components/Message.vue';
  import GestureSelect from '@/components/GestureSelect.vue';

  const messageRef = ref();

  const inputRef = ref();

  const emit = defineEmits(['done', 'selected']);

  const options = ['Yes I would', 'Not for now'];

  const onInputChange = async (value: number) => {
    emit('selected', value === 1);

    await sleep(BASE_ANIMATION_DURATION);

    emit('done');
  };

  const animateIn = async () => {
    await messageRef.value?.animateIn();
    await sleep(1000);
    inputRef.value?.animateIn();
  };

  const animateOut = async () => {
    return Promise.all([messageRef.value?.animateOut(), inputRef.value?.animateOut()]);
  };

  defineExpose({ animateOut, animateIn });
</script>

<template>
  <div>
    <Message
      class="z-10"
      ref="messageRef"
      ignore-mount
      sub-text="One last question"
      :messages="[`Would you be willing to repeat this exercise?`]"
      message-class="px-[140px]"
    />

    <GestureSelect ref="inputRef" :options="options" @selected="onInputChange" />
  </div>
</template>
