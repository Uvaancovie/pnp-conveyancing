import { styled, YStack, Text } from 'tamagui';
export const Button = styled(YStack, {
  alignItems: 'center', 
  justifyContent: 'center', 
  backgroundColor: '$brand', 
  borderRadius: '$4', 
  paddingVertical: '$3', 
  paddingHorizontal: '$4',
  hoverStyle: { backgroundColor: '$brandActive' }, 
  pressStyle: { scale: 0.98, opacity: 0.95 }
});
export const BtnText = (p:any)=> <Text color="white" fontWeight="700">{p.children}</Text>;