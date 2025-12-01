import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth
} from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc, type Firestore } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { AuthContextType, User, UserRole } from '../types/auth';

// Initialize Firebase directly in this file to avoid module loading issues
const firebaseConfig = {
  apiKey: "AIzaSyDgyr9c1-1qlmMftGjdWNUyWv2eqvUNP4w",
  authDomain: "pnp-conveyancer.firebaseapp.com",
  projectId: "pnp-conveyancer",
  storageBucket: "pnp-conveyancer.firebasestorage.app",
  messagingSenderId: "223625627019",
  appId: "1:223625627019:web:a01d3da9084abe2e5c5b8e",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const firebaseAuth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

console.log('auth-context.tsx - Direct Firebase init - auth:', !!firebaseAuth, 'db:', !!db);

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Platform-specific secure storage
const secureStorage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  async deleteItem(key: string) {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider useEffect - firebaseAuth:', !!firebaseAuth, 'db:', !!db);
    
    // Guard against undefined auth
    if (!firebaseAuth) {
      console.error('CRITICAL: Firebase auth not initialized!');
      setLoading(false);
      return;
    }

    console.log('Setting up onAuthStateChanged listener...');
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch additional user data from Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const userProfile: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                displayName: firebaseUser.displayName || userData.displayName || '',
                role: userData.role as UserRole,
                phoneNumber: userData.phoneNumber,
                createdAt: userData.createdAt?.toDate() || new Date(),
                lastLogin: new Date(),
              };
              setUser(userProfile);
              
              // Store JWT token (using Firebase ID token)
              const token = await firebaseUser.getIdToken();
              await secureStorage.setItem('userToken', token);
              
              // Update last login (don't await to avoid blocking)
              setDoc(doc(db, 'users', firebaseUser.uid), {
                lastLogin: new Date()
              }, { merge: true }).catch(err => {
                console.warn('Could not update last login:', err);
              });
            } else {
              // User document doesn't exist (shouldn't happen, but handle it)
              // Create a basic user profile from Auth data so the app doesn't break
              const userProfile: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                displayName: firebaseUser.displayName || 'User',
                role: 'customer' as UserRole,
                createdAt: new Date(),
                lastLogin: new Date(),
              };
              setUser(userProfile);
            }
          } catch (firestoreError) {
            console.error('Firestore error:', firestoreError);
            // Still allow user to be authenticated even if Firestore is offline or permissions fail
            // Use data from Firebase Auth only
            const userProfile: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || 'User',
              role: 'customer' as UserRole, // Default to customer
              createdAt: new Date(),
              lastLogin: new Date(),
            };
            setUser(userProfile);
            
            const token = await firebaseUser.getIdToken();
            await secureStorage.setItem('userToken', token);
          }
        } else {
          setUser(null);
          await secureStorage.deleteItem('userToken');
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [firebaseAuth]);

  const login = async (email: string, password: string) => {
    if (!firebaseAuth) throw new Error('Auth not initialized');
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      // Provide user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email. Please register first.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else if (error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password.');
      } else {
        throw new Error(error.message || 'Login failed. Please try again.');
      }
    }
  };

  const register = async (
    email: string, 
    password: string, 
    displayName: string, 
    role: UserRole,
    phoneNumber?: string
  ) => {
    if (!firebaseAuth || !db) throw new Error('Auth or DB not initialized');
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const firebaseUser = userCredential.user;

      // Update Firebase Auth profile
      await firebaseUpdateProfile(firebaseUser, { displayName });

      // Create user document in Firestore (with error handling)
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          email,
          displayName,
          role,
          phoneNumber: phoneNumber || '',
          createdAt: new Date(),
          lastLogin: new Date(),
          // Initialize calculation and saved data for both roles to avoid missing fields
          calculationHistory: [],
          savedCalculations: [],
          leads: [],
          ...(role === 'agent' ? {
            agentCode: `AG${Date.now().toString().slice(-6)}`,
            assignedLeads: [],
            totalLeadsHandled: 0
          } : {})
        });
      } catch (firestoreError: any) {
        console.warn('Could not create user document in Firestore:', firestoreError);
        // Account is still created in Firebase Auth, so this is not fatal
        // The user can still log in, and we'll handle the missing document in onAuthStateChanged
      }

    } catch (error: any) {
      console.error('Registration error:', error);
      // Provide user-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please login instead.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else {
        throw new Error(error.message || 'Registration failed. Please try again.');
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(firebaseAuth);
      await secureStorage.deleteItem('userToken');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message);
    }
  };

  const updateRole = async (newRole: UserRole) => {
    if (!user) throw new Error('No user logged in');

    try {
      await setDoc(doc(db, 'users', user.uid), {
        role: newRole
      }, { merge: true });

      setUser({ ...user, role: newRole });
    } catch (error: any) {
      console.error('Update role error:', error);
      throw new Error(error.message);
    }
  };

  const updateProfile = async (displayName: string, phoneNumber?: string) => {
    if (!user) throw new Error('No user logged in');

    try {
      // Update Firebase Auth profile
      if (firebaseAuth.currentUser) {
        await firebaseUpdateProfile(firebaseAuth.currentUser, { displayName });
      }

      // Update Firestore document
      const updateData: any = { displayName };
      if (phoneNumber !== undefined) {
        updateData.phoneNumber = phoneNumber;
      }

      await setDoc(doc(db, 'users', user.uid), updateData, { merge: true });

      // Update local state
      setUser({ ...user, displayName, phoneNumber: phoneNumber ?? user.phoneNumber });
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    updateRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
