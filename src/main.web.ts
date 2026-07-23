// Standalone browser entry for the GitHub Pages preview build (yarn build:web).
//
// This intentionally does NOT reuse the Electron app's main.ts/App.vue/router.ts —
// those pull in Firebase/vuefire/pinia and, via services/index.ts, code that reads
// window.electronAPI.env (only present inside the packaged Electron app, set up by
// preload.ts). Mounting only the ambient/engage screens here keeps the public preview
// build limited to the hardware-free parts of the experience, with gesture/pose
// integration staying real-hardware-only inside the actual Electron app.
import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';

import WebPreviewApp from './WebPreviewApp.vue';
import AmbientStandby from './views/AmbientStandby.vue';
import Engage from './views/Engage.vue';
import './index.css';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'AmbientStandby', component: AmbientStandby },
    { path: '/engage', name: 'Engage', component: Engage },
  ],
});

createApp(WebPreviewApp).use(router).mount('#app');
