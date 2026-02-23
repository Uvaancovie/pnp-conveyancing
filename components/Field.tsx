import { Text, Input as TInput, YStack } from 'tamagui';

export function Field({ label, ...props }: any) {
  const {
    keyboardType,
    value,
    onChangeText,
    placeholder,
    ...rest
  } = props;

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
        outlineWidth={0}
        outlineStyle="none"
        focusStyle={{ borderColor: '$border', borderWidth: 1, outlineWidth: 0, outlineStyle: 'none' }}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        {...rest}
      />
    </YStack>
  );
}