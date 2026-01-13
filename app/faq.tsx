import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Paragraph, Text, XStack, YStack } from 'tamagui';
import { heroImages } from '../assets/images';
import { Card } from '../components/Card';
import { HeroImage } from '../components/HeroImage';
import { QuickNavBar } from '../components/Navigation';

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export default function FAQScreen() {
  const router = useRouter();
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  const faqs: FaqItem[] = useMemo(
    () => [
      {
        id: 'conveyancing',
        question: 'What is conveyancing?',
        answer:
          'Conveyancing is the legal process by which ownership of immovable property is transferred from a seller to a purchaser. It includes drafting and lodging documents, ensuring compliance with statutory requirements, managing payments, and registering the transfer at the Deeds Office.',
      },
      {
        id: 'appoints-attorney',
        question: 'Who appoints the conveyancing attorney?',
        answer:
          'The seller usually appoints the transferring attorney.\n\nHowever, depending on the transaction, there may also be:\n• A bond registration attorney (appointed by the bank granting the home loan), and/or\n• A bond cancellation attorney (appointed by the seller’s bank to cancel an existing bond).',
      },
      {
        id: 'transfer-time',
        question: 'How long does a property transfer take?',
        answer:
          'On average, a transfer takes 8–12 weeks from date of sale, subject to:\n• Bond approval timelines\n• Clearance certificates (rates and levies)\n• FICA compliance\n• Signing of documents\n• Deeds Office turnaround times\n\nDelays most often arise from incomplete information or outstanding compliance items.',
      },
      {
        id: 'costs',
        question: 'What costs are involved in conveyancing?',
        answer:
          'Common costs include:\n• Transfer duty (if applicable)\n• Conveyancing (transfer) fees\n• Deeds Office fees\n• Bond registration or cancellation costs (if applicable)\n• Rates and levy clearance figures\n\nA detailed cost estimate is usually provided upfront.',
      },
      {
        id: 'transfer-duty',
        question: 'What is transfer duty?',
        answer:
          'Transfer duty is a tax payable to SARS on property purchases above the applicable threshold, unless the transaction is VAT-rated.\n\nIt must be paid before transfer can be lodged.',
      },
      {
        id: 'documents',
        question: 'What documents will I need to provide?',
        answer:
          'Typical requirements include:\n• Certified copy of ID or passport\n• Proof of address (not older than 3 months)\n• Proof of marital status (and ANC, if applicable)\n• Income tax number\n• FICA declarations and supporting documents\n\nAdditional documents may be required depending on the transaction.',
      },
      {
        id: 'fica',
        question: 'What is FICA and why is it required?',
        answer:
          'FICA (Financial Intelligence Centre Act) requires attorneys to verify the identity and address of clients to prevent fraud, money laundering, and financial crime.\n\nTransfer cannot proceed without full FICA compliance.',
      },
      {
        id: 'sign-docs',
        question: 'When do I sign the transfer documents?',
        answer:
          'Transfer documents are usually signed early in the process, once draft documents are prepared.\n\nThese are signed at the conveyancer’s offices (or remotely, where permitted).',
      },
    ],
    []
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <HeroImage
          source={heroImages.info}
          title="FAQs"
          subtitle="Frequently Asked Questions"
          height={180}
          overlayOpacity={0.55}
        />

        <Card>
          <XStack alignItems="center" justifyContent="space-between">
            <YStack flex={1} gap="$1">
              <Text fontWeight="700" fontSize="$5" color="$brand">
                Conveyancing Explained
              </Text>
              <Paragraph color="$muted" fontSize="$3" lineHeight="$5">
                Tap a question to expand and read the answer.
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
          {faqs.map((item) => {
            const open = !!openIds[item.id];
            return (
              <Card key={item.id}>
                <TouchableOpacity
                  onPress={() => setOpenIds((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                  style={{ width: '100%' }}
                >
                  <XStack alignItems="center" justifyContent="space-between" gap="$3">
                    <Text fontWeight="700" fontSize="$4" color="$color" flex={1}>
                      {item.question}
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
                      {item.answer}
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
