import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Input, Text, XStack, YStack } from 'tamagui';
import { heroImages } from '../assets/images';
import { BtnText, Button } from '../components/Button';
import { HeroImage } from '../components/HeroImage';
import { useAuth } from '../contexts/auth-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/profile');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f8f9fa' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        <HeroImage 
          source={heroImages.login}
          title="Welcome Back"
          subtitle="Sign in to your account"
          height={200}
          overlayOpacity={0.55}
        />

        <YStack 
          backgroundColor="$card" 
          borderRadius="$4" 
          padding="$4" 
          borderWidth={1} 
          borderColor="$border"
          marginBottom="$4"
          gap="$3"
        >
          {/* Email Input */}
          <YStack gap="$2">
            <Text color="$muted" fontSize="$3" fontWeight="600">Email Address</Text>
            <XStack 
              backgroundColor="$background" 
              borderRadius="$3" 
              borderWidth={1} 
              borderColor="$border"
              alignItems="center"
              paddingHorizontal="$3"
            >
              <Ionicons name="mail" size={20} color="#666" />
              <Input
                flex={1}
                backgroundColor="transparent"
                borderWidth={0}
                placeholder="email@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </XStack>
          </YStack>

          {/* Password Input */}
          <YStack gap="$2">
            <Text color="$muted" fontSize="$3" fontWeight="600">Password</Text>
            <XStack 
              backgroundColor="$background" 
              borderRadius="$3" 
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
                placeholder="Enter your password"
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
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#666"
                />
              </XStack>
            </XStack>
          </YStack>

          {/* Login Button */}
          <Button 
            onPress={handleLogin} 
            opacity={loading ? 0.7 : 1}
            marginTop="$2"
          >
            <XStack alignItems="center" gap="$2">
              <Ionicons name="log-in" size={20} color="white" />
              <BtnText>{loading ? 'Signing In...' : 'Sign In'}</BtnText>
            </XStack>
          </Button>
        </YStack>

        {/* Divider */}
        <XStack alignItems="center" marginVertical="$4">
          <YStack flex={1} height={1} backgroundColor="$border" />
          <Text color="$muted" marginHorizontal="$3" fontSize="$3">OR</Text>
          <YStack flex={1} height={1} backgroundColor="$border" />
        </XStack>

        {/* Secondary Actions */}
        <YStack gap="$3">
          <Button 
            variant="secondary"
            onPress={() => router.push('/signup' as any)}
          >
            <BtnText color="$brand">Create New Account</BtnText>
          </Button>

          <XStack justifyContent="center" marginTop="$2">
            <Text 
              color="$muted" 
              fontSize="$3"
              textDecorationLine="underline"
              pressStyle={{ opacity: 0.7 }}
              onPress={() => router.push('/')}
            >
              Continue as Guest
            </Text>
          </XStack>
        </YStack>

        {/* Footer */}
        <YStack marginTop="$6" alignItems="center">
          <Text color="$muted" fontSize="$2" textAlign="center">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
