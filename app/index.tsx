import { Link } from 'expo-router';
import { Image, ScrollView } from 'react-native';
import { Card, H1, H2, Paragraph, Text, YStack } from 'tamagui';

function HomeCard({ title, subtitle, href }: any){
  return (
    <Link href={href} asChild>
      <YStack 
        backgroundColor="$card" 
        borderRadius="$6" 
        padding="$5" 
        borderWidth={1} 
        borderColor="$border" 
        shadowColor="rgba(0,0,0,0.1)" 
        shadowRadius={12} 
        shadowOffset={{ width: 0, height: 4 }}
        marginBottom="$4"
        pressStyle={{ opacity: 0.9, scale: 0.98 }}
        hoverStyle={{ shadowRadius: 16 }}
        animation="quick"
      >
        <Text fontWeight="700" fontSize="$5" marginBottom={subtitle ? "$1" : 0} color="$color">{title}</Text>
        {subtitle ? <Text color="$muted" fontSize="$3">{subtitle}</Text> : null}
      </YStack>
    </Link>
  );
}

function ServicesCard({ service }: { service: string }){
  return (
    <Card backgroundColor="$background" borderRadius="$4" padding="$3" marginBottom="$2" borderWidth={1} borderColor="$border" hoverStyle={{ borderColor: '$brand' }}>
      <Text fontSize="$4" color="$color">{service}</Text>
    </Card>
  );
}

export default function Home(){
  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <YStack alignItems="center" marginBottom="$6" space="$3">
        <Image source={require('../assets/logo.png')} style={{ width: 80, height: 80, borderRadius: 20 }} />
        <H1 fontSize="$6" textAlign="center" color="$brand">Pather & Pather Attorneys</H1>
        <Text color="$muted" fontSize="$4" textAlign="center">Conveyancing Companion</Text>
      </YStack>
      
      <YStack marginBottom="$6">
        <H2 textAlign="center" color="$brand" marginBottom="$4" fontSize="$6">Frequently Asked Questions</H2>
        
        <Card backgroundColor="$card" borderRadius="$6" padding="$5" marginBottom="$4" borderWidth={1} borderColor="$border" shadowColor="rgba(0,0,0,0.05)" shadowRadius={8}>
          <H2 fontSize="$5" marginBottom="$3" color="$brand">What services do you provide?</H2>
          <Paragraph fontSize="$4" lineHeight="$6" color="$color">
            We specialize in property conveyancing, including transfers, mortgage bonds, sectional title schemes, and commercial property transactions throughout South Africa.
          </Paragraph>
        </Card>
        
        <Card backgroundColor="$card" borderRadius="$6" padding="$5" marginBottom="$4" borderWidth={1} borderColor="$border" shadowColor="rgba(0,0,0,0.05)" shadowRadius={8}>
          <H2 fontSize="$5" marginBottom="$3" color="$brand">Where are you located?</H2>
          <Paragraph fontSize="$4" lineHeight="$6" color="$color">
            Our dedicated office is in Umhlanga, with qualified staff and partner firms operating nationally to serve clients across South Africa.
          </Paragraph>
        </Card>
        
        <Card backgroundColor="$card" borderRadius="$6" padding="$5" marginBottom="$4" borderWidth={1} borderColor="$border" shadowColor="rgba(0,0,0,0.05)" shadowRadius={8}>
          <H2 fontSize="$5" marginBottom="$3" color="$brand">How do you ensure fast processing?</H2>
          <Paragraph fontSize="$4" lineHeight="$6" color="$color">
            We use modern technology for document transmission, daily courier services, and electronic search facilities to minimize registration delays.
          </Paragraph>
        </Card>
        
        <Card backgroundColor="$card" borderRadius="$6" padding="$5" marginBottom="$4" borderWidth={1} borderColor="$border" shadowColor="rgba(0,0,0,0.05)" shadowRadius={8}>
          <H2 fontSize="$5" marginBottom="$3" color="$brand">What types of properties do you handle?</H2>
          <YStack space="$2">
            <ServicesCard service="Residential & Commercial Properties" />
            <ServicesCard service="Agricultural Land Transactions" />
            <ServicesCard service="Sectional Title Developments" />
            <ServicesCard service="Mortgage Bonds & Financing" />
          </YStack>
        </Card>
      </YStack>
      
      <YStack space="$3">
        <H2 textAlign="center" color="$brand">Tools & Services</H2>
        <HomeCard title="Transfer Cost Calculator" subtitle="Duty + attorney + disbursements" href="/transfer" />
        <HomeCard title="Bond Cost Calculator" subtitle="Attorney + disbursements" href="/bond" />
        <HomeCard title="Bond Repayment Calculator" subtitle="Monthly & totals" href="/repayment" />
        <HomeCard title="Start My Transfer" subtitle="Send details & open WhatsApp" href="/start" />
        <HomeCard title="Legal & Disclaimer" href="/legal" />
        <HomeCard title="Create Account" subtitle="Get a profile and save calculations" href="/signup" />
        <HomeCard title="My Profile" subtitle="View saved calculations" href="/profile" />
      </YStack>
    </ScrollView>
  );
}