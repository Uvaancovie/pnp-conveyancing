import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ImageSourcePropType, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ImageGalleryProps {
  images: ImageSourcePropType[];
  height?: number;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  title?: string;
  subtitle?: string;
}

/**
 * ImageGallery - Auto-sliding image carousel with smooth transitions
 * 
 * Features:
 * - Smooth sliding animation between images
 * - Auto-play with configurable interval
 * - Optional page indicators
 * - Brand gradient overlay for text readability
 */
export function ImageGallery({ 
  images, 
  height = 200, 
  autoPlayInterval = 4000,
  showIndicators = true,
  title,
  subtitle
}: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(SCREEN_WIDTH);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (images.length <= 1) return;
    if (!containerWidth) return;

    const interval = setInterval(() => {
      // Fade out, change image, fade in
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      // Slide animation
      const nextIndex = (activeIndex + 1) % images.length;
      
      Animated.timing(slideAnim, {
        toValue: -nextIndex * containerWidth,
        duration: 600,
        useNativeDriver: true,
      }).start();

      setActiveIndex(nextIndex);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [activeIndex, images.length, autoPlayInterval, containerWidth, fadeAnim, slideAnim]);

  // Keep animation position in sync with layout/orientation changes
  useEffect(() => {
    slideAnim.setValue(-activeIndex * containerWidth);
  }, [activeIndex, containerWidth, slideAnim]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w && w !== containerWidth) setContainerWidth(w);
  };

  return (
    <YStack 
      height={height} 
      width="100%" 
      borderRadius="$4" 
      overflow="hidden" 
      marginBottom="$4"
      position="relative"
      backgroundColor="$card"
      borderWidth={1}
      borderColor="$border"
      shadowColor="rgba(0,0,0,0.06)"
      shadowRadius={10}
      onLayout={onLayout}
    >
      {/* Sliding images container */}
      <Animated.View
        style={[
          styles.slideContainer,
          {
            width: containerWidth * images.length,
            transform: [{ translateX: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        {images.map((image, index) => (
          <Animated.Image
            key={index}
            source={image}
            style={[styles.image, { width: containerWidth, height }]}
            resizeMode="cover"
          />
        ))}
      </Animated.View>

      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(10, 92, 59, 0.3)', 'rgba(10, 92, 59, 0.7)']}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Text overlay */}
      {(title || subtitle) && (
        <YStack 
          position="absolute" 
          bottom={0} 
          left={0} 
          right={0} 
          padding="$4"
          pointerEvents="none"
        >
          {title && (
            <Text 
              color="white" 
              fontSize="$6" 
              fontWeight="700"
              textShadowColor="rgba(0,0,0,0.3)"
              textShadowOffset={{ width: 0, height: 1 }}
              textShadowRadius={3}
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text 
              color="rgba(255,255,255,0.9)" 
              fontSize="$3"
              marginTop="$1"
            >
              {subtitle}
            </Text>
          )}
        </YStack>
      )}

      {/* Page indicators */}
      {showIndicators && images.length > 1 && (
        <XStack 
          position="absolute" 
          bottom="$3" 
          right="$3"
          gap="$2"
          pointerEvents="none"
        >
          {images.map((_, index) => (
            <YStack
              key={index}
              width={index === activeIndex ? 20 : 8}
              height={8}
              borderRadius={4}
              backgroundColor={index === activeIndex ? 'white' : 'rgba(255,255,255,0.5)'}
              animation="quick"
            />
          ))}
        </XStack>
      )}
    </YStack>
  );
}

const styles = StyleSheet.create({
  slideContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  image: {
    height: '100%',
  },
});

export default ImageGallery;
