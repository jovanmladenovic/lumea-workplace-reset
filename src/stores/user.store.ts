import { ref, onMounted } from 'vue';
import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';

import { faceRecognition, FaceRecognitionEvents } from '@/services';
import { RoutePaths } from '@/router';

export const useUserStore = defineStore('user', () => {
  const router = useRouter();
  const userId = ref<string | null>(null);

  function setUserId(id: string) {
    userId.value = id;
  }

  function clearUserId() {
    userId.value = null;
  }

  onMounted(() => {
    faceRecognition.onReady().then(() => {
      faceRecognition.on(FaceRecognitionEvents.LOGOUT, () => {
        clearUserId();
        router.push(RoutePaths.Idle);
      });
    });
  });

  return {
    userId,
    setUserId,
    clearUserId,
  };
});
