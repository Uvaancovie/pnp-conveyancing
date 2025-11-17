import { YStack, Text, Input as TInput } from 'tamagui';
export function Field({ label, ...props }: any){
  return (
    <YStack gap="$1">
      <Text color="$color" fontWeight="600">{label}</Text>
      <TInput 
        borderRadius="$2" 
        borderWidth={1} 
        borderColor="$border" 
        padding="$3" 
        backgroundColor="$bg" 
        color="$color"
        focusStyle={{ borderColor: '$brand', borderWidth: 2 }}
        keyboardType={props.keyboardType}
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
      />
    </YStack>
  );
}