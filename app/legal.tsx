import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';
import { Paragraph, Text, YStack } from 'tamagui';
import { BtnText, Button } from '../components/Button';
import { Card } from '../components/Card';
import theme from '../config/theme.json';

export default function Legal(){
  const router = useRouter();
  
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      <Card title="Legal Disclaimer" subtitle="Important information about our services">
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