import { XStack, Text } from 'tamagui';
export function ResultRow({ label, value, big }: { label: string; value: string; big?: boolean }){
  return (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical="$2">
      <Text color="$muted">{label}</Text>
      <Text fontWeight="700" fontSize={big ? "$4" : "$3"}>{value}</Text>
    </XStack>
  );
}