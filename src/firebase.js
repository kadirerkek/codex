import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAtL_uDNMpSs8TTYeA1_dsclDVbXRQTl_E',
  authDomain: 'proje-yonetimi-80ea1.firebaseapp.com',
  projectId: 'proje-yonetimi-80ea1',
  storageBucket: 'proje-yonetimi-80ea1.firebasestorage.app',
  messagingSenderId: '766094713979',
  appId: '1:766094713979:web:019b69ba810a2e5553eede',
  measurementId: 'G-K6ZTH6DKSB'
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
