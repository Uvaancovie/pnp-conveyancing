// utils/firebase.native.ts
import 'react-native-get-random-values'; // polyfill for RN
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import {
  initializeAuth, signInAnonymously, getAuth,
  createUserWithEmailAndPassword, updateProfile, signOut,
} from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import {
  getFirestore, initializeFirestore, persistentLocalCache,
  collection, addDoc, serverTimestamp, doc, setDoc, query, orderBy, getDocs
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Auth (anonymous, persisted to AsyncStorage)
initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
const auth = getAuth(app);

// Firestore (good offline defaults)
initializeFirestore(app, { localCache: persistentLocalCache() });
const db = getFirestore(app);

async function ensureAnon() {
  if (!auth.currentUser) {
    await signInAnonymously(auth).catch(() => {});
  }
}

export async function createLead(payload: any) {
  await ensureAnon();
  const ref = collection(db, 'leads');
  await addDoc(ref, { ...payload, createdAt: serverTimestamp() });
}

export async function registerWithEmail(email: string, password: string, displayName?: string) {
  const userCred = await createUserWithEmailAndPassword(getAuth(), email, password);
  if (displayName) await updateProfile(userCred.user, { displayName });
  await setDoc(doc(db, 'users', userCred.user.uid), {
    displayName: displayName ?? null,
    email: userCred.user.email,
    createdAt: serverTimestamp(),
  });
  return userCred.user;
}

export async function logout() { return signOut(getAuth()); }

export async function saveCalculation(payload: { type: string; inputs: any; result: any; }) {
  await ensureAnon();
  const user = getAuth().currentUser;
  if (!user) throw new Error('not-signed-in');
  const ref = collection(db, `users/${user.uid}/calculations`);
  await addDoc(ref, { ...payload, createdAt: serverTimestamp() });
}

export async function fetchMyCalculations() {
  const user = getAuth().currentUser;
  if (!user) return [];
  const q = query(collection(db, `users/${user.uid}/calculations`), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(s => ({ id: s.id, ...(s.data() as any) }));
}
