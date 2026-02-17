import { Text, XStack } from 'tamagui';
export function ResultRow({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <XStack justifyContent="space-between" alignItems="flex-start" paddingVertical="$2" gap="$2">
      <Text color="$muted" flex={1} style={{ flexShrink: 1 }}>{label}</Text>
      <Text
        fontWeight="700"
        fontSize={big ? "$5" : "$4"}
        textAlign="right"
        style={{ flexShrink: 1 }}
      >
        {value}
      </Text>
    </XStack>
  );
}