import { styled, Text, YStack } from 'tamagui';
export const Button = styled(YStack, {
  alignItems: 'center', 
  justifyContent: 'center', 
  backgroundColor: '$brand', 
  borderRadius: '$4', 
  paddingVertical: '$3', 
  paddingHorizontal: '$4',
  borderWidth: 1,
  borderColor: '$brand',
  hoverStyle: { backgroundColor: '$brandActive', borderColor: '$brandActive' }, 
  pressStyle: { scale: 0.98, opacity: 0.95 },
  variants: {
    variant: {
      outline: {
        backgroundColor: 'transparent',
        borderColor: '$brand',
        hoverStyle: { backgroundColor: '$brandLight' }
      },
      secondary: {
        backgroundColor: '$brandLight',
        borderColor: '$brandLight',
        hoverStyle: { backgroundColor: '$brandLightHover' }
      }
    }
  }
});
export const BtnText = (p:any)=> <Text color={p.color || "white"} fontWeight="700">{p.children}</Text>;