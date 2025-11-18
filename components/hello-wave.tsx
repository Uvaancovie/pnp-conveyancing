import Animated from 'react-native-reanimated';

export function HelloWave() {
  return (
    <Animated.Text
      style={{
        fontSize: 28,
        lineHeight: 32,
        marginTop: -6,
        // animation props are web-only; cast to any to avoid type errors
      } as any}
      >
      👋
    </Animated.Text>
  );
}
