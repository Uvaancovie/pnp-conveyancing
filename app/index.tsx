import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'react-native';
import { Button, Text, View, YStack } from 'tamagui';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View flex={1} backgroundColor="#0A5C3B" paddingHorizontal="$5" justifyContent="space-between">
      <StatusBar style="light" />
      
      {/* Top Text */}
      <YStack marginTop="$12" alignItems="center">
        <Text 
          color="white" 
          fontSize={16} 
          fontWeight="400" 
          letterSpacing={0.5}
          fontFamily="Poppins_400Regular"
        >
          Real People · Real Solutions
        </Text>
      </YStack>

      {/* Center Logo Area */}
      <YStack alignItems="center" justifyContent="center" flex={1}>
        <Image 
          source={require('../assets/logo.png')}
          style={{ width: 280, height: 280 }}
          resizeMode="contain"
        />
        <YStack marginTop="$4" alignItems="center" gap="$1">
          <Text 
            color="white" 
            fontSize={24} 
            fontWeight="700" 
            letterSpacing={1}
            textAlign="center"
            fontFamily="Poppins_700Bold"
          >
            PATHER & PATHER
          </Text>
          <Text 
            color="white" 
            fontSize={13} 
            fontWeight="400" 
            letterSpacing={0.8}
            textAlign="center"
            opacity={0.9}
            fontFamily="Poppins_400Regular"
          >
            ATTORNEYS, NOTARIES & CONVEYANCERS
          </Text>
        </YStack>
      </YStack>

      {/* Bottom Actions */}
      <YStack gap="$3" marginBottom="$10" width="100%" alignItems="center">
        <Button 
          backgroundColor="white" 
          width="100%" 
          maxWidth={400}
          height={56}
          borderRadius={12}
          onPress={() => router.push('/(auth)/login')}
          pressStyle={{ opacity: 0.9, scale: 0.98 }}
          hoverStyle={{ opacity: 0.95 }}
          shadowColor="rgba(0,0,0,0.15)"
          shadowRadius={8}
          shadowOffset={{ width: 0, height: 4 }}
          elevationAndroid={3}
        >
          <Text 
            color="#0A5C3B" 
            fontWeight="600" 
            fontSize={16} 
            letterSpacing={0.5}
            fontFamily="Poppins_600SemiBold"
          >
            SIGN IN
          </Text>
        </Button>

        <Text 
          color="white" 
          textDecorationLine="underline" 
          onPress={() => router.replace('/dashboard')}
          fontSize={14}
          opacity={0.9}
          fontFamily="Poppins_400Regular"
          pressStyle={{ opacity: 0.7 }}
        >
          Continue as guest
        </Text>
      </YStack>

      {/* Footer */}
      <YStack marginBottom="$5" alignItems="center">
        <Text 
          color="white" 
          fontSize={11} 
          opacity={0.75} 
          textAlign="center"
          fontFamily="Poppins_400Regular"
          letterSpacing={0.3}
        >
          Durban | Pietermaritzburg | Johannesburg | Pretoria | Cape Town
        </Text>
      </YStack>
    </View>
  );
}
