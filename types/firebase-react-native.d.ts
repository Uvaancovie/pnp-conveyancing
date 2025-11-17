declare module 'firebase/auth/react-native' {
  import type { Persistence } from 'firebase/auth';
  import type AsyncStorageType from '@react-native-async-storage/async-storage';

  /**
   * Returns a Persistence implementation that uses React Native AsyncStorage.
   * The exact runtime value is provided by the Firebase SDK for React Native.
   */
  export function getReactNativePersistence(storage: typeof AsyncStorageType): Persistence;
}
