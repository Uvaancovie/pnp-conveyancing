// utils/firebase.ts
console.log('firebase.ts module loading...');

import { getApp, getApps, initializeApp } from 'firebase/app';
import {
    browserLocalPersistence,
    createUserWithEmailAndPassword,
    getAuth,
    initializeAuth,
    signInAnonymously,
    signOut,
    updateProfile,
    type Auth
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
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Only import the polyfill on native platforms
if (Platform.OS !== 'web') {
  require('react-native-get-random-values');
}

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDgyr9c1-1qlmMftGjdWNUyWv2eqvUNP4w",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "pnp-conveyancer.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "pnp-conveyancer",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "pnp-conveyancer.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "223625627019",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:223625627019:web:a01d3da9084abe2e5c5b8e",
};

// App (guard initialization so apps are not initialized twice in the same runtime)
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

console.log('Firebase app initialized:', !!app);

// Auth - Try getAuth first, fall back to initializeAuth if needed
let authInstance: Auth;

try {
  console.log('Attempting getAuth...');
  authInstance = getAuth(app);
  console.log('getAuth succeeded');
} catch (getAuthError: any) {
  console.log('getAuth failed, attempting initializeAuth...', getAuthError.code);
  try {
    authInstance = initializeAuth(app, { 
      persistence: browserLocalPersistence 
    });
    console.log('initializeAuth succeeded');
  } catch (initError: any) {
    console.error('Both getAuth and initializeAuth failed:', initError);
    // Last resort - try getAuth one more time
    authInstance = getAuth(app);
  }
}

export const auth: Auth = authInstance;
console.log('Firebase auth exported:', !!auth, typeof auth);

// Firestore - simply use getFirestore, it handles initialization automatically
export const db: Firestore = getFirestore(app);
console.log('Firebase db exported:', !!db, typeof db);

// Storage
export const storage = getStorage(app);

// Ensure we're signed in anonymously before writing
async function ensureAnon() {
  const currentAuth = getAuth(app);
  if (!currentAuth.currentUser) {
    try {
      await signInAnonymously(currentAuth);
    } catch (err) {
      console.warn("Anonymous auth failed - Firebase Auth may not be enabled", err);
      // Don't throw - allow app to continue without auth
    }
  }
}

// Public helper: create a lead doc
export async function createLead(payload: {
  fullName: string; phone: string; email: string; suburb?: string; price?: number;
}) {
  try {
    await ensureAnon();
    const ref = collection(db, 'leads');
    await addDoc(ref, { ...payload, createdAt: serverTimestamp() });
  } catch (err) {
    console.warn("Could not save lead to Firestore (auth disabled?)", err);
    // Don't throw - allow WhatsApp handoff to continue
  }
}

// Register user with email & password and create basic profile
export async function registerWithEmail(email: string, password: string, displayName?: string) {
  const currentAuth = getAuth(app);
  // create user
  const userCred = await createUserWithEmailAndPassword(currentAuth, email, password);
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

export async function logout() { return signOut(getAuth(app)); }

// Save a calculation for the current user
export async function saveCalculation(payload: { type: string; inputs: any; result: any; name?: string; pdfUrl?: string }) {
  // Ensure we have the latest auth state
  const currentAuth = getAuth(app);
  
  // Remove undefined fields manually to avoid JSON.stringify issues with non-serializable data if any
  const cleanPayload: any = { ...payload };
  Object.keys(cleanPayload).forEach(key => cleanPayload[key] === undefined && delete cleanPayload[key]);
  
  const targetUser = currentAuth.currentUser;
  if (!targetUser || targetUser.isAnonymous) {
    throw new Error('not-signed-in');
  }
  
  if (!db) throw new Error("Firestore not initialized");
  
  try {
    const ref = collection(db, 'users', targetUser.uid, 'calculations');
    await addDoc(ref, { ...cleanPayload, createdAt: serverTimestamp() });
  } catch (e: any) {
    console.error("Save calculation failed", e);
    if (e.code === 'permission-denied') {
      throw new Error('Firebase Authentication is disabled or Firestore rules are blocking access. Enable auth in Firebase Console.');
    }
    throw e;
  }
}

export async function fetchMyCalculations() {
  const currentAuth = getAuth(app);
  const user = currentAuth.currentUser;
  if (!user) return [];
  
  if (!db) {
    console.error("Firestore DB not initialized");
    return [];
  }

  try {
    const q = query(collection(db, 'users', user.uid, 'calculations'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(s => ({ id: s.id, ...(s.data() as any) }));
  } catch (error: any) {
    console.error("Error fetching calculations for user " + user.uid, error);
    
    // If permission denied, return empty array instead of crashing
    if (error.code === 'permission-denied') {
      return [];
    }

    // Fallback: try without ordering (sometimes index issues manifest as permission errors)
    try {
      const q2 = query(collection(db, 'users', user.uid, 'calculations'));
      const snap2 = await getDocs(q2);
      return snap2.docs.map(s => ({ id: s.id, ...(s.data() as any) }));
    } catch (err2) {
      console.error("Fallback fetch failed", err2);
      return [];
    }
  }
}

// Admin: Fetch all users
export async function fetchAllUsers() {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(s => ({ id: s.id, ...(s.data() as any) }));
}

// Admin: Fetch calculations for a specific user
export async function fetchUserCalculations(uid: string) {
  const q = query(collection(db, 'users', uid, 'calculations'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(s => ({ id: s.id, ...(s.data() as any) }));
}
