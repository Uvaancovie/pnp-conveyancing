import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { Text, YStack } from 'tamagui';
import { heroImages } from '../assets/images';
import { BtnText, Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { HeroImage } from '../components/HeroImage';
import { useAuth } from '../contexts/auth-context';
import { UserRole, UserType } from '../types/auth';

export default function SignUp(){
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<UserType>('homeowner');
  const [loading, setLoading] = useState(false);

  const role: UserRole = useMemo(() => {
    if (userType === 'homeowner') return 'customer';
    return 'agent'; // Both estate-agent and developer are agents
  }, [userType]);

  async function submit() {
    console.log('Submit called', { email, password: '***', name, userType, role });
    
    // Validation: Check all required fields
    if (!email || !email.trim()) {
      console.log('Validation failed: email missing');
      return Alert.alert('Missing Information', 'Please enter your email address.');
    }
    
    // More robust email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      console.log('Validation failed: invalid email format');
      return Alert.alert('Invalid Email', 'Please enter a valid email address.');
    }
    
    if (!password || password.length < 6) {
      console.log('Validation failed: password too short', password.length);
      return Alert.alert('Invalid Password', 'Password must be at least 6 characters long.');
    }
    
    if (!name || !name.trim()) {
      console.log('Validation failed: name missing');
      return Alert.alert('Missing Information', 'Please enter your display name.');
    }
    
    if (!userType) {
      console.log('Validation failed: userType missing');
      return Alert.alert('Missing Information', 'Please select your account type.');
    }

    console.log('All validations passed, calling register...');
    setLoading(true);
    try {
      await register(email.trim(), password, name.trim(), role, undefined, userType);
      console.log('Register successful, navigating to dashboard');
      router.replace('/dashboard');
    } catch (err: any) {
      console.error('Register error:', err);
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
            <Text color="$muted" fontWeight="600">Account Type *</Text>
            <Text color="$muted" fontSize="$2">Select the option that best describes you</Text>
            <YStack gap="$2" marginTop="$2">
              <Button
                variant={userType === 'homeowner' ? undefined : 'secondary'}
                onPress={() => setUserType('homeowner')}
                opacity={loading ? 0.7 : 1}
                borderWidth={userType === 'homeowner' ? 2 : 1}
                borderColor={userType === 'homeowner' ? '$brand' : '$border'}
              >
                <BtnText color={userType === 'homeowner' ? undefined : '$brand'}>
                  Homeowner
                </BtnText>
              </Button>
              <Button
                variant={userType === 'estate-agent' ? undefined : 'secondary'}
                onPress={() => setUserType('estate-agent')}
                opacity={loading ? 0.7 : 1}
                borderWidth={userType === 'estate-agent' ? 2 : 1}
                borderColor={userType === 'estate-agent' ? '$brand' : '$border'}
              >
                <BtnText color={userType === 'estate-agent' ? undefined : '$brand'}>
                  Estate Agent
                </BtnText>
              </Button>
              <Button
                variant={userType === 'developer' ? undefined : 'secondary'}
                onPress={() => setUserType('developer')}
                opacity={loading ? 0.7 : 1}
                borderWidth={userType === 'developer' ? 2 : 1}
                borderColor={userType === 'developer' ? '$brand' : '$border'}
              >
                <BtnText color={userType === 'developer' ? undefined : '$brand'}>
                  Developer
                </BtnText>
              </Button>
            </YStack>
          </YStack>
          <Field label="Display Name *" value={name} onChangeText={setName} placeholder="Your full name" />
          <Field label="Email *" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="email@example.com" />
          <Field label="Password *" value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 6 characters" />
          <Button 
            onPress={() => {
              console.log('Button pressed');
              submit();
            }} 
            opacity={loading ? 0.7 : 1}
            disabled={loading}
          >
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
