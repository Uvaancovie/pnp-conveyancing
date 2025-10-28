import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { monthlyRepayment } from '@/lib/repayment';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/auth-context';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';

const YEARS_OPTIONS = [5, 10, 15, 20, 25, 30];

export default function RepaymentCalculatorScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && user === null) {
      router.push('/login' as any);
    }
  }, [user, loading, router]);
  const [loanAmount, setLoanAmount] = useState(4000000);
  const [interestRate, setInterestRate] = useState(10.5);
  const [yearsIndex, setYearsIndex] = useState(3); // 20 years
  const [showExplanation, setShowExplanation] = useState(false);

  const formatCurrency = (amount: number): string => 
    `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const saveCalculation = async () => {
    if (!user || user.role !== 'agent') return;

    try {
      const calculationData = {
        id: `repayment_${Date.now()}`,
        type: 'repayment' as const,
        timestamp: new Date(),
        data: { loanAmount, interestRate, years },
        total: repayment.total
      };

      await updateDoc(doc(db, 'users', user.uid), {
        calculationHistory: arrayUnion(calculationData)
      });
    } catch (error) {
      console.error('Error saving calculation:', error);
    }
  };

  // Save calculation when inputs change (debounced)
  React.useEffect(() => {
    if (user?.role === 'agent' && loanAmount > 0) {
      const timeoutId = setTimeout(saveCalculation, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [loanAmount, interestRate, yearsIndex, user]);

  const years = YEARS_OPTIONS[yearsIndex];
  const repayment = monthlyRepayment(loanAmount, interestRate, years);

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
          <Ionicons name="trending-up" size={32} color="#2C5530" />
        </View>
        <Text style={styles.header}>Bond Repayment Calculator</Text>
        <Text style={styles.subheader}>Calculate your monthly bond repayments</Text>
      </View>

      {/* Bond Amount Input */}
      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>Bond Amount</Text>
        <Text style={styles.valueDisplay}>{formatCurrency(loanAmount)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={100000}
          maximumValue={10000000}
          step={50000}
          value={loanAmount}
          onValueChange={setLoanAmount}
          minimumTrackTintColor="#2C5530"
          maximumTrackTintColor="#e0e0e0"
          thumbTintColor="#2C5530"
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>R 100k</Text>
          <Text style={styles.sliderLabel}>R 10M</Text>
        </View>
      </View>

      {/* Years Selector */}
      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>Years To Repay</Text>
        <View style={styles.yearsSelector}>
          {YEARS_OPTIONS.map((yearOption, index) => (
            <TouchableOpacity
              key={yearOption}
              style={[
                styles.yearButton,
                yearsIndex === index && styles.yearButtonActive
              ]}
              onPress={() => setYearsIndex(index)}
            >
              <Text style={[
                styles.yearButtonText,
                yearsIndex === index && styles.yearButtonTextActive
              ]}>
                {yearOption}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Interest Rate Input */}
      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>Interest Rate</Text>
        <Text style={styles.valueDisplay}>{interestRate.toFixed(2)}%</Text>
        <Slider
          style={styles.slider}
          minimumValue={5}
          maximumValue={15}
          step={0.1}
          value={interestRate}
          onValueChange={setInterestRate}
          minimumTrackTintColor="#2C5530"
          maximumTrackTintColor="#e0e0e0"
          thumbTintColor="#2C5530"
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>5%</Text>
          <Text style={styles.sliderLabel}>15%</Text>
        </View>
      </View>

      {/* Results Card */}
      <View style={styles.resultsCard}>
        <Text style={styles.resultsTitle}>Repayment Breakdown</Text>
        
        <View style={styles.highlightRow}>
          <View style={styles.highlightContent}>
            <Text style={styles.highlightLabel}>Total Monthly Cost</Text>
            <Text style={styles.highlightValue}>{formatCurrency(repayment.pmt)}</Text>
          </View>
        </View>

        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Interest Repayment</Text>
          <Text style={styles.resultValue}>{formatCurrency(repayment.interest)}</Text>
        </View>

        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Principal Amount</Text>
          <Text style={styles.resultValue}>{formatCurrency(loanAmount)}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Loan Repayment</Text>
          <Text style={styles.totalValue}>{formatCurrency(repayment.total)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            Over {years} years, you'll pay {formatCurrency(repayment.interest)} in interest
          </Text>
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
            <Text style={styles.explanationBold}>Monthly Payment:</Text> Calculated using the standard amortization formula that considers your loan amount, interest rate, and loan term. This is the fixed amount you'll pay each month.
          </Text>
          <Text style={styles.explanationText}>
            <Text style={styles.explanationBold}>Total Interest:</Text> The sum of all interest payments you'll make over the life of the loan. This is calculated by multiplying your monthly payment by the number of months and subtracting the principal.
          </Text>
          <Text style={styles.explanationText}>
            <Text style={styles.explanationBold}>Total Repayment:</Text> Your monthly payment × number of months. This includes both the principal amount you borrowed and all the interest you'll pay.
          </Text>
          <Text style={styles.explanationText}>
            <Text style={styles.explanationBold}>Tip:</Text> The longer your loan term, the more interest you'll pay overall, but your monthly payments will be lower. Shorter terms mean higher monthly payments but less total interest.
          </Text>
        </View>
      )}

      <View style={styles.disclaimer}>
        <Ionicons name="information-circle" size={20} color="#856404" />
        <Text style={styles.disclaimerText}>
          These calculations are estimates only and don't include insurance or other additional costs. Actual payments may vary. Please consult with your bank for accurate quotations.
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
    marginVertical: 12,
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
  yearsSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  yearButton: {
    flex: 1,
    minWidth: 60,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  yearButtonActive: {
    backgroundColor: '#e8f5e9',
    borderColor: '#2C5530',
  },
  yearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  yearButtonTextActive: {
    color: '#2C5530',
  },
  resultsCard: {
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
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C5530',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#e8f5e9',
  },
  highlightRow: {
    backgroundColor: '#2C5530',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  highlightContent: {
    alignItems: 'center',
  },
  highlightLabel: {
    fontSize: 14,
    color: '#e8f5e9',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  highlightValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    lineHeight: 18,
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