import { Text, XStack } from 'tamagui';
export function ResultRow({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical="$2" gap="$3">
      <Text
        color="$muted"
        fontSize={big ? "$4" : "$3"}
        style={{ flexShrink: 1, flexBasis: '50%', maxWidth: '55%' }}
        numberOfLines={2}
      >
        {label}
      </Text>
      <Text
        fontWeight="700"
        fontSize={big ? "$5" : "$4"}
        textAlign="right"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        style={{ flexShrink: 0, minWidth: 120, textAlign: 'right' }}
      >
        {value}
      </Text>
    </XStack>
  );
}