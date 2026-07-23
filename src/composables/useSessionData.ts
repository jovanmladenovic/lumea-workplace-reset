import {
  doc,
  addDoc,
  Timestamp,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { useFirestore } from 'vuefire';
import { ref } from 'vue';
import { InterventionType } from '@/constants';

import { useUserStore } from '@/stores/user.store';

interface TaskData {
  name: string;
  startedAt: Timestamp;
  endedAt?: Timestamp;
  passed?: boolean;
}

interface SessionData {
  startedAt: Timestamp;
  userId: string;
  deviceId?: string;
  startEnergyLevel?: number;
  selectedIntervention?: string;
  endEnergyLevel?: number;
  interventionIndex?: number;
  willingToRepeat?: boolean;
  endedAt?: Timestamp;
}

const sessionId = ref<string | null>(null);
const sessionData = ref<SessionData | null>(null);

export function useSessionData() {
  const db = useFirestore();
  const userStore = useUserStore();

  const startSession = async () => {
    if (!userStore.userId) {
      console.error('User not authenticated');
      return;
    }

    try {
      sessionData.value = {
        startedAt: Timestamp.now(),
        userId: userStore.userId,
        deviceId: window.electronAPI.env.DEVICE_ID,
      };

      sessionId.value = (await addDoc(collection(db, 'sessions'), sessionData.value)).id;
    } catch (error) {
      console.error('Error saving session start:', error);
    }
  };

  const endSession = async () => {
    if (!sessionId.value) {
      console.error('Session not started');
      return;
    }

    try {
      const sessionRef = doc(db, 'sessions', sessionId.value);

      sessionData.value.endedAt = Timestamp.now();
      await updateDoc(sessionRef, sessionData.value);

      sessionId.value = null;
      sessionData.value = null;
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const updateSession = async (data: Partial<SessionData>) => {
    if (!sessionId.value) {
      console.error('Session not started');
      return;
    }

    try {
      const sessionRef = doc(db, 'sessions', sessionId.value);

      sessionData.value = {
        ...sessionData.value,
        ...data,
      };
      await updateDoc(sessionRef, sessionData.value);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const fetchPreviousSession = async (
    selectedIntervention: InterventionType
  ): Promise<SessionData | null> => {
    if (!userStore.userId) {
      console.error('User not authenticated');
      return null;
    }

    try {
      const sessionsRef = collection(db, 'sessions');
      const q = query(
        sessionsRef,
        where('userId', '==', userStore.userId),
        where('startedAt', '!=', null),
        where('selectedIntervention', '==', selectedIntervention),
        orderBy('startedAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const previousSession = querySnapshot.docs[0].data() as SessionData;
      return previousSession;
    } catch (error) {
      console.error('Error fetching previous session:', error);
      return null;
    }
  };

  return {
    sessionData,
    sessionId,
    startSession,
    updateSession,
    endSession,
    fetchPreviousSession,
  };
}
