import { XStack, YStack, Text } from 'tamagui';
export function Segmented({ options, value, onChange }: { options: (number|string)[]; value: any; onChange: (v:any)=>void }){
  return (
    <XStack flexWrap="wrap" gap="$2">
      {options.map((o)=>{
        const selected = o === value;
        return (
          <YStack 
            key={String(o)} 
            paddingHorizontal="$3" 
            paddingVertical="$2" 
            borderRadius="$4" 
            backgroundColor={selected ? '$brand' : '$border'} 
            onPress={()=>onChange(o)}
            pressStyle={{ opacity: 0.8 }}
          >
            <Text color={selected ? 'white' : '$color'}>{String(o)}</Text>
          </YStack>
        );
      })}
    </XStack>
  );
}