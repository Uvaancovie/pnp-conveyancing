import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, useWindowDimensions } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { heroImages } from '../assets/images';
import { AmountField } from '../components/AmountField';
import { BtnText, Button } from '../components/Button';
import { CalculatorActions, CalculatorLayout } from '../components/CalculatorLayout';
import { Card } from '../components/Card';
import { ConfirmActionModal } from '../components/ConfirmActionModal';
import { ResultRow } from '../components/ResultRow';
import { SaveCalculationModal } from '../components/SaveCalculationModal';
import { Segmented } from '../components/Segmented';
import { useAuth } from '../contexts/auth-context';
import { formatZAR } from '../lib/money';
import { monthlyRepayment } from '../lib/repayment';
import { saveCalculation } from '../utils/firebase';
import { generateAndSavePDF, generateAndSharePDF } from '../utils/pdf-generator';

const YEARS = [5, 10, 20, 25, 30];
const PRESET_AMOUNTS = [2000000, 4000000, 6000000, 8000000, 12000000];

export default function Repayment(){
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  
  const [amount, setAmount] = useState('6000000');
  const [rate, setRate] = useState('10.5');
  const [years, setYears] = useState<number>(20);
  const [modalVisible, setModalVisible] = useState(false);
  const [savedPromptVisible, setSavedPromptVisible] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [rateError, setRateError] = useState('');
  
  const a = Number((amount||'').replace(/\s|,|R/g, '')) || 0;
  const r = Number((rate||'').replace(',', '.')) || 0;

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const num = Number(value.replace(/\s|,|R/g, ''));
    if (num < 0) {
      setAmountError('Amount must be positive');
    } else if (num > 100000000) {
      setAmountError('Amount seems unusually high');
    } else {
      setAmountError('');
    }
  };

  const handleRateChange = (value: string) => {
    setRate(value);
    const num = Number(value.replace(',', '.'));
    if (num < 0) {
      setRateError('Rate must be positive');
    } else if (num > 30) {
      setRateError('Rate seems unusually high');
    } else {
      setRateError('');
    }
  };

  const { pmt, total, interest } = monthlyRepayment(a, r, years);

  const canSave = !!user && (user.role === 'customer' || user.role === 'agent');

  const handleSave = async (name: string) => {
    try {
      let pdfUrl;
      // Only generate PDF on native platforms to avoid print dialog on web
      if (user && Platform.OS !== 'web') {
        try {
          pdfUrl = await generateAndSavePDF(
            'Bond Repayment Calculation',
            { bondAmount: a, interestRate: r + '%', term: years + ' years' },
            {
              totalInterest: interest,
              totalLoanRepayment: total,
              monthlyRepayment: pmt
            },
            user.uid
          );
        } catch (e) {
          console.warn("Failed to generate/save PDF:", e);
        }
      }

      const payload: any = { 
        type: 'repayment', 
        inputs: { principal: a, rate: r, years }, 
        result: { pmt, total, interest },
        name
      };
      if (pdfUrl) payload.pdfUrl = pdfUrl;

      await saveCalculation(payload);
      setSavedPromptVisible(true);
    } catch (err: any) { 
      console.error(err);
      if (err.message === 'not-signed-in') {
        router.push('/register');
      } else if (err.code === 'permission-denied') {
        Alert.alert('Permission Error', 'Your security rules are blocking this action. Please check Firebase Console.');
      } else {
        Alert.alert('Error', 'Failed to save calculation: ' + err.message);
      }
    }
  };

  const handleExport = async () => {
    try {
      await generateAndSharePDF(
        'Bond Repayment Calculation',
        { bondAmount: a, interestRate: r + '%', term: years + ' years' },
        {
          totalInterest: interest,
          totalLoanRepayment: total,
          monthlyRepayment: pmt
        }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  return (
    <CalculatorLayout
      heroImage={heroImages.repayment}
      title="Repayments"
      subtitle="Calculate monthly payments & totals"
      relatedCalculators={
        <XStack gap="$3" justifyContent="center" flexWrap="wrap">
          <Button flex={isMobile ? undefined : 1} minWidth={isMobile ? 140 : undefined} backgroundColor="$brand" onPress={() => router.push('/transfer')}>
            <BtnText>Transfer Costs</BtnText>
          </Button>
          <Button flex={isMobile ? undefined : 1} minWidth={isMobile ? 140 : undefined} backgroundColor="$brand" onPress={() => router.push('/bond')}>
            <BtnText>Bond Costs</BtnText>
          </Button>
        </XStack>
      }
    >
      <Card>
        <YStack gap="$3">
          <AmountField 
            label="Bond Amount" 
            keyboardType="numeric" 
            value={amount} 
            onChangeText={handleAmountChange}
            placeholder="6 000 000"
            helpText="Enter your bond/loan amount"
            presets={PRESET_AMOUNTS}
            error={amountError}
          />
          <AmountField 
            label="Interest Rate" 
            keyboardType="numeric" 
            value={rate} 
            onChangeText={handleRateChange}
            placeholder="10.5"
            helpText="Enter the annual interest rate"
            suffix="%"
            maxLength={5}
            error={rateError}
          />
          <YStack gap="$1.5">
            <Text color="$color" fontWeight="600" fontSize="$4">Loan Term</Text>
            <Segmented options={YEARS} value={years} onChange={setYears} />
            <Text color="$muted" fontSize="$2">Select the loan duration in years</Text>
          </YStack>
        </YStack>
    </Card>
      
      <Card title="📊 Repayment Breakdown">
        <ResultRow label="Interest Repayment" value={formatZAR(interest)} />
        <ResultRow label="Total Loan Repayment" value={formatZAR(total)} />
        <ResultRow big label="Total Monthly Cost" value={formatZAR(pmt)} />
        <Text color="$muted" fontSize="$2" marginTop="$2" textAlign="center">
          📅 Over {years} years ({years * 12} months)
        </Text>
    </Card>
      
      <CalculatorActions>
        <XStack gap="$3" flexWrap="wrap">
          <Button 
            flex={isMobile ? undefined : 1} 
            minWidth={isMobile ? '100%' : undefined}
            onPress={handleExport}
          >
            <BtnText>📄 Export PDF / Share</BtnText>
          </Button>
          <Button
            flex={isMobile ? undefined : 1}
            minWidth={isMobile ? '100%' : undefined}
            onPress={() => {
              if (!canSave) {
                router.push('/register');
                return;
              }
              setModalVisible(true);
            }}
          >
            <BtnText>💾 Save to Profile</BtnText>
          </Button>
        </XStack>

        <Button
          variant="outline"
          borderColor="#9CA3AF"
          hoverStyle={{ backgroundColor: '#F3F4F6', borderColor: '#9CA3AF' }}
          onPress={() => router.push('/profile')}
        >
          <BtnText color="#6B7280">👤 View My Profile</BtnText>
        </Button>

        <Button
          backgroundColor="#000"
          borderColor="#000"
          hoverStyle={{ backgroundColor: '#111', borderColor: '#111' }}
          onPress={() => router.push('/services')}
        >
          <BtnText>🏢 View Other Services</BtnText>
        </Button>
      </CalculatorActions>

      <SaveCalculationModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSave={handleSave}
        userRole={user?.role}
      />

      <ConfirmActionModal
        visible={savedPromptVisible}
        title="✅ Saved"
        message="Calculation saved successfully! Would you like to view your saved calculations?"
        confirmText="View Saved"
        cancelText="Stay Here"
        onCancel={() => setSavedPromptVisible(false)}
        onConfirm={() => {
          setSavedPromptVisible(false);
          router.push('/calculations');
        }}
      />
    </CalculatorLayout>
  );
}