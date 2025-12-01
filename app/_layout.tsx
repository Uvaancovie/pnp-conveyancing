import { TamaguiProvider } from '@tamagui/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/auth-context';
import config from '../tamagui.config';

const qc = new QueryClient();

export default function Layout(){
  return (
    <TamaguiProvider config={config}>
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <Stack 
            screenOptions={{ 
              headerStyle: { backgroundColor: '#0A5C3B' }, 
              headerTintColor: 'white',
              headerTitleStyle: { fontWeight: '700' },
              headerBackTitleVisible: false,
              animation: 'slide_from_right',
            }} 
          >
            <Stack.Screen name="index" options={{ title: 'Pather & Pather', headerShown: true }} />
            <Stack.Screen name="transfer" options={{ title: 'Transfer Calculator' }} />
            <Stack.Screen name="bond" options={{ title: 'Bond Calculator' }} />
            <Stack.Screen name="repayment" options={{ title: 'Repayment Calculator' }} />
            <Stack.Screen name="start" options={{ title: 'Start Transfer' }} />
            <Stack.Screen name="legal" options={{ title: 'Legal & Disclaimer' }} />
            <Stack.Screen name="login" options={{ title: 'Sign In' }} />
            <Stack.Screen name="signup" options={{ title: 'Create Account' }} />
            <Stack.Screen name="profile" options={{ title: 'My Profile' }} />
            <Stack.Screen name="admin/index" options={{ title: 'Admin Dashboard' }} />
            <Stack.Screen name="admin/user/[uid]" options={{ title: 'User Details' }} />
          </Stack>
        </AuthProvider>
      </QueryClientProvider>
    </TamaguiProvider>
  );
}