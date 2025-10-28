import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { calcTransferCosts } from '@/lib/duty';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/auth-context';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function TransferCalculatorScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    // Wait for loading to finish, then if no user redirect to login
    if (!loading && user === null) {
      router.push('/login' as any);
    }
  }, [user, router]);
  const [propertyValue, setPropertyValue] = useState(2000000);
  const [showExplanation, setShowExplanation] = useState(false);

  const formatCurrency = (amount: number): string => 
    `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const saveCalculation = async () => {
    if (!user || user.role !== 'agent') return;

    try {
      const calculationData = {
        id: `transfer_${Date.now()}`,
        type: 'transfer' as const,
        timestamp: new Date(),
        data: { propertyValue },
        total: transferCosts.total
      };

      await updateDoc(doc(db, 'users', user.uid), {
        calculationHistory: arrayUnion(calculationData)
      });
    } catch (error) {
      console.error('Error saving calculation:', error);
      // Don't show alert to user as this is background functionality
    }
  };

  // Save calculation when property value changes (debounced)
  React.useEffect(() => {
    if (user?.role === 'agent' && propertyValue > 0) {
      const timeoutId = setTimeout(saveCalculation, 1000); // Save after 1 second of no changes
      return () => clearTimeout(timeoutId);
    }
  }, [propertyValue, user]);

  const transferCosts = calcTransferCosts(propertyValue);

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
          <Ionicons name="calculator" size={32} color="#2C5530" />
        </View>
        <Text style={styles.header}>Transfer Cost Calculator</Text>
        <Text style={styles.subheader}>Calculate your property transfer costs</Text>
      </View>

      {/* Property Value Input */}
      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>Purchase Price</Text>
        <Text style={styles.valueDisplay}>{formatCurrency(propertyValue)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={100000}
          maximumValue={10000000}
          step={50000}
          value={propertyValue}
          onValueChange={setPropertyValue}
          minimumTrackTintColor="#2C5530"
          maximumTrackTintColor="#e0e0e0"
          thumbTintColor="#2C5530"
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>R 100k</Text>
          <Text style={styles.sliderLabel}>R 10M</Text>
        </View>
      </View>

      {/* Results Card */}
      <View style={styles.resultsCard}>
        <Text style={styles.resultsTitle}>Cost Breakdown</Text>
        
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Transfer Attorney Fees (incl. VAT)</Text>
          <Text style={styles.resultValue}>{formatCurrency(transferCosts.transferAttorneyFee)}</Text>
        </View>

        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Postages & Petties</Text>
          <Text style={styles.resultValue}>{formatCurrency(transferCosts.postagesAndPetties)}</Text>
        </View>

        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Deeds Office Fees</Text>
          <Text style={styles.resultValue}>{formatCurrency(transferCosts.deedsOfficeFees)}</Text>
        </View>

        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Electronic Generation Fee</Text>
          <Text style={styles.resultValue}>{formatCurrency(transferCosts.electronicGenerationFee)}</Text>
        </View>

        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>FICA</Text>
          <Text style={styles.resultValue}>{formatCurrency(transferCosts.fica)}</Text>
        </View>

        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Deeds Office Searches</Text>
          <Text style={styles.resultValue}>{formatCurrency(transferCosts.deedsOfficeSearches)}</Text>
        </View>

        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Rates Clearance Fees</Text>
          <Text style={styles.resultValue}>{formatCurrency(transferCosts.ratesClearanceFees)}</Text>
        </View>

        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Transfer Duty</Text>
          <Text style={styles.resultValue}>{formatCurrency(transferCosts.transferDuty)}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Transfer Costs (incl VAT)</Text>
          <Text style={styles.totalValue}>{formatCurrency(transferCosts.total)}</Text>
        </View>
      </View>

      {/* Explanation Toggle */}
      <TouchableOpacity 
        style={styles.explanationToggle}
        onPress={() => setShowExplanation(!showExplanation)}
      >
        <Ionicons name={showExplanation ? "chevron-up" : "chevron-down"} size={20} color="#2C5530" />
        <Text style={styles.explanationToggleText}>
          {showExplanation ? "Hide" : "Show"} Calculation Explanation
        </Text>
      </TouchableOpacity>

      {showExplanation && (
        <View style={styles.explanationCard}>
          <Text style={styles.explanationTitle}>How is this calculated?</Text>
          <Text style={styles.explanationText}>
            <Text style={styles.explanationBold}>Transfer Attorney Fees:</Text> Calculated at 1.4% of the purchase price (minimum R15,000) plus 15% VAT.
          </Text>
          <Text style={styles.explanationText}>
            <Text style={styles.explanationBold}>Transfer Duty:</Text> Government tax on property transfers, calculated on a sliding scale based on purchase price.
          </Text>
          <Text style={styles.explanationText}>
            <Text style={styles.explanationBold}>Deeds Office Fees:</Text> Official registration fees based on property value bands.
          </Text>
          <Text style={styles.explanationText}>
            <Text style={styles.explanationBold}>Other Fees:</Text> Fixed costs for postages, electronic generation, FICA compliance, deeds searches, and rates clearance.
          </Text>
        </View>
      )}

      <View style={styles.disclaimer}>
        <Ionicons name="information-circle" size={20} color="#856404" />
        <Text style={styles.disclaimerText}>
          These calculations are estimates only. Actual costs may vary. Please consult with a qualified conveyancer for accurate quotations.
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
  headerContainer: {
    paddingTop: 24,
    paddingBottom: 16,
    marginBottom: 8,
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
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2C5530',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e8f5e9',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5530',
    marginBottom: 12,
  },
  valueDisplay: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C5530',
    textAlign: 'center',
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#999',
  },
  resultsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e8f5e9',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C5530',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#e8f5e9',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  resultLabel: {
    fontSize: 15,
    color: '#666',
    flex: 1,
    marginRight: 16,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    marginTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#2C5530',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C5530',
    flex: 1,
    marginRight: 16,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C5530',
  },
  explanationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  explanationToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5530',
    marginLeft: 8,
  },
  explanationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e8f5e9',
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C5530',
    marginBottom: 16,
  },
  explanationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  explanationBold: {
    fontWeight: '600',
    color: '#2C5530',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 24,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: '#856404',
    lineHeight: 20,
    marginLeft: 12,
  },
});