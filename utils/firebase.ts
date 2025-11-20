// utils/firebase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
    browserLocalPersistence,
    createUserWithEmailAndPassword,
    getAuth,
    initializeAuth, signInAnonymously,
    signOut,
    updateProfile,
    type Auth,
} from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
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

// App (guard initialization so apps are not initialized twice in the same runtime)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

import { Platform } from 'react-native';

// Auth (platform-specific persistence) - guard against re-initialization
let auth: Auth;
try {
  // Try to get existing auth instance first
  auth = getAuth(app);
} catch (err) {
  // If not initialized, initialize with platform-specific persistence
  (async () => {
    try {
      if (Platform.OS === 'web') {
        initializeAuth(app, { persistence: browserLocalPersistence });
      } else {
        // dynamic import to avoid bundling native-only module on web
        const rnAuth = await import('firebase/auth/react-native');
        initializeAuth(app, { persistence: rnAuth.getReactNativePersistence(AsyncStorage) });
      }
    } catch (err) {
      // fallback to default behavior
      try { initializeAuth(app); } catch {}
    }
  })();
  auth = getAuth(app);
}

// Firestore - simply use getFirestore, it handles initialization automatically
const db: Firestore = getFirestore(app);

// Ensure we’re signed in anonymously before writing
async function ensureAnon() {
  if (!auth.currentUser) {
    await signInAnonymously(auth).catch(() => {
      // still allow WhatsApp handoff even if auth fails
      // (we just skip Firestore insert)
    });
  }
}

// Public helper: create a lead doc
export async function createLead(payload: {
  fullName: string; phone: string; email: string; suburb?: string; price?: number;
}) {
  await ensureAnon();
  const ref = collection(db, 'leads');
  await addDoc(ref, { ...payload, createdAt: serverTimestamp() });
}

// Register user with email & password and create basic profile
export async function registerWithEmail(email: string, password: string, displayName?: string) {
  // create user
  const userCred = await createUserWithEmailAndPassword(getAuth(), email, password);
  if (displayName) {
    await updateProfile(userCred.user, { displayName });
  }
  // create users collection doc
  await setDoc(doc(db, 'users', userCred.user.uid), {
    displayName: displayName ?? null,
    email: userCred.user.email,
    createdAt: serverTimestamp(),
  });
  return userCred.user;
}

export async function logout() { return signOut(getAuth()); }

// Save a calculation for the current user
export async function saveCalculation(payload: { type: string; inputs: any; result: any; }) {
  await ensureAnon();
  const user = getAuth().currentUser;
  if (!user) throw new Error('not-signed-in');
  const ref = collection(db, 'users', user.uid, 'calculations');
  await addDoc(ref, { ...payload, createdAt: serverTimestamp() });
}

export async function fetchMyCalculations() {
  const user = getAuth().currentUser;
  if (!user) return [];
  const q = query(collection(db, 'users', user.uid, 'calculations'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(s => ({ id: s.id, ...(s.data() as any) }));
}
