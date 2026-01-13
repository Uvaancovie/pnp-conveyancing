import {
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    useFonts
} from '@expo-google-fonts/poppins';
import { TamaguiProvider } from '@tamagui/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AuthProvider } from '../contexts/auth-context';
import config from '../tamagui.config';

SplashScreen.preventAutoHideAsync();
const qc = new QueryClient();

export default function Layout(){
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TamaguiProvider config={config}>
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <Stack 
            screenOptions={{ 
              headerStyle: { backgroundColor: '#0A5C3B' }, 
              headerTintColor: 'white',
              headerTitleStyle: { fontWeight: '700', fontFamily: 'Poppins_700Bold' },
              headerBackTitleVisible: false,
              animation: 'slide_from_right',
            }} 
          >
            <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="dashboard" options={{ title: 'Pather & Pather', headerShown: true, headerBackVisible: false }} />
            <Stack.Screen name="transfer" options={{ title: 'Transfer Calculator' }} />
            <Stack.Screen name="bond" options={{ title: 'Bond Calculator' }} />
            <Stack.Screen name="repayment" options={{ title: 'Repayment Calculator' }} />
            <Stack.Screen name="start" options={{ title: 'Start Transfer' }} />
            <Stack.Screen name="legal" options={{ title: 'Legal & Disclaimer' }} />
            <Stack.Screen name="(auth)/login" options={{ title: 'Sign In' }} />
            <Stack.Screen name="(auth)/signup" options={{ title: 'Create Account' }} />
            <Stack.Screen name="(auth)/register" options={{ title: 'Create Account' }} />
            <Stack.Screen name="profile" options={{ title: 'My Profile' }} />
            <Stack.Screen name="admin/index" options={{ title: 'Admin Dashboard' }} />
            <Stack.Screen name="admin/user/[uid]" options={{ title: 'User Details' }} />
          </Stack>
        </AuthProvider>
      </QueryClientProvider>
    </TamaguiProvider>
  );
}