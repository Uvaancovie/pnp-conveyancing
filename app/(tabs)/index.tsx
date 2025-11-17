import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CalculatorCard } from '@/components/calculator-card';
import { calcTransferCosts } from '@/lib/duty';
import { calcBondCosts } from '@/lib/bond';
import { monthlyRepayment } from '@/lib/repayment';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../../contexts/auth-context';
import { Linking } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [propertyValue, setPropertyValue] = useState('');
  const [bondAmount, setBondAmount] = useState('');
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [years, setYears] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const formatCurrency = (amount: number): string => 
    `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;

  const formatNumberInput = (text: string): string => {
    // Remove any non-numeric characters except decimal point
    return text.replace(/[^0-9.]/g, '');
  };

  const handlePropertyValueChange = (text: string) => {
    setPropertyValue(formatNumberInput(text));
  };

  const handleBondAmountChange = (text: string) => {
    setBondAmount(formatNumberInput(text));
  };

  const handleRepaymentAmountChange = (text: string) => {
    setRepaymentAmount(formatNumberInput(text));
  };

  const handleInterestRateChange = (text: string) => {
    setInterestRate(formatNumberInput(text));
  };

  const handleYearsChange = (text: string) => {
    setYears(formatNumberInput(text));
  };

  const transferCosts = propertyValue ? calcTransferCosts(parseFloat(propertyValue)) : null;
  const bondCosts = bondAmount ? calcBondCosts(parseFloat(bondAmount)) : null;
  const repaymentCalc = repaymentAmount && interestRate && years 
    ? monthlyRepayment(parseFloat(repaymentAmount), parseFloat(interestRate), parseFloat(years))
    : null;

  const { user } = useAuth();

  const saveCalculation = async (type: 'transfer' | 'bond' | 'repayment', payload: any) => {
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in to save calculations');
      return;
    }

    if (user.role !== 'agent') {
      Alert.alert('Agents only', 'Only registered agents can save calculation history to their profile.');
      return;
    }

    const item = {
      id: `${type}_${Date.now()}`,
      type,
      timestamp: new Date(),
      data: payload,
      total: payload.total ?? null,
    };

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        calculationHistory: arrayUnion(item)
      });
      Alert.alert('Saved', 'Calculation saved to your history');
    } catch (error) {
      console.error('Error saving calculation:', error);
      Alert.alert('Error', 'Failed to save calculation');
    }
  };

  const handleStartTransfer = async () => {
    if (!clientName || !clientPhone) {
      Alert.alert('Error', 'Please enter client name and phone number');
      return;
    }

    try {
      // Save to Firestore
      const docRef = await addDoc(collection(db, 'leads'), {
        name: clientName,
        phone: clientPhone,
        propertyValue: propertyValue || null,
        bondAmount: bondAmount || null,
        timestamp: new Date(),
      });

      // Open WhatsApp
      const message = `Hi! I'm interested in starting my property transfer. My details: Name: ${clientName}, Phone: ${clientPhone}`;
      const whatsappUrl = `whatsapp://send?phone=27123456789&text=${encodeURIComponent(message)}`;
      
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('Error', 'WhatsApp is not installed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save lead information');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Link href="/" asChild>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2C5530" />
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </Link>
      
      <View style={styles.headerContainer}>
        <View style={styles.iconBadge}>
          <Ionicons name="calculator-outline" size={32} color="#2C5530" />
        </View>
        <Text style={styles.header}>Property Calculators</Text>
        <Text style={styles.subheader}>Get instant estimates for your property costs</Text>
      </View>
      
      <CalculatorCard title="Transfer Cost Calculator">
        <Text style={styles.inputLabel}>Property Value</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter property value (e.g., 2000000)"
          placeholderTextColor="#999"
          value={propertyValue}
          onChangeText={handlePropertyValueChange}
          keyboardType="numeric"
        />
        {transferCosts && (
          <View style={styles.results}>
            <Text style={styles.resultRow}>Transfer Attorney Fees (incl. VAT): {formatCurrency(transferCosts.transferAttorneyFee)}</Text>
            <Text style={styles.resultRow}>Postages & Petties: {formatCurrency(transferCosts.postagesAndPetties)}</Text>
            <Text style={styles.resultRow}>Deeds Office Fees: {formatCurrency(transferCosts.deedsOfficeFees)}</Text>
            <Text style={styles.resultRow}>Electronic Generation Fee: {formatCurrency(transferCosts.electronicGenerationFee)}</Text>
            <Text style={styles.resultRow}>FICA: {formatCurrency(transferCosts.fica)}</Text>
            <Text style={styles.resultRow}>Deeds Office Searches: {formatCurrency(transferCosts.deedsOfficeSearches)}</Text>
            <Text style={styles.resultRow}>Rates Clearance Fees: {formatCurrency(transferCosts.ratesClearanceFees)}</Text>
            <Text style={styles.resultRow}>Transfer Duty: {formatCurrency(transferCosts.transferDuty)}</Text>
            <Text style={styles.totalRow}>Total Transfer Costs (incl. VAT): {formatCurrency(transferCosts.total)}</Text>
            {user?.role === 'agent' && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => saveCalculation('transfer', { propertyValue: parseFloat(propertyValue), ...transferCosts })}
              >
                <Text style={styles.saveButtonText}>Save Calculation</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </CalculatorCard>

      <CalculatorCard title="Bond Cost Calculator">
        <Text style={styles.inputLabel}>Bond Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter bond amount (e.g., 4000000)"
          placeholderTextColor="#999"
          value={bondAmount}
          onChangeText={handleBondAmountChange}
          keyboardType="numeric"
        />
        {bondCosts && (
          <View style={styles.results}>
            <Text style={styles.resultRow}>Bond Attorney Fee (incl. VAT): {formatCurrency(bondCosts.bondAttorneyFee)}</Text>
            <Text style={styles.resultRow}>Postages & Petties: {formatCurrency(bondCosts.postagesAndPetties)}</Text>
            <Text style={styles.resultRow}>Deeds Office Fees: {formatCurrency(bondCosts.deedsOfficeFees)}</Text>
            <Text style={styles.resultRow}>Electronic Generation Fee: {formatCurrency(bondCosts.electronicGenerationFee)}</Text>
            <Text style={styles.resultRow}>Electronic Instruction Fee: {formatCurrency(bondCosts.electronicInstructionFee)}</Text>
            <Text style={styles.resultRow}>Deeds Office Searches: {formatCurrency(bondCosts.deedsOfficeSearches)}</Text>
            <Text style={styles.totalRow}>Total Bond Costs (incl. VAT): {formatCurrency(bondCosts.total)}</Text>
            {user?.role === 'agent' && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => saveCalculation('bond', { bondAmount: parseFloat(bondAmount), ...bondCosts })}
              >
                <Text style={styles.saveButtonText}>Save Calculation</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </CalculatorCard>

      <CalculatorCard title="Bond Repayment Calculator">
        <Text style={styles.inputLabel}>Loan Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter loan amount (e.g., 6000000)"
          placeholderTextColor="#999"
          value={repaymentAmount}
          onChangeText={handleRepaymentAmountChange}
          keyboardType="numeric"
        />
        <Text style={styles.inputLabel}>Interest Rate (%)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter interest rate (e.g., 10.5)"
          placeholderTextColor="#999"
          value={interestRate}
          onChangeText={handleInterestRateChange}
          keyboardType="numeric"
        />
        <Text style={styles.inputLabel}>Loan Term (Years)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter number of years (e.g., 20)"
          placeholderTextColor="#999"
          value={years}
          onChangeText={handleYearsChange}
          keyboardType="numeric"
        />
        {repaymentCalc && (
          <View style={styles.results}>
            <Text style={styles.resultRow}>Monthly Payment: {formatCurrency(repaymentCalc.pmt)}</Text>
            <Text style={styles.resultRow}>Total Interest: {formatCurrency(repaymentCalc.interest)}</Text>
            <Text style={styles.totalRow}>Total Amount: {formatCurrency(repaymentCalc.total)}</Text>
            {user?.role === 'agent' && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => saveCalculation('repayment', { loanAmount: parseFloat(repaymentAmount), interestRate: parseFloat(interestRate), years: parseFloat(years), ...repaymentCalc })}
              >
                <Text style={styles.saveButtonText}>Save Calculation</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </CalculatorCard>

      <CalculatorCard title="Start My Transfer">
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor="#999"
          value={clientName}
          onChangeText={setClientName}
        />
        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your phone number"
          placeholderTextColor="#999"
          value={clientPhone}
          onChangeText={setClientPhone}
          keyboardType="phone-pad"
        />
        <TouchableOpacity style={styles.button} onPress={handleStartTransfer}>
          <Text style={styles.buttonText}>Start My Transfer</Text>
        </TouchableOpacity>
      </CalculatorCard>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Legal Disclaimer: These calculations are estimates only. Actual costs may vary. 
          Please consult with a qualified conveyancer for accurate quotations.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    paddingTop: 24,
    paddingBottom: 16,
    marginBottom: 8,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2C5530',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C5530',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  results: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8f5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  resultRow: {
    fontSize: 15,
    marginVertical: 6,
    color: '#333',
    paddingVertical: 4,
  },
  totalRow: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#2C5530',
    color: '#2C5530',
  },
  button: {
    backgroundColor: '#2C5530',
    padding: 18,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#2C5530',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  disclaimer: {
    marginTop: 32,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  disclaimerText: {
    fontSize: 13,
    color: '#856404',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5530',
    marginLeft: 8,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#2C5530',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#2C5530',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
