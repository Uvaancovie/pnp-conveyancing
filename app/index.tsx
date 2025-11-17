import { ScrollView, Image } from 'react-native';
import { YStack, Text } from 'tamagui';
import { Link } from 'expo-router';

function HomeCard({ title, subtitle, href }: any){
  return (
    <Link href={href} asChild>
      <YStack 
        backgroundColor="$card" 
        borderRadius="$4" 
        padding="$4" 
        borderWidth={1} 
        borderColor="$border" 
        shadowColor="rgba(0,0,0,0.06)" 
        shadowRadius={8} 
        marginBottom="$3"
        pressStyle={{ opacity: 0.8 }}
      >
        <Text fontWeight="700" fontSize="$4">{title}</Text>
        {subtitle ? <Text color="$muted">{subtitle}</Text> : null}
      </YStack>
    </Link>
  );
}

export default function Home(){
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <YStack alignItems="center" marginBottom="$5">
        <Image source={{ uri: 'https://via.placeholder.com/72x72/0A5C3B/FFFFFF?text=P%26P' }} style={{ width: 72, height: 72, borderRadius: 16 }} />
        <Text fontFamily="$heading" fontWeight="700" fontSize="$5" marginTop="$2">Pather & Pather Attorneys</Text>
        <Text color="$muted">Conveyancing Companion</Text>
      </YStack>
      <HomeCard title="Transfer Cost Calculator" subtitle="Duty + attorney + disbursements" href="/transfer" />
      <HomeCard title="Bond Cost Calculator" subtitle="Attorney + disbursements" href="/bond" />
      <HomeCard title="Bond Repayment Calculator" subtitle="Monthly & totals" href="/repayment" />
      <HomeCard title="Start My Transfer" subtitle="Send details & open WhatsApp" href="/start" />
      <HomeCard title="Legal & Disclaimer" href="/legal" />
      <HomeCard title="Create Account" subtitle="Get a profile and save calculations" href="/signup" />
      <HomeCard title="My Profile" subtitle="View saved calculations" href="/profile" />
    </ScrollView>
  );
}