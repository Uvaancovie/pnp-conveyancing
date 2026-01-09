import { LinearGradient } from 'expo-linear-gradient';
import { ImageSourcePropType } from 'react-native';
import { H1, Image, Text, YStack } from 'tamagui';

interface HeroImageProps {
  source: ImageSourcePropType;
  title?: string;
  subtitle?: string;
  height?: number;
  overlayOpacity?: number;
  children?: React.ReactNode;
}

/**
 * HeroImage - A reusable hero section with background image
 * 
 * Features:
 * - Full-width image with gradient overlay
 * - Optional title and subtitle
 * - Customizable height and overlay opacity
 * - Optional children for additional content
 */
export function HeroImage({ 
  source, 
  title, 
  subtitle, 
  height = 200, 
  overlayOpacity = 0.6,
  children 
}: HeroImageProps) {
  return (
    <YStack 
      height={height} 
      width="100%" 
      position="relative" 
      overflow="hidden"
      borderRadius="$4"
      marginBottom="$4"
    >
      <Image
        source={source}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
        }}
        resizeMode="cover"
      />
      <LinearGradient
        colors={[`rgba(10, 92, 59, ${overlayOpacity})`, `rgba(10, 92, 59, ${overlayOpacity + 0.2})`]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <YStack 
        flex={1} 
        justifyContent="center" 
        alignItems="center" 
        padding="$4"
        zIndex={1}
      >
        {title && (
          <H1 
            color="white" 
            fontSize="$8" 
            fontWeight="700" 
            textAlign="center"
            textShadowColor="rgba(0,0,0,0.3)"
            textShadowOffset={{ width: 0, height: 2 }}
            textShadowRadius={4}
          >
            {title}
          </H1>
        )}
        {subtitle && (
          <Text 
            color="rgba(255,255,255,0.9)" 
            fontSize="$4" 
            textAlign="center"
            marginTop="$2"
          >
            {subtitle}
          </Text>
        )}
        {children}
      </YStack>
    </YStack>
  );
}

interface ImageCardProps {
  source: ImageSourcePropType;
  title?: string;
  subtitle?: string;
  height?: number;
  imageOpacity?: number;
  children?: React.ReactNode;
}

/**
 * ImageCard - A card with a subtle background image watermark
 * 
 * Use for cards that need visual interest without overwhelming content
 */
export function ImageCard({ 
  source, 
  title, 
  subtitle,
  height,
  imageOpacity = 0.08,
  children 
}: ImageCardProps) {
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
      height={height}
    >
      <Image
        source={source}
        style={{
          position: 'absolute',
          right: -20,
          bottom: -20,
          width: 150,
          height: 150,
          opacity: imageOpacity,
        }}
        resizeMode="cover"
      />
      {title && <Text fontFamily="$heading" fontWeight="700" fontSize="$5" zIndex={1}>{title}</Text>}
      {subtitle && <Text color="$muted" zIndex={1}>{subtitle}</Text>}
      {children}
    </YStack>
  );
}

interface BannerImageProps {
  source: ImageSourcePropType;
  height?: number;
}

/**
 * BannerImage - Simple full-width banner image
 * 
 * Use at the top of screens for visual impact
 */
export function BannerImage({ source, height = 160 }: BannerImageProps) {
  return (
    <YStack 
      height={height} 
      width="100%" 
      marginBottom="$4"
      borderRadius="$4"
      overflow="hidden"
    >
      <Image
        source={source}
        style={{
          width: '100%',
          height: '100%',
        }}
        resizeMode="cover"
      />
    </YStack>
  );
}

export default HeroImage;
