import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { BtnText, Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { useAuth } from '../../../contexts/auth-context';
import { formatZAR } from '../../../lib/money';
import { fetchUserCalculations } from '../../../utils/firebase';

export default function UserDetails() {
  const { uid } = useLocalSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [calcs, setCalcs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.replace('/dashboard');
        return;
      }
      if (uid) loadCalcs();
    }
  }, [uid, user, authLoading]);

  async function loadCalcs() {
    try {
      const data = await fetchUserCalculations(uid as string);
      setCalcs(data);
    } catch (err) {
      console.error("Error loading user calculations:", err);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
        <ActivityIndicator size="large" color="#0A5C3B" />
        <Text color="$muted" marginTop="$3">Loading calculations...</Text>
      </YStack>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      <Card title="User Calculations" subtitle={`${calcs.length} calculation${calcs.length !== 1 ? 's' : ''}`}>
        {calcs.length === 0 ? (
          <YStack padding="$4" alignItems="center" gap="$3">
            <Ionicons name="calculator-outline" size={48} color="#ccc" />
            <Text color="$muted" textAlign="center">No calculations found for this user.</Text>
          </YStack>
        ) : (
          calcs.map((c) => (
            <View key={c.id} style={{ 
              marginBottom: 16, 
              padding: 12, 
              backgroundColor: '#f9f9f9', 
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#eee'
            }}>
              <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
                <XStack alignItems="center" gap="$2">
                  <View style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: 16, 
                    backgroundColor: '#0A5C3B',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Ionicons 
                      name={c.type === 'transfer' ? 'swap-horizontal' : c.type === 'bond' ? 'business' : 'calculator'} 
                      size={16} 
                      color="white" 
                    />
                  </View>
                  <Text fontWeight="700" fontSize="$4" textTransform="capitalize">{c.type}</Text>
                </XStack>
                <Text color="$muted" fontSize="$3">
                  {c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1000).toLocaleDateString() : ''}
                </Text>
              </XStack>
              
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: '600', marginBottom: 4, color: '#666' }}>Inputs:</Text>
                {Object.entries(c.inputs || {}).map(([k, v]) => (
                  <Text key={k} style={{ fontSize: 14, color: '#444' }}>
                    {k}: {typeof v === 'number' ? formatZAR(v) : String(v)}
                  </Text>
                ))}
              </View>

              <View>
                <Text style={{ fontWeight: '600', marginBottom: 4, color: '#666' }}>Results:</Text>
                {Object.entries(c.result || {}).map(([k, v]) => (
                  <Text key={k} style={{ fontSize: 14, color: '#444' }}>
                    {k}: {typeof v === 'number' ? formatZAR(v) : String(v)}
                  </Text>
                ))}
              </View>
            </View>
          ))
        )}
      </Card>
      
      <YStack marginTop="$4">
        <Button backgroundColor="$brandLight" onPress={() => router.push('/admin')}>
          <BtnText>Back to Admin</BtnText>
        </Button>
      </YStack>
    </ScrollView>
  );
}
