import { ImageSourcePropType } from 'react-native';
import { Image, Text, YStack } from 'tamagui';

interface CardProps {
  title?: string;
  subtitle?: string;
  children?: any;
  backgroundImage?: ImageSourcePropType;
  imageOpacity?: number;
}

export function Card({ title, subtitle, children, backgroundImage, imageOpacity = 0.08 }: CardProps) {
  return (
    <YStack 
      backgroundColor="$card" 
      borderRadius="$4" 
      padding="$4" 
      borderWidth={1} 
      borderColor="$border" 
      shadowColor="rgba(0,0,0,0.06)" 
      shadowRadius={8} 
      gap="$2"
      marginBottom="$3"
      position="relative"
      overflow="hidden"
    >
      {backgroundImage && (
        <Image
          source={backgroundImage}
          style={{
            position: 'absolute',
            right: -20,
            bottom: -20,
            width: 120,
            height: 120,
            opacity: imageOpacity,
            borderRadius: 60,
          }}
          resizeMode="cover"
        />
      )}
      {title ? <Text fontFamily="$heading" fontWeight="700" fontSize="$3" color="#034c21" zIndex={1}>{title}</Text> : null}
      {subtitle ? <Text color="$muted" fontSize={14} zIndex={1}>{subtitle}</Text> : null}
      {children}
    </YStack>
  );
}