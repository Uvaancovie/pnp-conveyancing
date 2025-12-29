// utils/firebase.native.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
    createUserWithEmailAndPassword,
    getAuth,
    initializeAuth, signInAnonymously,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import {
    addDoc,
    collection,
    doc,
    getDocs,
    getFirestore,
    orderBy,
    query,
    serverTimestamp,
    setDoc
} from 'firebase/firestore';
import 'react-native-get-random-values'; // polyfill for RN

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Guard against re-initialization
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth - guard against re-initialization
let auth: ReturnType<typeof getAuth>;
try {
  auth = getAuth(app);
} catch {
  try {
    initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {}
  auth = getAuth(app);
}

// Firestore - getFirestore handles initialization automatically
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

export async function saveCalculation(payload: { type: string; inputs: any; result: any; name?: string }) {
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
