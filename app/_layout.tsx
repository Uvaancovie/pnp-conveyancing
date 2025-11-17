import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const qc = new QueryClient();
export default function Layout(){
  return (
    <QueryClientProvider client={qc}>
      <Stack screenOptions={{ headerStyle:{ backgroundColor:'#0A5C3B' }, headerTintColor: 'white' }} />
    </QueryClientProvider>
  );
}