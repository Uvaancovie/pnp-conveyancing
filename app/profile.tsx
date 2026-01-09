import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Text as TText, XStack, YStack } from 'tamagui';
import { heroImages } from '../assets/images';
import { BtnText, Button } from '../components/Button';
import { Card } from '../components/Card';
import { HeroImage } from '../components/HeroImage';
import { useAuth } from '../contexts/auth-context';
import { formatZAR } from '../lib/money';
import { fetchMyCalculations } from '../utils/firebase';

export default function Profile(){
  const router = useRouter();
  const { user, logout } = useAuth();
  const [calcs, setCalcs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const roleLabel = user?.role === 'admin' ? 'Admin' : user?.role === 'agent' ? 'Realtor' : 'Homeowner';

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    fetchMyCalculations()
      .then(r => { if (mounted) setCalcs(r as any[]); })
      .catch(err => console.error("Error fetching calculations:", err))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [user]);

  if (!user) {
    return (
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <HeroImage 
          source={heroImages.profile}
          title="My Profile"
          subtitle="Sign in to view your saved calculations"
          height={180}
          overlayOpacity={0.55}
        />
        
        <Card>
          <YStack gap="$4" padding="$2">
            <TText color="$muted" textAlign="center">Sign in to view your profile and saved calculations.</TText>
            <XStack gap="$3" justifyContent="center">
              <Button flex={1} onPress={() => router.push('/login')}>
                <BtnText>Sign In</BtnText>
              </Button>
              <Button flex={1} variant="secondary" onPress={() => router.push('/signup')}>
                <BtnText color="$brand">Create Account</BtnText>
              </Button>
            </XStack>
          </YStack>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      <HeroImage 
        source={heroImages.profile}
        title={user.displayName || 'My Profile'}
        subtitle={roleLabel}
        height={180}
        overlayOpacity={0.55}
      />
      
      <Card>
        <YStack padding="$2" gap="$4">
          <XStack alignItems="center" justifyContent="space-between" gap="$3">
            <XStack alignItems="center" gap="$3" flexShrink={1}>
              <YStack
                width={52}
                height={52}
                borderRadius="$10"
                backgroundColor="$brand"
                alignItems="center"
                justifyContent="center"
              >
                <Ionicons name="person" size={24} color="white" />
              </YStack>
              <YStack flexShrink={1}>
                <TText fontWeight="700" fontSize="$5" numberOfLines={1}>{user.displayName || 'User'}</TText>
                <TText color="$muted" fontSize="$3" numberOfLines={1}>{user.email}</TText>
              </YStack>
            </XStack>

            <YStack
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius="$10"
              backgroundColor="$card"
              borderWidth={1}
              borderColor="$border"
              alignItems="center"
              minWidth={96}
            >
              <TText fontSize="$2" color="$muted">Role</TText>
              <TText fontWeight="700" color="$brand">{roleLabel}</TText>
            </YStack>
          </XStack>

          <XStack gap="$3">
            <YStack
              flex={1}
              padding="$3"
              borderRadius="$4"
              backgroundColor="$card"
              borderWidth={1}
              borderColor="$border"
            >
              <TText fontSize="$2" color="$muted">Saved calculations</TText>
              <TText fontSize="$7" fontWeight="800" color="$brand">{calcs.length}</TText>
              <TText fontSize="$2" color="$muted">Total you’ve saved</TText>
            </YStack>
          </XStack>
        </YStack>
      </Card>

      <Card title="Saved Calculations" subtitle={`${calcs.length} calculation${calcs.length !== 1 ? 's' : ''}`}>
        {loading ? (
          <ActivityIndicator size="small" style={{ padding: 20 }} />
        ) : calcs.length === 0 ? (
          <YStack padding="$4" alignItems="center" gap="$3">
            <Ionicons name="calculator-outline" size={48} color="#ccc" />
            <TText color="$muted" textAlign="center">No saved calculations yet.</TText>
            <TText color="$muted" fontSize="$3" textAlign="center">Use our calculators and tap "Save to Profile" to keep a record.</TText>
          </YStack>
        ) : (
          calcs.map(c => (
            <View key={c.id} style={{ 
              marginBottom: 16, 
              padding: 12, 
              backgroundColor: '#f9f9f9', 
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#eee'
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View>
                  {c.name ? (
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{c.name}</Text>
                  ) : null}
                  <Text style={{ fontWeight: c.name ? 'normal' : 'bold', fontSize: c.name ? 14 : 16, textTransform: 'capitalize', color: c.name ? '#666' : '#000' }}>
                    {c.type}
                  </Text>
                </View>
                <Text style={{ color: '#666' }}>
                  {c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1000).toLocaleDateString() : ''}
                </Text>
              </View>
              
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: '600', marginBottom: 4 }}>Inputs:</Text>
                {Object.entries(c.inputs || {}).map(([k, v]) => (
                  <Text key={k} style={{ fontSize: 14, color: '#444' }}>
                    {k}: {typeof v === 'number' ? formatZAR(v) : String(v)}
                  </Text>
                ))}
              </View>

              <View>
                <Text style={{ fontWeight: '600', marginBottom: 4 }}>Results:</Text>
                {Object.entries(c.result || {}).map(([k, v]) => (
                  <Text key={k} style={{ fontSize: 14, color: '#444' }}>
                    {k}: {typeof v === 'number' ? formatZAR(v) : String(v)}
                  </Text>
                ))}
              </View>

              {c.pdfUrl && (
                <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#eee' }}>
                  <Button 
                    variant="outline" 
                    onPress={() => {
                      // Open PDF in browser
                      import('expo-web-browser').then(WebBrowser => {
                        WebBrowser.openBrowserAsync(c.pdfUrl);
                      });
                    }}
                    paddingVertical="$2"
                  >
                    <XStack gap="$2" alignItems="center">
                      <Ionicons name="document-text-outline" size={18} color="#0A5C3B" />
                      <BtnText color="$brand" fontSize="$3">View PDF</BtnText>
                    </XStack>
                  </Button>
                </View>
              )}
            </View>
          ))
        )}
      </Card>

      <YStack gap="$3" marginTop="$2">
        <TText textAlign="center" color="$muted" fontSize="$3">Quick Actions</TText>
        <XStack gap="$3" justifyContent="center">
          <Button flex={1} variant="secondary" onPress={() => router.push('/transfer')}>
            <BtnText color="$brand">Transfer</BtnText>
          </Button>
          <Button flex={1} variant="secondary" onPress={() => router.push('/bond')}>
            <BtnText color="$brand">Bond</BtnText>
          </Button>
        </XStack>
        
        <Button marginTop="$2" onPress={async () => {
          await logout().catch(() => {});
          router.replace('/');
        }}>
          <BtnText>Sign Out</BtnText>
        </Button>
      </YStack>
    </ScrollView>
  );
}
