<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FloatingBackground from '@/components/FloatingBlobsBackground.vue';
  import Message from '@/components/Message.vue';
  import Confirm from '@/components/Confirm.vue';
  import { useRouter } from 'vue-router';
  import { RoutePaths } from '@/router';

  const props = defineProps<{ returnPath: string }>();

  const router = useRouter();
  const floatingBackgroundRef = ref(null);
  const messageRef = ref(null);
  const confirmRef = ref(null);

  const countdown = ref(15);
  let countdownInterval: ReturnType<typeof setInterval> | null = null;

  const startCountdown = () => {
    countdownInterval = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(countdownInterval!);
      
        router.push(RoutePaths.Idle);
      }
    }, 1000);
  };

  const stopCountdown = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  };

  onMounted(async () => {
    floatingBackgroundRef.value?.initRandomAnimation();
    startCountdown();

    await messageRef.value?.animateIn();
    await confirmRef.value?.animateIn();
  });

  onBeforeUnmount(() => {
    stopCountdown();
  });

  const handleConfirm = () => {
    stopCountdown();
    router.push(props.returnPath);
  };
</script>

<template>
  <DefaultLayout class="pt-[400px]">
    <div class="absolute top-8 right-8 text-2xl text-white z-20">
      {{ countdown }}
    </div>
    <FloatingBackground ref="floatingBackgroundRef" class="opacity-40" />
    <div>
      <Message
        class="z-10"
        ref="messageRef"
        sub-text="Pardon"
        :messages="[`Are you still there? Please confirm to continue.`]"
        message-class="px-[140px]"
      />

      <Confirm
        ref="confirmRef"
        @confirm="handleConfirm"
        active-image-url="/images/icons/icons-hand-ok-active.svg"
        selected-image-url="/images/icons/icons-hand-ok-selected.svg"
      >
        <div class="text-sm mt-[80px]">Show this gesture</div>
      </Confirm>
    </div>
  </DefaultLayout>
</template>
