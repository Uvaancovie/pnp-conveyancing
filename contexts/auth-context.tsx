import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
    createUserWithEmailAndPassword,
    EmailAuthProvider,
    updateProfile as firebaseUpdateProfile,
    getAuth,
    onAuthStateChanged,
    reauthenticateWithCredential,
    signInWithEmailAndPassword,
    signOut,
    updatePassword,
    type Auth
} from 'firebase/auth';
import { doc, getDoc, getFirestore, serverTimestamp, setDoc, type Firestore } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { AccountStatus, AuthContextType, User, UserRole } from '../types/auth';

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

  const deriveUsernameFromEmail = (email?: string | null) => {
    const value = email ?? '';
    return value.includes('@') ? value.split('@')[0] : value;
  };

  const deriveNamePartsFromDisplayName = (displayName?: string) => {
    const cleaned = (displayName ?? '').trim();
    if (!cleaned) return { firstName: undefined as string | undefined, surname: undefined as string | undefined };
    const parts = cleaned.split(/\s+/);
    if (parts.length === 1) return { firstName: parts[0], surname: undefined };
    return { firstName: parts[0], surname: parts.slice(1).join(' ') };
  };

  const normalizeDisplayName = (firstName?: string, surname?: string) => {
    const name = `${firstName ?? ''} ${surname ?? ''}`.trim();
    return name || undefined;
  };

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

              const status: AccountStatus = (userData.status as AccountStatus) || 'active';
              if (status === 'deactivated') {
                // Soft-deactivated account: immediately sign out and clear tokens
                setUser(null);
                await secureStorage.deleteItem('userToken');
                await signOut(firebaseAuth).catch(() => {});
                return;
              }

              const fallbackDisplayName = firebaseUser.displayName || userData.displayName || '';
              const derivedParts = deriveNamePartsFromDisplayName(fallbackDisplayName);
              const userProfile: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                displayName: fallbackDisplayName,
                username: userData.username || deriveUsernameFromEmail(firebaseUser.email),
                firstName: userData.firstName || derivedParts.firstName,
                surname: userData.surname || derivedParts.surname,
                role: (userData.role as UserRole) || ('customer' as UserRole),
                phoneNumber: userData.phoneNumber,
                status,
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
              const derivedParts = deriveNamePartsFromDisplayName(firebaseUser.displayName || undefined);
              const userProfile: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                displayName: firebaseUser.displayName || 'User',
                username: deriveUsernameFromEmail(firebaseUser.email),
                firstName: derivedParts.firstName,
                surname: derivedParts.surname,
                role: 'customer' as UserRole,
                status: 'active',
                createdAt: new Date(),
                lastLogin: new Date(),
              };
              setUser(userProfile);
            }
          } catch (firestoreError) {
            console.error('Firestore error:', firestoreError);
            // Still allow user to be authenticated even if Firestore is offline or permissions fail
            // Use data from Firebase Auth only
            const derivedParts = deriveNamePartsFromDisplayName(firebaseUser.displayName || undefined);
            const userProfile: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || 'User',
              username: deriveUsernameFromEmail(firebaseUser.email),
              firstName: derivedParts.firstName,
              surname: derivedParts.surname,
              role: 'customer' as UserRole, // Default to customer
              status: 'active',
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
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);

      // Block deactivated accounts as early as possible
      try {
        const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
        if (userDoc.exists()) {
          const status: AccountStatus = (userDoc.data().status as AccountStatus) || 'active';
          if (status === 'deactivated') {
            await signOut(firebaseAuth).catch(() => {});
            await secureStorage.deleteItem('userToken');
            throw new Error('This account has been deactivated. Please contact support if you believe this is a mistake.');
          }
        }
      } catch (statusCheckError: any) {
        // If it's our explicit deactivation error, surface it. Otherwise, ignore status check failures.
        if (statusCheckError?.message?.includes('deactivated')) throw statusCheckError;
      }
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

      const derivedParts = deriveNamePartsFromDisplayName(displayName);
      const defaultUsername = deriveUsernameFromEmail(email);

      // Update Firebase Auth profile
      await firebaseUpdateProfile(firebaseUser, { displayName });

      // Create user document in Firestore (with error handling)
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          email,
          displayName,
          username: defaultUsername,
          firstName: derivedParts.firstName || '',
          surname: derivedParts.surname || '',
          role,
          phoneNumber: phoneNumber || '',
          createdAt: new Date(),
          lastLogin: new Date(),
          status: 'active',
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

  const updateAccountDetails: AuthContextType['updateAccountDetails'] = async (details) => {
    if (!user) throw new Error('No user logged in');

    const nextFirstName = details.firstName ?? user.firstName;
    const nextSurname = details.surname ?? user.surname;
    const computedDisplayName = normalizeDisplayName(nextFirstName, nextSurname);
    const nextDisplayName = details.displayName ?? computedDisplayName ?? user.displayName;
    const nextUsername = details.username ?? user.username;
    const nextPhoneNumber = details.phoneNumber ?? user.phoneNumber;

    const updateData: any = {
      displayName: nextDisplayName,
    };
    if (nextUsername !== undefined) updateData.username = nextUsername;
    if (nextFirstName !== undefined) updateData.firstName = nextFirstName;
    if (nextSurname !== undefined) updateData.surname = nextSurname;
    if (details.phoneNumber !== undefined) updateData.phoneNumber = details.phoneNumber;

    try {
      if (firebaseAuth.currentUser) {
        await firebaseUpdateProfile(firebaseAuth.currentUser, { displayName: nextDisplayName });
      }

      await setDoc(doc(db, 'users', user.uid), updateData, { merge: true });

      setUser({
        ...user,
        displayName: nextDisplayName,
        username: nextUsername,
        firstName: nextFirstName,
        surname: nextSurname,
        phoneNumber: nextPhoneNumber,
      });
    } catch (error: any) {
      console.error('Update account details error:', error);
      throw new Error(error.message || 'Could not update account details');
    }
  };

  const changePassword: AuthContextType['changePassword'] = async (currentPassword, newPassword) => {
    if (!firebaseAuth?.currentUser) throw new Error('No user logged in');
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser.email) throw new Error('Missing user email. Please sign in again.');

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
    } catch (error: any) {
      console.error('Change password error:', error);
      if (error.code === 'auth/wrong-password') {
        throw new Error('Current password is incorrect.');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('New password is too weak. Please use at least 6 characters.');
      }
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many attempts. Please try again later.');
      }
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('Please sign in again and retry changing your password.');
      }
      throw new Error(error.message || 'Could not change password');
    }
  };

  const deactivateAccount: AuthContextType['deactivateAccount'] = async () => {
    if (!user) throw new Error('No user logged in');
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          status: 'deactivated',
          deactivatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Sign out locally after deactivation
      await signOut(firebaseAuth).catch(() => {});
      await secureStorage.deleteItem('userToken');
      setUser(null);
    } catch (error: any) {
      console.error('Deactivate account error:', error);
      throw new Error(error.message || 'Could not deactivate account');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    updateAccountDetails,
    changePassword,
    deactivateAccount,
    updateRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
