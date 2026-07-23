/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */
import * as Sentry from '@sentry/electron/renderer';
import { createApp } from 'vue';
import { VueFire, VueFireAuth } from 'vuefire';
import { createPinia } from 'pinia';

import App from './App.vue';
import './index.css';
import { router } from './router';
import { firebaseApp } from './firebase/firebase';

// Initialize Sentry for renderer process
Sentry.init({});

const pinia = createPinia();

createApp(App)
  .use(router)
  .use(pinia)
  .use(VueFire, {
    firebaseApp,
    modules: [VueFireAuth()],
  })
  .mount('#app');
