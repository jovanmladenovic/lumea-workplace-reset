<script setup lang="ts">
  import { onMounted, ref, onBeforeUnmount } from 'vue';
  import { getDocs, addDoc, collection, Timestamp } from 'firebase/firestore';
  import { useFirestore } from 'vuefire';
  import { useRouter } from 'vue-router';

  import { RoutePaths } from '@/router';
  import { faceRecognition, FaceRecognitionEvents, type FaceDetectionResult } from '@/services';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import Message from '@/components/Message.vue';
  import FloatingBackground from '@/components/FloatingBlobsBackground.vue';
  import { useUserStore } from '@/stores/user.store';

  const router = useRouter();
  const db = useFirestore();
  const userStore = useUserStore();
  const screenSaverInterval = ref(null);

  const messages = [
    { prompt: 'Hey there', messages: [`Step in, reflect, <br /> and refocus.`] },
    { prompt: 'Hi there', messages: ['Need a 3-minute energy reset?'] },
    { prompt: 'Hello there', messages: ['Feeling off?', `Let’s fix that.`] },
  ];

  const subtitleRef = ref(null);
  const messagesRefs = ref([]);
  const floatingBackgroundRef = ref(null);

  const currentMessageIndex = ref(0);

  const animateMessage = async () => {
    const prevMessageIndex =
      currentMessageIndex.value === 0 ? messages.length - 1 : currentMessageIndex.value - 1;
    messagesRefs.value[prevMessageIndex].animateOut();
    messagesRefs.value[currentMessageIndex.value].animateIn();
  };

  const startScreenSaver = async () => {
    floatingBackgroundRef.value?.initRandomAnimation();
    animateMessage();

    screenSaverInterval.value = setInterval(() => {
      currentMessageIndex.value === messages.length - 1
        ? (currentMessageIndex.value = 0)
        : currentMessageIndex.value++;

      animateMessage();
    }, 7500);
  };

  const stopScreenSaver = async () => {
    await Promise.all([
      subtitleRef.value?.animateOut(),
      ...messagesRefs.value.map(msg => msg.animateOut()),
    ]);
  };

  interface FaceSnapshot {
    id: string;
    vector: Float32Array;
    createdAt: Timestamp;
  }

  const getAllFaceSnapshots = async (): Promise<FaceSnapshot[]> => {
    return new Promise(async (resolve, reject) => {
      try {
        const querySnapshot = await getDocs(collection(db, 'vectors'));

        const vectors: FaceSnapshot[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();

          vectors.push({
            id: doc.id,
            vector: new Float32Array(data.vector),
            createdAt: data.createdAt,
          });
        });

        resolve(vectors);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };

  const addFaceSnapshot = async (faceSnapshot: any): Promise<string> => {
    const docRef = await addDoc(collection(db, 'vectors'), faceSnapshot);

    // Return document ID, which will be used as userId
    return docRef.id;
  };

  const initFaceRecognition = async () => {
    faceRecognition.on(FaceRecognitionEvents.LOGIN, async (detection: FaceDetectionResult) => {
      stopScreenSaver();

      const allFaceSnapshots = await getAllFaceSnapshots();
      const allFaceSnapshotsVectors = allFaceSnapshots.map(snapshot => snapshot.vector);

      const existingSnapshotIndex = faceRecognition.findMatchIndex(
        detection,
        allFaceSnapshotsVectors
      );

      if (existingSnapshotIndex === -1) {
        const faceSnapshot = {
          vector: Array.from(detection.descriptor),
          createdAt: Timestamp.now(),
        };

        const newUserId = await addFaceSnapshot(faceSnapshot);

        userStore.setUserId(newUserId);
        router.push(RoutePaths.Tutorial);
      } else {
        const existingUserId = allFaceSnapshots[existingSnapshotIndex].id;

        userStore.setUserId(existingUserId);
        router.push(RoutePaths.CheckIn);
      }

      faceRecognition.monitorLogout();
    });
  };

  onMounted(async () => {
    startScreenSaver();

    faceRecognition.stopDetection();
    await faceRecognition.startIdleMonitoring();
    initFaceRecognition();
  });

  onBeforeUnmount(() => {
    screenSaverInterval.value && clearInterval(screenSaverInterval.value);
    faceRecognition.off(FaceRecognitionEvents.LOGIN);
  });
</script>

<template>
  <DefaultLayout class="pt-[400px]">
    <FloatingBackground ref="floatingBackgroundRef" class="opacity-40" />
    <div class="relative min-h-[300px]">
      <Message
        v-for="(message, index) in messages"
        :key="index"
        :subText="message.prompt"
        :messages="message.messages"
        ref="messagesRefs"
        class="absolute top-0 w-full"
        message-class="text-3xl font-bold font-raleway"
      />
    </div>
  </DefaultLayout>
</template>
