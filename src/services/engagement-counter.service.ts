import { getFirestore, doc, increment, setDoc } from 'firebase/firestore';

import { firebaseApp } from '@/firebase/firebase';

// Ambient-layer engagement counter — three aggregate running totals
// (passersBy / approaches / engagements). No timestamps, no identity, no
// per-event log — matches the "anonymous, always" trust promise; an aggregate
// count is not the same thing as tracking a person.
//
// Two backends, both best-effort:
// - Firestore (this is the one that matters — the mirror has no physical
//   access, only remote updates, so a local-only count can't actually be
//   checked). Uses firebaseApp directly (not vuefire's useFirestore(), which
//   needs a component context this isn't), so it works from Electron AND the
//   GitHub Pages preview build — firebase/firebase.ts has no window.electronAPI
//   dependency.
// - Local JSON file via IPC (main.ts), Electron-only. Kept as an
//   offline-tolerant record in case the Firestore write fails (no retry queue
//   though — a failed write while offline is just lost from Firestore's side).
//
// Deliberately NOT part of the @/services barrel — this file must stay safe to
// import statically from anywhere (unlike user-input.service.ts etc., which
// touches window.electronAPI.env at import time).
export type EngagementCounter = 'passersBy' | 'approaches' | 'engagements';

const db = getFirestore(firebaseApp);

// One doc per device — see docs/lumea-project-handoff.md, this is a single-mirror
// deployment today, but scoping by DEVICE_ID avoids collisions if that changes.
// NOT verified against the project's actual Firestore security rules — if writes
// silently fail, check the rules for the `engagementCounts` collection in the
// Firebase console.
function getDeviceCountsRef() {
  const deviceId = window.electronAPI?.env?.DEVICE_ID || 'default-device';
  return doc(db, 'engagementCounts', deviceId);
}

async function incrementFirestoreCount(counter: EngagementCounter): Promise<void> {
  try {
    await setDoc(getDeviceCountsRef(), { [counter]: increment(1) }, { merge: true });
    console.log(`[engagement-counter] firestore ${counter} incremented`);
  } catch (error) {
    console.warn(`[engagement-counter] firestore increment failed for ${counter}`, error);
  }
}

async function incrementLocalFileCount(counter: EngagementCounter): Promise<void> {
  const incrementCount = window.electronAPI?.incrementCount;
  if (!incrementCount) return; // no local persistence layer outside Electron

  const counts = await incrementCount(counter);
  console.log(`[engagement-counter] local file ${counter} ->`, counts);
}

export async function incrementEngagementCount(counter: EngagementCounter): Promise<void> {
  await Promise.all([incrementFirestoreCount(counter), incrementLocalFileCount(counter)]);
}
