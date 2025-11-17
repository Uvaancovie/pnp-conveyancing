import { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { Button, BtnText } from '../components/Button';
import * as Linking from 'expo-linking';
import theme from '../config/theme.json';
import { createLead } from '../utils/firebase'; // <— here

export default function Start(){
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [suburb, setSuburb] = useState('');
  const [price, setPrice] = useState('');

  const submit = async () => {
    if (!fullName || !phone || !email) {
      return Alert.alert('Missing info', 'Please fill name, phone, email.');
    }
    // 1) Firestore write (best-effort; app still continues if it fails)
    try {
      await createLead({
        fullName,
        phone,
        email,
        suburb: suburb || undefined,
        price: price ? Number((price || '').replace(/\s|,/g, '')) : undefined,
      });
    } catch {}

    // 2) WhatsApp handoff (works on web + native)
    const msg =
      `Hi Pather & Pather, I'm starting a transfer.\n` +
      `Name: ${fullName}\nPhone: ${phone}\nEmail: ${email}\n` +
      (suburb ? `Suburb: ${suburb}\n` : '') +
      (price ? `Price: R${price}\n` : '');
    const url = `https://wa.me/${theme.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Card title="Start My Transfer">
        <Field label="Full Name" value={fullName} onChangeText={setFullName} />
        <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Field label="Suburb" value={suburb} onChangeText={setSuburb} />
        <Field label="Purchase Price (R)" value={price} onChangeText={setPrice} keyboardType="numeric" />
      </Card>
      <Button onPress={submit}><BtnText>Send via WhatsApp</BtnText></Button>
    </ScrollView>
  );
}
