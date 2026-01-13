import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Paragraph, Text, XStack, YStack } from 'tamagui';
import { Card } from '../components/Card';
import { QuickNavBar } from '../components/Navigation';

type ServiceItem = {
  id: string;
  title: string;
  description: string;
};

export default function ServicesScreen() {
  const router = useRouter();
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});
  const { width: windowWidth } = useWindowDimensions();

  const services: ServiceItem[] = useMemo(
    () => [
      {
        id: 'litigation',
        title: 'Litigation',
        description:
          'Representation and support in civil and commercial court processes, including applications, motion proceedings, and trial preparation.',
      },
      {
        id: 'dispute-resolution',
        title: 'Dispute Resolution',
        description:
          'Practical resolution strategies including negotiation, settlement facilitation, mediation support, and dispute management to reduce delays and costs.',
      },
      {
        id: 'wills-estates-trusts',
        title: 'Wills, Estates, Trusts & Planning',
        description:
          'Drafting and reviewing wills, estate planning support, trust-related assistance, and guidance for orderly administration and succession planning.',
      },
      {
        id: 'insurance-law',
        title: 'Insurance Law',
        description:
          'Assistance with insurance-related disputes and claims processes, including policy interpretation support and dispute handling.',
      },
      {
        id: 'insolvency-business-rescue',
        title: 'Insolvency & Business Rescue',
        description:
          'Support for distressed businesses, restructuring processes, creditor/debtor engagements, and formal insolvency-related matters.',
      },
      {
        id: 'corporate-commercial',
        title: 'Corporate & Commercial',
        description:
          'Commercial agreements and business support including drafting/reviewing contracts, compliance-oriented advice, and transactional assistance.',
      },
      {
        id: 'admin-public-admin',
        title: 'Administrative & Public Administration',
        description:
          'Support on administrative law issues including procedural fairness, decision reviews, and engagements with public bodies where applicable.',
      },
      {
        id: 'notaries',
        title: 'Notaries',
        description:
          'Notarial services including preparation and execution of notarial documents and certifications where required.',
      },
      {
        id: 'property-law',
        title: 'Property Law',
        description:
          'Property-related legal support including transactions, ownership/rights queries, drafting assistance, and dispute guidance.',
      },
      {
        id: 'labour-law',
        title: 'Labour Law',
        description:
          'Employment-related support including workplace disputes, disciplinary processes, policy guidance, and labour dispute handling.',
      },
      {
        id: 'family-law',
        title: 'Family Law',
        description:
          'Sensitive guidance for family-related matters including divorce-related support, parental responsibilities, maintenance, and agreements.',
      },
      {
        id: 'personal-injury',
        title: 'Personal Injury',
        description:
          'Support for personal injury matters including claim guidance, document preparation support, and dispute handling where required.',
      },
      {
        id: 'debt-recovery',
        title: 'Debt Recovery',
        description:
          'Assistance with structured debt recovery processes including letters of demand, payment arrangements, and escalation where appropriate.',
      },
    ],
    []
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View
          style={{
            height: windowWidth < 480 ? 220 : 240,
            borderRadius: 16,
            overflow: 'hidden',
            justifyContent: 'flex-end',
            marginBottom: 16,
            shadowColor: 'rgba(0,0,0,0.15)',
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 3,
          }}
        >
          <Image
            source={require('../assets/images/services/services-banner.jpg')}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            contentFit="cover"
            contentPosition="center"
          />

          {/* Bottom-only gradient so the image stays clear (same style as FAQ banner) */}
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.14)', 'rgba(0,0,0,0.45)']}
            locations={[0, 0.55, 1]}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            pointerEvents="none"
          />

          {/* PnP logo bottom-left */}
          <Image
            source={require('../assets/images/dashboard-banner-logo/dashboard-logo-banner.png')}
            style={{ position: 'absolute', left: 12, bottom: 12, width: 90, height: 34 }}
            contentFit="contain"
            contentPosition="left"
          />

          <YStack paddingHorizontal={14} paddingBottom={14} gap="$2">
            <YStack
              alignSelf="flex-start"
              backgroundColor="rgba(255,255,255,0.18)"
              borderColor="rgba(255,255,255,0.22)"
              borderWidth={1}
              paddingHorizontal={10}
              paddingVertical={6}
              borderRadius={999}
            >
              <Text color="#FFFFFF" fontSize={12} fontWeight="700">
                Our Services
              </Text>
            </YStack>

            <Text
              style={{
                fontSize: 22,
                fontWeight: '800',
                color: '#FFFFFF',
                textShadowColor: 'rgba(0,0,0,0.35)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 6,
              }}
            >
             
            </Text>

            <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.92)' }}>
              
            </Text>
          </YStack>
        </View>

        <YStack gap="$3">
          {services.map((item) => {
            const open = !!openIds[item.id];
            return (
              <Card key={item.id}>
                <TouchableOpacity
                  onPress={() => setOpenIds((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                  style={{ width: '100%' }}
                >
                  <XStack alignItems="center" justifyContent="space-between" gap="$3">
                    <Text fontWeight="700" fontSize="$4" color="$color" flex={1}>
                      {item.title}
                    </Text>
                    <Ionicons
                      name={open ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#0A5C3B"
                    />
                  </XStack>
                </TouchableOpacity>

                {open ? (
                  <YStack marginTop="$3">
                    <Paragraph color="$muted" fontSize="$3" lineHeight="$6">
                      {item.description}
                    </Paragraph>
                  </YStack>
                ) : null}
              </Card>
            );
          })}
        </YStack>
      </ScrollView>

      <QuickNavBar />
    </View>
  );
}
