import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Input, Text, XStack, YStack } from 'tamagui';
import { heroImages } from '../../assets/images';
import { BtnText, Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Field } from '../../components/Field';
import { HeroImage } from '../../components/HeroImage';
import { useAuth } from '../../contexts/auth-context';
import { UserRole } from '../../types/auth';

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleChoice, setRoleChoice] = useState<'homeowner' | 'realtor'>('homeowner');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const role: UserRole = useMemo(
    () => (roleChoice === 'realtor' ? 'agent' : 'customer'),
    [roleChoice]
  );

  const handleRegister = async () => {
    if (!displayName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, displayName, role, phoneNumber);
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => router.replace('/dashboard') },
      ]);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
          <HeroImage
            source={heroImages.signup}
            title="Create Account"
            subtitle="Join PnP Conveyancer today"
            height={200}
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
                    <XStack alignItems="center" gap="$2" justifyContent="center">
                      <Ionicons name="person" size={18} color="white" />
                      <BtnText>Homeowner</BtnText>
                    </XStack>
                  </Button>
                  <Button
                    flex={1}
                    variant={roleChoice === 'realtor' ? undefined : 'secondary'}
                    onPress={() => setRoleChoice('realtor')}
                    opacity={loading ? 0.7 : 1}
                  >
                    <XStack alignItems="center" gap="$2" justifyContent="center">
                      <Ionicons name="briefcase" size={18} color="white" />
                      <BtnText>Realtor</BtnText>
                    </XStack>
                  </Button>
                </XStack>
              </YStack>

              <Field
                label="Full Name *"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                autoCapitalize="words"
              />
              <Field
                label="Email Address *"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholder="email@example.com"
              />
              <Field
                label="Phone Number (Optional)"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder=""
              />

              <YStack gap="$2">
                <Text color="$color" fontWeight="600">Password *</Text>
                <XStack
                  backgroundColor="$bg"
                  borderRadius="$2"
                  borderWidth={1}
                  borderColor="$border"
                  alignItems="center"
                  paddingHorizontal="$3"
                >
                  <Ionicons name="lock-closed" size={20} color="#666" />
                  <Input
                    flex={1}
                    backgroundColor="transparent"
                    borderWidth={0}
                    placeholder="Min 6 characters"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <XStack
                    pressStyle={{ opacity: 0.7 }}
                    onPress={() => setShowPassword(!showPassword)}
                    padding="$2"
                  >
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
                  </XStack>
                </XStack>
              </YStack>

              <YStack gap="$2">
                <Text color="$color" fontWeight="600">Confirm Password *</Text>
                <XStack
                  backgroundColor="$bg"
                  borderRadius="$2"
                  borderWidth={1}
                  borderColor="$border"
                  alignItems="center"
                  paddingHorizontal="$3"
                >
                  <Ionicons name="lock-closed" size={20} color="#666" />
                  <Input
                    flex={1}
                    backgroundColor="transparent"
                    borderWidth={0}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                </XStack>
              </YStack>

              <Button onPress={handleRegister} opacity={loading ? 0.7 : 1}>
                <BtnText>{loading ? 'Creating Account...' : 'Create Account'}</BtnText>
              </Button>

              <XStack alignItems="center" marginVertical="$2">
                <YStack flex={1} height={1} backgroundColor="$border" />
                <Text color="$muted" marginHorizontal="$3" fontSize="$3">OR</Text>
                <YStack flex={1} height={1} backgroundColor="$border" />
              </XStack>

              <XStack justifyContent="center">
                <Text
                  color="$brand"
                  fontWeight="700"
                  textDecorationLine="underline"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => router.push('/login' as any)}
                >
                  Already have an account? Sign In
                </Text>
              </XStack>
            </YStack>
          </Card>

          <YStack marginTop="$4" alignItems="center">
            <Text color="$muted" fontSize="$2" textAlign="center">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Text>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </YStack>
  );
}
