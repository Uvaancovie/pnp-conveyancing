import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'adminDashboardToken';

const storage = {
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

export async function getAdminDashboardToken() {
  return await storage.getItem(TOKEN_KEY);
}

export async function setAdminDashboardToken(token: string) {
  await storage.setItem(TOKEN_KEY, token);
}

export async function clearAdminDashboardToken() {
  await storage.deleteItem(TOKEN_KEY);
}

export async function loginAdminDashboard(username: string, password: string) {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error('invalid-credentials');
  }

  const data = (await res.json()) as { token?: string };
  if (!data?.token) throw new Error('invalid-response');
  return data.token;
}

export async function verifyAdminDashboardToken(token: string) {
  const res = await fetch('/api/admin/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  return res.ok;
}
