import { YStack, Text } from 'tamagui';
export function Card({ title, subtitle, children }: { title?: string; subtitle?: string; children?: any }) {
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
    >
      {title ? <Text fontFamily="$heading" fontWeight="700" fontSize="$5">{title}</Text> : null}
      {subtitle ? <Text color="$muted">{subtitle}</Text> : null}
      {children}
    </YStack>
  );
}