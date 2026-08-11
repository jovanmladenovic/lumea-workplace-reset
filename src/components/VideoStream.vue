<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { userInput, faceRecognition, userTasks, personDetectionService } from '@/services';
  import { initializeVideoStream } from '@/utils';

  const videoRef = ref();
  const canvasRef = ref();

  onMounted(() => {
    initializeVideoStream(videoRef.value).then(() => {
      userInput.setVideoElement(videoRef.value, true);
      userInput.setContainerSize(window.innerWidth, window.innerHeight);

      faceRecognition.init(videoRef.value);

      userTasks.init(canvasRef.value, videoRef.value);

      // Body-pose presence sensor for the Lumea ambient layer (AmbientStandby.vue)
      // — separate pose model from userTasks above, see person-detection.service.ts.
      personDetectionService.init(videoRef.value);
    });
  });
</script>

<template>
  <video ref="videoRef" class="video"></video>
  <canvas ref="canvasRef" id="canvas" class="video" />
</template>

<style scoped lang="scss">
  .video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    opacity: 0;
    object-fit: cover;
    pointer-events: none;
  }
</style>
