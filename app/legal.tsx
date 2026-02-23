import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Paragraph, Text, YStack } from 'tamagui';
import { heroImages } from '../assets/images';
import { BtnText, Button } from '../components/Button';
import { Card } from '../components/Card';
import { HeroImage } from '../components/HeroImage';
import { QuickNavBar } from '../components/Navigation';
import theme from '../config/theme.json';

export default function Legal(){
  const router = useRouter();
  
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <HeroImage 
          source={heroImages.legal}
          title="Legal & Disclaimer"
          subtitle="Important information about our services"
          height={160}
          overlayOpacity={0.6}
        />
        
        <Card>
          <Paragraph color="$color" lineHeight="$5" fontSize={10}>
            {theme.disclaimer}
          </Paragraph>
        </Card>
        
        <Card title="Contact Information">
          <YStack gap="$2">
            <Text color="$muted" fontSize={10}>For legal queries, please contact us:</Text>
            <Text fontWeight="700" color="#034c21">Pather & Pather Attorneys</Text>
            <Text color="$muted" fontSize={10}>Umhlanga, South Africa</Text>
          </YStack>
        </Card>
        
        <YStack marginTop="$4">
          <Button onPress={() => router.push('/start')}>
            <BtnText>Start My Transfer</BtnText>
          </Button>
        </YStack>
      </ScrollView>
      <QuickNavBar />
    </View>
  );
}