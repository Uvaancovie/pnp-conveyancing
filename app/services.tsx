import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Paragraph, Text, XStack, YStack } from 'tamagui';
import { heroImages } from '../assets/images';
import { Card } from '../components/Card';
import { HeroImage } from '../components/HeroImage';
import { QuickNavBar } from '../components/Navigation';

type ServiceItem = {
  id: string;
  title: string;
  description: string;
};

export default function ServicesScreen() {
  const router = useRouter();
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

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
        <HeroImage
          source={heroImages.home}
          title="Our Services"
          subtitle="What we can help you with"
          height={180}
          overlayOpacity={0.55}
        />

        <Card>
          <XStack alignItems="center" justifyContent="space-between">
            <YStack flex={1} gap="$1">
              <Text fontWeight="700" fontSize="$5" color="$brand">
                Practice Areas
              </Text>
              <Paragraph color="$muted" fontSize="$3" lineHeight="$5">
                Tap a service to expand and read more.
              </Paragraph>
            </YStack>

            <TouchableOpacity
              onPress={() => router.back()}
              style={{ padding: 8, borderRadius: 999, backgroundColor: '#E8F5E9' }}
            >
              <Ionicons name="arrow-back" size={20} color="#0A5C3B" />
            </TouchableOpacity>
          </XStack>
        </Card>

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
