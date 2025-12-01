import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { Text, YStack } from 'tamagui';
import { BtnText, Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { registerWithEmail } from '../utils/firebase';

export default function SignUp(){
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email || !password) return Alert.alert('Missing info', 'Provide email and password');
    setLoading(true);
    try {
      await registerWithEmail(email, password, name || undefined);
      Alert.alert('Welcome!', 'Your account is ready.', [
        { text: 'Open Profile', onPress: () => router.push('/profile') },
        { text: 'Close', style: 'cancel' }
      ]);
    } catch (err: any) {
      Alert.alert('Sign up failed', err?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      <Card title="Create Account" subtitle="Join us to save your calculations">
        <YStack gap="$3">
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
