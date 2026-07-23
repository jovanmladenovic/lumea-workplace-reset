<script setup lang="ts">
  import { ref } from 'vue';

  import { sleep } from '@/utils';
  import { useSessionData } from '@/composables/useSessionData';
  import Message from '@/components/Message.vue';
  import Confirm from '@/components/Confirm.vue';

  const messageRef = ref();

  const confirmRef = ref();

  const emit = defineEmits(['done', 'selected']);

  const { endSession } = useSessionData();

  const handleConfirm = async () => {
    await endSession();
    emit('done');
  };

  const animateIn = async () => {
    await messageRef.value?.animateIn();
    await sleep(1000);
    confirmRef.value?.animateIn();
  };

  const animateOut = async () => {
    return Promise.all([messageRef.value?.animateOut(), confirmRef.value?.animateOut()]);
  };

  defineExpose({ animateOut, animateIn });
</script>

<template>
  <div>
    <Message
      class="z-10"
      ref="messageRef"
      ignore-mount
      sub-text="Thank you"
      :messages="[`Please confirm the end of the session.`]"
      message-class="px-[140px]"
    />

    <Confirm
      ref="confirmRef"
      @confirm="handleConfirm"
      active-image-url="/images/icons/icons-hand-ok-active.svg"
      selected-image-url="/images/icons/icons-hand-ok-selected.svg"
      ><div class="text-sm mt-[80px]">Show this gesture</div></Confirm
    >
  </div>
</template>
