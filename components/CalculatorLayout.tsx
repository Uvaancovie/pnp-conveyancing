import { ReactNode } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { Text, YStack } from 'tamagui';
import { HeroImage } from './HeroImage';
import { QuickNavBar } from './Navigation';

interface CalculatorLayoutProps {
  heroImage: any;
  title: string;
  subtitle: string;
  children: ReactNode;
  relatedCalculators?: ReactNode;
}

export function CalculatorLayout({
  heroImage,
  title,
  subtitle,
  children,
  relatedCalculators
}: CalculatorLayoutProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        contentContainerStyle={{ 
          padding: isMobile ? 12 : 16, 
          paddingBottom: 100,
          maxWidth: 1200,
          marginHorizontal: 'auto',
          width: '100%'
        }}
      >
        <HeroImage 
          source={heroImage}
          title={title}
          subtitle={subtitle}
          height={isMobile ? 140 : 160}
          overlayOpacity={0}
        />
        
        <YStack gap={isMobile ? "$3" : "$4"}>
          {children}
        </YStack>

        {relatedCalculators && (
          <YStack gap="$3" marginTop="$4">
            <Text textAlign="center" color="$muted" fontSize="$3" marginTop="$2">
              Related Calculators
            </Text>
            {relatedCalculators}
          </YStack>
        )}
      </ScrollView>
      <QuickNavBar />
    </View>
  );
}

interface CalculatorActionsProps {
  children: ReactNode;
}

export function CalculatorActions({ children }: CalculatorActionsProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <YStack gap={isMobile ? "$2.5" : "$3"} marginTop="$4">
      {children}
    </YStack>
  );
}
