import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';
import { Paragraph, Text, YStack } from 'tamagui';
import { heroImages } from '../assets/images';
import { BtnText, Button } from '../components/Button';
import { Card } from '../components/Card';
import { HeroImage } from '../components/HeroImage';
import theme from '../config/theme.json';

export default function Legal(){
  const router = useRouter();
  
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      <HeroImage 
        source={heroImages.legal}
        title="Legal & Disclaimer"
        subtitle="Important information about our services"
        height={160}
        overlayOpacity={0.6}
      />
      
      <Card>
        <Paragraph color="$color" lineHeight="$6" fontSize="$4">
          {theme.disclaimer}
        </Paragraph>
      </Card>
      
      <Card title="Contact Information">
        <YStack gap="$2">
          <Text color="$muted" fontSize="$3">For legal queries, please contact us:</Text>
          <Text fontWeight="600">Pather & Pather Attorneys</Text>
          <Text color="$color">Umhlanga, South Africa</Text>
        </YStack>
      </Card>
      
      <YStack marginTop="$4">
        <Button onPress={() => router.push('/start')}>
          <BtnText>Start My Transfer</BtnText>
        </Button>
      </YStack>
    </ScrollView>
  );
}