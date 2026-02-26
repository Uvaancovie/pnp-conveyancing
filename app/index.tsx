import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, useWindowDimensions } from 'react-native';
import { Button, Text, View, YStack } from 'tamagui';

export default function WelcomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const isShortScreen = height < 700;
  const splashLogoLargeWidth = Math.min(width * 0.95, 480);
  const accentSize = Math.min(height * 0.9, 850);
  const topInset = isShortScreen ? 24 : 60;
  const bottomInset = isShortScreen ? 20 : 48;

  return (
    <View
      flex={1}
      backgroundColor="#034C21"
      paddingHorizontal="$5"
      paddingTop={topInset}
      paddingBottom={bottomInset}
      justifyContent="space-between"
      overflow="hidden"
    >
      <StatusBar style="light" />

      {/* Background Accent / Overlay */}
      <View
        position="absolute"
        right={-accentSize * 0.25}
        bottom={-accentSize * 0.05}
        opacity={0.06}
        style={{ pointerEvents: 'none' }}
      >
        <Image
          source={require('../assets/images/accent/accent.png')}
          style={{ width: accentSize, height: accentSize }}
          resizeMode="contain"
        />
      </View>
      
      {/* Top Text */}
      <YStack alignItems="center" paddingTop={isShortScreen ? 0 : 6} zIndex={1}>
        <Text 
          color="white" 
          fontSize={16} 
          fontWeight="400" 
          letterSpacing={2}
          fontFamily="Poppins_400Regular"
          opacity={0.9}
        >
          REAL PEOPLE · REAL SOLUTIONS
        </Text>
      </YStack>

      {/* Main Content Area (Logo + Actions closer together) */}
      <YStack flex={1} justifyContent="center" alignItems="center" zIndex={1} gap={isShortScreen ? "$6" : "$10"}>
        <Image
          source={require('../assets/images/splash/splash-logo.png')}
          style={{ width: splashLogoLargeWidth, height: isShortScreen ? 110 : 160, opacity: 1 }}
          resizeMode="contain"
          accessibilityLabel="Pather & Pather"
        />

        <YStack gap="$4" width="100%" alignItems="center">
          <Button 
            backgroundColor="white" 
            width="100%" 
            maxWidth={280}
            height={isShortScreen ? 46 : 50}
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
              color="#034C21" 
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
            fontSize={15}
            opacity={0.9}
            fontFamily="Poppins_400Regular"
            pressStyle={{ opacity: 0.7 }}
          >
            Continue as guest
          </Text>
        </YStack>
      </YStack>

      {/* Footer */}
      <YStack alignItems="center" zIndex={1}>
        <Text 
          color="white" 
          fontSize={12} 
          opacity={0.75} 
          textAlign="center"
          fontFamily="Poppins_400Regular"
          letterSpacing={0.3}
          flexWrap="wrap"
        >
          Durban | Pietermaritzburg | Johannesburg | Pretoria | Cape Town
        </Text>
      </YStack>
    </View>
  );
}
