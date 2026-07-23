<script setup lang="ts">
  import { ref } from 'vue';

  import { sleep } from '@/utils';
  import { InterventionType } from '@/constants';
  import Message from '@/components/Message.vue';
  import GestureSelect from '@/components/GestureSelect.vue';

  const messageRef = ref();

  const inputRef = ref();

  const emit = defineEmits(['done', 'interventionSelected']);

  const options = [
    InterventionType.EnergyBoost,
    InterventionType.MentalBalance,
    InterventionType.ResetFocus,
  ];

  const onInputChange = async (value: number) => {
    emit('interventionSelected', options[value - 1]);

    await sleep(1000);

    emit('done');
  };

  const animateIn = async () => {
    await messageRef.value?.animateIn();
    await sleep(1000);
    inputRef.value?.animateIn();
  };

  const animateOut = async () => {
    messageRef.value?.animateOut();
    inputRef.value?.animateOut();
  };

  defineExpose({ animateOut, animateIn });
</script>

<template>
  <Message
    class="z-10"
    ref="messageRef"
    ignore-mount
    sub-text="Now, tell us"
    :messages="[`What do you need right now?`]"
    message-class=""
  />

  <GestureSelect ref="inputRef" :options="options" @selected="onInputChange" />
</template>
