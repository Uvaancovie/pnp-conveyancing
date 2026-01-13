import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { heroImages } from '../../assets/images';
import { BtnText, Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Field } from '../../components/Field';
import { HeroImage } from '../../components/HeroImage';
import { useAuth } from '../../contexts/auth-context';
import { UserRole } from '../../types/auth';

export default function SignUp() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [roleChoice, setRoleChoice] = useState<'homeowner' | 'realtor'>('homeowner');
  const [loading, setLoading] = useState(false);

  const role: UserRole = useMemo(
    () => (roleChoice === 'realtor' ? 'agent' : 'customer'),
    [roleChoice]
  );

  async function submit() {
    if (!email || !password) return Alert.alert('Missing info', 'Provide email and password');
    setLoading(true);
    try {
      await register(email, password, name || 'User', role);
      router.replace('/dashboard');
    } catch (err: any) {
      Alert.alert('Sign up failed', err?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      <HeroImage 
        source={heroImages.signup}
        title="Create Account"
        subtitle="Register to save your calculations"
        height={180}
        overlayOpacity={0.55}
      />

      <Card>
        <YStack gap="$3">
          <YStack gap="$2">
            <Text color="$muted">Register as</Text>
            <XStack gap="$2">
              <Button
                flex={1}
                variant={roleChoice === 'homeowner' ? undefined : 'secondary'}
                onPress={() => setRoleChoice('homeowner')}
                opacity={loading ? 0.7 : 1}
              >
                <BtnText color={roleChoice === 'homeowner' ? undefined : '$brand'}>Homeowner</BtnText>
              </Button>
              <Button
                flex={1}
                variant={roleChoice === 'realtor' ? undefined : 'secondary'}
                onPress={() => setRoleChoice('realtor')}
                opacity={loading ? 0.7 : 1}
              >
                <BtnText color={roleChoice === 'realtor' ? undefined : '$brand'}>Realtor</BtnText>
              </Button>
            </XStack>
          </YStack>

          <Field label="Display Name" value={name} onChangeText={setName} placeholder="Your name" />
          <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="email@example.com" />
          <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Choose a strong password" />
          <Button onPress={submit} opacity={loading ? 0.7 : 1}>
            <BtnText>{loading ? 'Creating...' : 'Create Account'}</BtnText>
          </Button>
        </YStack>
      </Card>

      <YStack alignItems="center" marginTop="$4" gap="$2">
        <Text color="$muted">Already have an account?</Text>
        <Link href="/login" asChild>
          <Text color="$brand" fontWeight="700">Sign In</Text>
        </Link>
      </YStack>
    </ScrollView>
  );
}
