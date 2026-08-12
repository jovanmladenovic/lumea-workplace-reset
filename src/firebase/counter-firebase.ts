import { initializeApp } from 'firebase/app';

// Separate Firebase project, dedicated to the ambient-layer engagement counter
// (src/services/engagement-counter.service.ts) — deliberately NOT the same project
// as firebase.ts (Fitsee's fitsee-d45e6, used by the real face-login/vectors flow).
// Initialized as a named app instance ('lumea-counter') so it coexists with the
// default Firebase app without conflict.
const counterFirebaseConfig = {
  apiKey: 'AIzaSyDMHmWaf1rbMm_27BSs_2AFEmxmOD2hmB4',
  authDomain: 'lumea-workplace-reset.firebaseapp.com',
  projectId: 'lumea-workplace-reset',
  storageBucket: 'lumea-workplace-reset.firebasestorage.app',
  messagingSenderId: '946926347328',
  appId: '1:946926347328:web:a8050d725276f6dbaaaba5',
};

export const counterFirebaseApp = initializeApp(counterFirebaseConfig, 'lumea-counter');
