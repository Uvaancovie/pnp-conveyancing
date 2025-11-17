import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { Button, BtnText } from '../components/Button';
import { registerWithEmail } from '../utils/firebase';

export default function SignUp(){
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  async function submit() {
    if (!email || !password) return Alert.alert('Missing info', 'Provide email and password');
    try {
      await registerWithEmail(email, password, name || undefined);
      Alert.alert('Welcome!', 'Your account is ready.', [
        { text: 'Open Profile', onPress: () => router.push('/profile') },
        { text: 'Close', style: 'cancel' }
      ]);
    } catch (err: any) {
      Alert.alert('Sign up failed', err?.message ?? 'Unknown error');
    }
  }

  return (
    <Card title="Create Account">
      <Field label="Display Name" value={name} onChangeText={setName} />
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Choose a strong password" />
      <Button onPress={submit}><BtnText>Create Account</BtnText></Button>
    </Card>
  );
}
