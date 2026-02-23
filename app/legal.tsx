import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { Paragraph, Text, XStack, YStack } from 'tamagui';
import { BtnText, Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { QuickNavBar } from '../components/Navigation';
import theme from '../config/theme.json';

export default function Legal(){
  const { width: windowWidth } = useWindowDimensions();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [legalIssue, setLegalIssue] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fullName || !email || !contactNumber) {
      if (Platform.OS === 'web') {
        window.alert('Please fill in Name, Email, and Contact Number.');
      } else {
        Alert.alert('Missing Information', 'Please fill in Name, Email, and Contact Number.');
      }
      return;
    }
    setLoading(true);
    const msg =
      `New Legal Enquiry\n\n` +
      `Name: ${fullName}\n` +
      `Email: ${email}\n` +
      `Contact: ${contactNumber}\n` +
      (legalIssue ? `Legal Issue: ${legalIssue}\n` : '') +
      (referralSource ? `Heard From: ${referralSource}\n` : '') +
      (description ? `\nDescription:\n${description}` : '');
    const url = `https://wa.me/${theme.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
    setLoading(false);
  };

  const openLink = (url: string) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

        {/* Hero Banner */}
        <View style={{
          height: windowWidth < 480 ? 200 : 230,
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 20,
          shadowColor: 'rgba(0,0,0,0.15)',
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 3,
        }}>
          <Image
            source={require('../assets/images/signing/siging.jpg')}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            contentFit="cover"
            contentPosition="center"
          />
          <LinearGradient
            colors={['rgba(30,30,30,0)', 'rgba(30,30,30,0.4)', 'rgba(30,30,30,0.82)']}
            locations={[0, 0.5, 1]}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          />
          <YStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            padding="$4"
            gap="$1"
          >
            <YStack
              alignSelf="flex-start"
              backgroundColor="rgba(255,255,255,0.15)"
              borderColor="rgba(255,255,255,0.25)"
              borderWidth={1}
              paddingHorizontal={10}
              paddingVertical={5}
              borderRadius={999}
              marginBottom="$1"
            >
              <Text color="white" fontSize={13} fontWeight="700" letterSpacing={0.5}>Legal & Disclaimer</Text>
            </YStack>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#fff' }}>Contact Our Team</Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>
              Send us an enquiry and we'll get back to you
            </Text>
          </YStack>
        </View>

        {/* Disclaimer */}
        <Card>
          <XStack gap="$3" alignItems="flex-start">
            <YStack
              width={36}
              height={36}
              borderRadius={18}
              backgroundColor="$brandLight"
              alignItems="center"
              justifyContent="center"
              marginTop={2}
            >
              <Ionicons name="information-circle" size={20} color="#0A5C3B" />
            </YStack>
            <YStack flex={1} gap="$1">
              <Text fontWeight="700" fontSize="$3" color="#034c21">Disclaimer</Text>
              <Paragraph color="$muted" lineHeight="$5" fontSize={14}>
                {theme.disclaimer}
              </Paragraph>
            </YStack>
          </XStack>
        </Card>

        {/* Enquiry Form */}
        <YStack marginBottom="$2" marginTop="$1">
          <Text fontSize="$5" fontWeight="600" color="#034c21" marginBottom="$3">Send an Enquiry</Text>
          <Card>
            <YStack gap="$4">
              <XStack gap="$3">
                <YStack flex={1}>
                  <Field
                    label="Name & Surname"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="John Smith"
                  />
                </YStack>
              </XStack>
              <Field
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="email@example.com"
              />
              <Field
                label="Contact Number"
                value={contactNumber}
                onChangeText={setContactNumber}
                keyboardType="phone-pad"
                placeholder="083 123 4567"
              />
              <Field
                label="Legal Issue"
                value={legalIssue}
                onChangeText={setLegalIssue}
                placeholder="e.g. Property Transfer, Litigation…"
              />
              <Field
                label="How did you hear about us?"
                value={referralSource}
                onChangeText={setReferralSource}
                placeholder="e.g. Google, Referral, Social Media"
              />
              <YStack gap="$1">
                <Text color="$color" fontWeight="600" fontSize="$4">Description of your Matter</Text>
                <Field
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Briefly describe your legal matter…"
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  style={{ minHeight: 110 }}
                />
              </YStack>

              <Button onPress={handleSubmit} opacity={loading ? 0.7 : 1}>
                <XStack alignItems="center" gap="$2" justifyContent="center">
                  <Ionicons name="logo-whatsapp" size={20} color="white" />
                  <BtnText>{loading ? 'Sending…' : 'Send via WhatsApp'}</BtnText>
                </XStack>
              </Button>
            </YStack>
          </Card>
        </YStack>

        {/* Contact Info */}
        <YStack marginTop="$1">
          <Text fontSize="$5" fontWeight="600" color="#034c21" marginBottom="$3">Contact Information</Text>
          <Card>
            <YStack gap="$1" marginBottom="$3">
              <Text fontWeight="700" color="#034c21" fontSize="$4">Pather & Pather Attorneys</Text>
              <Text color="$muted" fontSize={14}>3 Nollsworth Crescent, La Lucia</Text>
              <Text color="$muted" fontSize={14}>Umhlanga</Text>
            </YStack>

            {/* Tappable contact rows */}
            {[
              { icon: 'call-outline' as const, label: '031 304 4212', url: 'tel:+27313044212' },
              { icon: 'mail-outline' as const, label: 'mail@patherandpather.co.za', url: 'mailto:mail@patherandpather.co.za' },
              { icon: 'globe-outline' as const, label: 'www.patherandpather.co.za', url: 'https://www.patherandpather.co.za' },
            ].map((item) => (
              <Pressable key={item.label} onPress={() => openLink(item.url)}>
                <XStack
                  alignItems="center"
                  gap="$3"
                  paddingVertical="$3"
                  borderTopWidth={1}
                  borderTopColor="$border"
                >
                  <YStack
                    width={36}
                    height={36}
                    borderRadius={18}
                    backgroundColor="$brandLight"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Ionicons name={item.icon} size={18} color="#0A5C3B" />
                  </YStack>
                  <Text color="$brand" fontSize={14} fontWeight="600" flex={1}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </XStack>
              </Pressable>
            ))}
          </Card>
        </YStack>

      </ScrollView>
      <QuickNavBar />
    </View>
  );
}