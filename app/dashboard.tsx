import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Image, ScrollView, useWindowDimensions, View } from 'react-native';
import { Card, H2, Paragraph, Text, useTheme, XStack, YStack } from 'tamagui';
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
          <Text fontWeight="400" fontSize="$4" color="$color">{title}</Text>
          {subtitle ? <Text color="$muted" fontSize="$3">{subtitle}</Text> : null}
        </YStack>
        <Ionicons name="chevron-forward" size={20} color={brandColor} />
      </XStack>
    </Link>
  );
}

export default function Home(){
  const { user } = useAuth();
  const { width: windowWidth } = useWindowDimensions();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <View style={{ marginLeft: -20, marginRight: -20, position: 'relative' }}>
          <Image
            source={require('../assets/images/dashboard-banner-logo/dashboard-banner.jpg')}
            style={{ width: '100%', height: 340, resizeMode: 'cover' }}
          />

          {/* Small watermark logo bottom-right */}
          <View pointerEvents="none" style={{ position: 'absolute', right: 16, bottom: 16 }}>
            <Image
              source={require('../assets/images/dashboard-banner-logo/dashboard-logo-banner.png')}
              style={{
                width: 72,
                height: 36,
                opacity: 0.9,
                resizeMode: 'contain',
              }}
            />
          </View>
        </View>

      {/* Welcome Header */}
      {user && (
        <YStack marginTop="$4" marginBottom="$4" paddingTop="$2">
        <Text fontSize={28} fontWeight="400" color="#034c21">
          Welcome, {user.displayName || user.email?.split('@')[0] || 'User'}!
        </Text>
        </YStack>
      )}
      {/* Quick Actions */}
      <YStack marginBottom="$5">
        <H2 fontSize="$5" fontWeight="300" color="#034c21" marginBottom="$3">Calculators</H2>

        {(() => {
          const cardWidth = windowWidth < 480 ? '48%' : windowWidth < 768 ? '32%' : '30%';
          const cardHeight = windowWidth < 480 ? 100 : 120;
          const iconSize = windowWidth < 480 ? 22 : 28;
          const textSize = windowWidth < 480 ? 13 : 16;

          return (
        <XStack gap="$2" flexWrap="wrap" justifyContent="flex-start">
          <Link href="/start" asChild>
            <Card
          backgroundColor="$card"
          borderRadius="$4"
          padding="$3"
          width={cardWidth}
          height={cardHeight}
          alignItems="center"
          justifyContent="center"
          borderWidth={1}
          borderColor="$border"
          hoverStyle={{ borderColor: '$brand' }}
            >
          <Ionicons name="rocket" size={iconSize} color="#034c21" />
          <Text fontSize={textSize} color="$color" marginTop="$2" textAlign="center">Start My Transfer</Text>
            </Card>
          </Link>

          <Link href="/transfer" asChild>
            <Card
          backgroundColor="$card"
          borderRadius="$4"
          padding="$3"
          width={cardWidth}
          height={cardHeight}
          alignItems="center"
          justifyContent="center"
          borderWidth={1}
          borderColor="$border"
          hoverStyle={{ borderColor: '$brand' }}
            >
          <Ionicons name="swap-horizontal" size={iconSize} color="#034c21" />
          <Text fontSize={textSize} color="$color" marginTop="$2" textAlign="center">Transfer Costs</Text>
            </Card>
          </Link>

          <Link href="/bond" asChild>
            <Card
          backgroundColor="$card"
          borderRadius="$4"
          padding="$3"
          width={cardWidth}
          height={cardHeight}
          alignItems="center"
          justifyContent="center"
          borderWidth={1}
          borderColor="$border"
          hoverStyle={{ borderColor: '$brand' }}
            >
          <Ionicons name="business" size={iconSize} color="#034c21" />
          <Text fontSize={textSize} color="$color" marginTop="$2" textAlign="center">Bond Costs</Text>
            </Card>
          </Link>

          <Link href="/repayment" asChild>
            <Card
          backgroundColor="$card"
          borderRadius="$4"
          padding="$3"
          width={cardWidth}
          height={cardHeight}
          alignItems="center"
          justifyContent="center"
          borderWidth={1}
          borderColor="$border"
          hoverStyle={{ borderColor: '$brand' }}
            >
          <Ionicons name="calculator" size={iconSize} color="#034c21" />
          <Text fontSize={textSize} color="$color" marginTop="$2" textAlign="center">Repayments</Text>
            </Card>
          </Link>
        </XStack>
          );
        })()}
      </YStack>
      
      {/* Account */}
      <YStack marginBottom="$5">
        <H2 fontSize="$5" fontWeight="300" color="#034c21" marginBottom="$3">Account</H2>
        {!user ? (
          <>
            <NavCard title="Sign In" subtitle="Access your account" href="/login" icon="log-in" />
            <NavCard title="Create Account" subtitle="Save your calculations" href="/signup" icon="person-add" />
          </>
        ) : (
          <>
            <NavCard title="My Profile" subtitle="Account details & security" href="/profile" icon="person-circle" />
            <NavCard title="Saved Calculations" subtitle="Filter by date, amount, type" href="/calculations" icon="calculator" />
            {user.role === 'admin' && (
              <NavCard title="Admin Dashboard" subtitle="Manage users and leads" href="/admin" icon="shield-checkmark" />
            )}
          </>
        )}
      </YStack>
      
      {/* FAQ Section */}
      <YStack marginBottom="$5">
        <H2 fontSize="$5" fontWeight="400" color="#034c21" marginBottom="$3">Frequently Asked Questions</H2>

        <NavCard title="View all FAQs" subtitle="Accordion-style answers" href="/faq" icon="help-circle" />
        
        <Card backgroundColor="$card" borderRadius="$4" padding="$4" marginBottom="$3" borderWidth={1} borderColor="$border">
          <Text fontWeight="400" fontSize="$4" marginBottom="$2" color="#034c21">What services do you provide?</Text>
          <Paragraph fontSize="$3" lineHeight="$5" color="$muted">
            Property conveyancing including transfers, mortgage bonds, sectional title schemes, and commercial property transactions.
          </Paragraph>
        </Card>
        
        <Card backgroundColor="$card" borderRadius="$4" padding="$4" marginBottom="$3" borderWidth={1} borderColor="$border">
          <Text fontWeight="400" fontSize="$4" marginBottom="$2" color="#034c21">Where are you located?</Text>
          <Paragraph fontSize="$3" lineHeight="$5" color="$muted">
            Our office is in Umhlanga, serving clients nationally across South Africa.
          </Paragraph>
        </Card>
        
        <Card backgroundColor="$card" borderRadius="$4" padding="$4" marginBottom="$3" borderWidth={1} borderColor="$border">
          <Text fontWeight="400" fontSize="$4" marginBottom="$2" color="#034c21">How do you ensure fast processing?</Text>
          <Paragraph fontSize="$3" lineHeight="$5" color="$muted">
            Modern technology, daily couriers, and electronic search facilities minimize delays.
          </Paragraph>
        </Card>
      </YStack>
      
      {/* Other Links */}
      <YStack>
        <H2 fontSize="$5" fontWeight="300" color="#034c21" marginBottom="$3">More</H2>
        <NavCard title="Our Services" subtitle="Practice areas" href="/services" icon="briefcase" />
        <NavCard title="Legal & Disclaimer" href="/legal" icon="document-text" />
      </YStack>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <QuickNavBar />
    </View>
  );
}