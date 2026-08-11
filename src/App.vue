<script setup>
  import { RouterView } from 'vue-router';

  import VideoStream from '@/components/VideoStream.vue';
  import { SKIP_VIDEOS } from '@/constants';

  // Hidden for now — flip back to true to bring back the full dev-jump nav.
  const SHOW_ALL_DEV_LINKS = false;
</script>

<template>
  <router-view />
  <VideoStream />

  <div class="pb-1 pt-1 absolute bottom-0 w-full z-10 text-[14px]">
    <div class="flex gap-x-[20px] justify-center">
      <template v-if="SHOW_ALL_DEV_LINKS">
        <router-link to="/idle">Idle</router-link>
        <router-link to="/tutorial">Tutorial</router-link>
        <router-link to="/check-in">Check In</router-link>
        <router-link to="/energy-boost-1">Boost 1</router-link>
        <router-link to="/energy-boost-2">Boost 2</router-link>
        <router-link to="/mental-balance-1">Balance 1</router-link>
        <router-link to="/mental-balance-2">Balance 2</router-link>
        <router-link to="/reset-and-focus-1">Focus 1</router-link>
        <router-link to="/reset-and-focus-2">Focus 2</router-link>
        <router-link to="/check-out">Check Out</router-link>
        <router-link to="/inactive">Inactive</router-link>
      </template>
      <router-link to="/ambient-standby">Ambient Standby</router-link>
      <router-link to="/engage">Engage</router-link>
    </div>
  </div>
</template>
