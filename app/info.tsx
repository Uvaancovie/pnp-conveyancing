import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const faqs = [
  {
    question: 'What is Conveyancing?',
    answer:
      'Conveyancing is the legal process of transferring ownership of a property from one person to another. A conveyancer is a specialized lawyer who manages this process, ensuring all legal requirements are met.'
  },
  {
    question: 'What are the main steps in the property transfer process?',
    answer:
      'The process typically includes: signing the Offer to Purchase, bond application and approval, appointing conveyancing attorneys, conducting searches, obtaining clearance certificates (rates, taxes), lodging documents at the Deeds Office, and registration of the property in the new owner\'s name.'
  },
  {
    question: 'What is Transfer Duty?',
    answer:
      'Transfer Duty is a tax levied by the government (SARS) on the value of a property when ownership is transferred. The amount is calculated on a sliding scale based on the property\'s value.'
  },
  {
    question: 'What are Bond Registration Costs?',
    answer:
      'If you are taking out a home loan (bond) to purchase a property, there are separate legal costs to register the bond at the Deeds Office. This is handled by a bond attorney and is separate from the property transfer costs.'
  },
  {
    question: 'Who appoints the conveyancing attorney?',
    answer:
      'The seller usually has the right to appoint the conveyancing attorney, although the purchaser typically pays for their services.'
  }
];

export default function InfoScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2C5530" />
        </TouchableOpacity>
        <Ionicons name="information-circle-outline" size={40} color="#2C5530" />
        <Text style={styles.title}>Conveyancing Explained</Text>
        <Text style={styles.subtitle}>Frequently Asked Questions</Text>
      </View>

      <View style={styles.faqList}>
        {faqs.map((item, i) => (
          <View key={i} style={styles.faqItem}>
            <Text style={styles.question}>{item.question}</Text>
            <Text style={styles.answer}>{item.answer}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 24, paddingBottom: 40 },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 8,
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C5530',
    marginTop: 8,
  },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  faqList: { marginTop: 12 },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  question: { fontSize: 16, fontWeight: '700', color: '#2C5530', marginBottom: 8 },
  answer: { fontSize: 14, color: '#555', lineHeight: 20 }
});
