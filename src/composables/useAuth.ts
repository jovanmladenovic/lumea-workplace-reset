import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { useFirestore } from 'vuefire';

// TODO: Update this after storage and search of face vectors is implemented
export function useAuth() {
  const db = useFirestore();

  const handleAuthentication = async (data: { faceId: string }) => {
    try {
      const token = await window.electronAPI.getAuthToken(data);

      const auth = getAuth();
      await signInWithCustomToken(auth, token);

      const userRef = doc(db, 'users', data.faceId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        const { faceId, ...rest } = data;
        await setDoc(doc(db, 'users', faceId), {
          ...rest,
          createdAt: new Date(),
        });
      }

      const user = await getDoc(userRef);

      console.log('user', user.data());

      //TODO: Handle redirect
    } catch (error) {
      console.log(error);
    }
  };

  return {
    handleAuthentication,
  };
}
