import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Text, YStack } from 'tamagui';

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <YStack flex={1} backgroundColor="$brand" alignItems="center" justifyContent="center">
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <YStack style={styles.iconCircle}>
          <Ionicons name="home" size={80} color="#fff" />
        </YStack>
        <Text style={styles.title}>PnP Conveyancer</Text>
        <Text style={styles.subtitle}>Property Transfer Made Simple</Text>
      </Animated.View>
      <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
        <YStack style={styles.loadingDot} />
        <YStack style={[styles.loadingDot, styles.loadingDotDelay1]} />
        <YStack style={[styles.loadingDot, styles.loadingDotDelay2]} />
      </Animated.View>
    </YStack>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    marginTop: 50,
    gap: 10,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  loadingDotDelay1: {
    opacity: 0.7,
  },
  loadingDotDelay2: {
    opacity: 0.4,
  },
});
