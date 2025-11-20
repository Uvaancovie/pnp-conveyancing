import { TamaguiProvider } from '@tamagui/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import config from '../tamagui.config';

const qc = new QueryClient();

export default function Layout(){
  return (
    <TamaguiProvider config={config}>
      <QueryClientProvider client={qc}>
        <Stack screenOptions={{ headerStyle:{ backgroundColor:'#0A5C3B' }, headerTintColor: 'white' }} />
      </QueryClientProvider>
    </TamaguiProvider>
  );
}