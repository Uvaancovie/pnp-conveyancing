import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Card, H2, Paragraph, Text, useTheme, XStack, YStack } from 'tamagui';
import { galleryImages } from '../assets/images';
import { ImageGallery } from '../components/ImageGallery';
import { QuickNavBar } from '../components/Navigation';
import { useAuth } from '../contexts/auth-context';

function NavCard({ title, subtitle, href, icon }: { title: string; subtitle?: string; href: string; icon: keyof typeof Ionicons.glyphMap }){
  const theme = useTheme();
  const brandColor = theme.brand?.val ?? '#0A5C3B';

  return (
    <Link href={href} asChild>
      <XStack 
        backgroundColor="$card" 
        borderRadius="$4" 
        padding="$4" 
        borderWidth={1} 
        borderColor="$border" 
        shadowColor="rgba(0,0,0,0.06)" 
        shadowRadius={8} 
        marginBottom="$3"
        pressStyle={{ opacity: 0.9, scale: 0.98 }}
        hoverStyle={{ borderColor: '$brand' }}
        animation="quick"
        alignItems="center"
        gap="$3"
      >
        <XStack
          width={44}
          height={44}
          borderRadius={22}
          backgroundColor="$brandLight"
          alignItems="center"
          justifyContent="center"
        >
          <Ionicons name={icon} size={22} color={brandColor} />
        </XStack>
        <YStack flex={1}>
          <Text fontWeight="700" fontSize="$4" color="$color">{title}</Text>
          {subtitle ? <Text color="$muted" fontSize="$3">{subtitle}</Text> : null}
        </YStack>
        <Ionicons name="chevron-forward" size={20} color={brandColor} />
      </XStack>
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
  const { user } = useAuth();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Welcome Header */}
        {user && (
          <YStack marginBottom="$4" paddingTop="$2">
            <Text fontSize={28} fontWeight="700" color="$brand" fontFamily="Poppins_700Bold">
              Welcome, {user.displayName || user.email?.split('@')[0] || 'User'}!
            </Text>
            <Text fontSize={16} color="$muted" marginTop="$1" fontFamily="Poppins_400Regular">
              What would you like to do today?
            </Text>
          </YStack>
        )}

        {/* Hero Section */}
        <ImageGallery 
        images={galleryImages}
        title="Pather & Pather"
        subtitle="Conveyancing Companion"
        height={340}
        autoPlayInterval={3500}
        showIndicators={true}
      />
      
      {/* Quick Actions */}
      <YStack marginBottom="$5">
        <H2 fontSize="$5" color="$brand" marginBottom="$3">Calculators</H2>
        <NavCard title="Transfer Costs" subtitle="Duty + attorney + disbursements" href="/transfer" icon="swap-horizontal" />
        <NavCard title="Bond Costs" subtitle="Attorney + disbursements" href="/bond" icon="business" />
        <NavCard title="Repayments" subtitle="Monthly payments & totals" href="/repayment" icon="calculator" />
      </YStack>
      
      {/* Start Transfer */}
      <YStack marginBottom="$5">
        <H2 fontSize="$5" color="$brand" marginBottom="$3">Get Started</H2>
        <NavCard title="Start My Transfer" subtitle="Send details via WhatsApp" href="/start" icon="rocket" />
      </YStack>
      
      {/* Account */}
      <YStack marginBottom="$5">
        <H2 fontSize="$5" color="$brand" marginBottom="$3">Account</H2>
        {!user ? (
          <>
            <NavCard title="Sign In" subtitle="Access your account" href="/login" icon="log-in" />
            <NavCard title="Create Account" subtitle="Save your calculations" href="/signup" icon="person-add" />
          </>
        ) : (
          <>
            <NavCard title="My Profile" subtitle="View saved calculations" href="/profile" icon="person-circle" />
            {user.role === 'admin' && (
              <NavCard title="Admin Dashboard" subtitle="Manage users and leads" href="/admin" icon="shield-checkmark" />
            )}
          </>
        )}
      </YStack>
      
      {/* FAQ Section */}
      <YStack marginBottom="$5">
        <H2 fontSize="$5" color="$brand" marginBottom="$3">Frequently Asked Questions</H2>

        <NavCard title="View all FAQs" subtitle="Accordion-style answers" href="/faq" icon="help-circle" />
        
        <Card backgroundColor="$card" borderRadius="$4" padding="$4" marginBottom="$3" borderWidth={1} borderColor="$border">
          <Text fontWeight="700" fontSize="$4" marginBottom="$2" color="$brand">What services do you provide?</Text>
          <Paragraph fontSize="$3" lineHeight="$5" color="$muted">
            Property conveyancing including transfers, mortgage bonds, sectional title schemes, and commercial property transactions.
          </Paragraph>
        </Card>
        
        <Card backgroundColor="$card" borderRadius="$4" padding="$4" marginBottom="$3" borderWidth={1} borderColor="$border">
          <Text fontWeight="700" fontSize="$4" marginBottom="$2" color="$brand">Where are you located?</Text>
          <Paragraph fontSize="$3" lineHeight="$5" color="$muted">
            Our office is in Umhlanga, serving clients nationally across South Africa.
          </Paragraph>
        </Card>
        
        <Card backgroundColor="$card" borderRadius="$4" padding="$4" marginBottom="$3" borderWidth={1} borderColor="$border">
          <Text fontWeight="700" fontSize="$4" marginBottom="$2" color="$brand">How do you ensure fast processing?</Text>
          <Paragraph fontSize="$3" lineHeight="$5" color="$muted">
            Modern technology, daily couriers, and electronic search facilities minimize delays.
          </Paragraph>
        </Card>
      </YStack>
      
      {/* Other Links */}
      <YStack>
        <H2 fontSize="$5" color="$brand" marginBottom="$3">More</H2>
        <NavCard title="Our Services" subtitle="Practice areas" href="/services" icon="briefcase" />
        <NavCard title="Legal & Disclaimer" href="/legal" icon="document-text" />
      </YStack>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <QuickNavBar />
    </View>
  );
}