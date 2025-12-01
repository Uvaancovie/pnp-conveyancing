import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, ScrollView } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { BtnText, Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import theme from '../config/theme.json';
import { createLead } from '../utils/firebase';

export default function Start(){
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [suburb, setSuburb] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    console.log('Submit clicked', { fullName, phone, email });
    
    if (!fullName || !phone || !email) {
      if (Platform.OS === 'web') {
        window.alert('Please fill name, phone, and email.');
      } else {
        Alert.alert('Missing info', 'Please fill name, phone, email.');
      }
      return;
    }
    
    setLoading(true);
    try {
      await createLead({
        fullName,
        phone,
        email,
        suburb: suburb || undefined,
        price: price ? Number((price || '').replace(/\s|,/g, '')) : undefined,
      });
    } catch (err) {
      console.log('createLead error (non-blocking):', err);
    }

    const msg =
      `Hi Pather & Pather, I'm starting a transfer.\n` +
      `Name: ${fullName}\nPhone: ${phone}\nEmail: ${email}\n` +
      (suburb ? `Suburb: ${suburb}\n` : '') +
      (price ? `Price: R${price}\n` : '');
    const url = `https://wa.me/${theme.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    
    console.log('Opening WhatsApp URL:', url);
    
    // Use window.open on web, Linking on native
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      <Card title="Start My Transfer" subtitle="Fill in your details and we'll get in touch">
        <YStack gap="$3">
          <Field label="Full Name" value={fullName} onChangeText={setFullName} placeholder="John Smith" />
          <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="083 123 4567" />
          <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="email@example.com" />
          <Field label="Suburb (optional)" value={suburb} onChangeText={setSuburb} placeholder="e.g. Umhlanga" />
          <Field label="Purchase Price (optional)" value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="2 000 000" />
        </YStack>
      </Card>
      
      <YStack gap="$3">
        <Button onPress={submit} opacity={loading ? 0.7 : 1}>
          <XStack alignItems="center" gap="$2">
            <Ionicons name="logo-whatsapp" size={20} color="white" />
            <BtnText>{loading ? 'Sending...' : 'Send via WhatsApp'}</BtnText>
          </XStack>
        </Button>
        
        <Text textAlign="center" color="$muted" fontSize="$3" marginTop="$2">Need to calculate costs first?</Text>
        <XStack gap="$3" justifyContent="center">
          <Button flex={1} backgroundColor="$brand" onPress={() => router.push('/transfer')}>
            <BtnText>Transfer Costs</BtnText>
          </Button>
          <Button flex={1} backgroundColor="$brand" onPress={() => router.push('/bond')}>
            <BtnText>Bond Costs</BtnText>
          </Button>
        </XStack>
      </YStack>
    </ScrollView>
  );
}
