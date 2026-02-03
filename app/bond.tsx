import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, useWindowDimensions } from 'react-native';
import { Text, XStack } from 'tamagui';
import { heroImages } from '../assets/images';
import { AmountField } from '../components/AmountField';
import { BtnText, Button } from '../components/Button';
import { CalculatorActions, CalculatorLayout } from '../components/CalculatorLayout';
import { Card } from '../components/Card';
import { ConfirmActionModal } from '../components/ConfirmActionModal';
import { ResultRow } from '../components/ResultRow';
import { SaveCalculationModal } from '../components/SaveCalculationModal';
import { useAuth } from '../contexts/auth-context';
import { defaultConfig } from '../lib/config';
import { fixedBandFee, tieredFee } from '../lib/fees';
import { formatZAR } from '../lib/money';
import { useConfig } from '../lib/useConfig';
import { saveCalculation } from '../utils/firebase';
import { generateAndSavePDF, generateAndSharePDF } from '../utils/pdf-generator';

const PRESET_AMOUNTS = [1000000, 2000000, 4000000, 6000000, 10000000];

export default function Bond(){
  const router = useRouter();
  const { user } = useAuth();
  const { data } = useConfig();
  const cfg = data ?? defaultConfig;
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  
  const [amount, setAmount] = useState('4000000');
  const [modalVisible, setModalVisible] = useState(false);
  const [savedPromptVisible, setSavedPromptVisible] = useState(false);
  const [error, setError] = useState('');
  
  const a = Number((amount||'').replace(/\s|,/g, '')) || 0;
  
  const handleAmountChange = (value: string) => {
    setAmount(value);
    const num = Number(value.replace(/\s|,/g, ''));
    if (num < 0) {
      setError('Amount must be positive');
    } else if (num > 100000000) {
      setError('Amount seems unusually high');
    } else {
      setError('');
    }
  };

  const exVat = fixedBandFee(a, cfg.feesBond.fixedBands) ?? tieredFee(a, cfg.feesBond.tiers);
  const atty = Math.round(exVat * (1 + cfg.feesBond.vatRate));
  const deeds = cfg.feesBond.deedsOfficeByBond.find(b=>!b.max || a <= b.max)?.fee ?? 0;
  const d = cfg.feesBond.disbursements ?? {} as any;
  const total = atty + (d.postage ?? 0) + (d.deedsSearch ?? 0) + (d.electronicGen ?? 0) + (d.electronicInstr ?? 0) + deeds;

  const canSave = !!user && (user.role === 'customer' || user.role === 'agent');

  const handleSave = async (name: string) => {
    try {
      let pdfUrl;
      // Only generate PDF on native platforms to avoid print dialog on web
      if (user && Platform.OS !== 'web') {
        try {
          pdfUrl = await generateAndSavePDF(
            'Bond Cost Calculation',
            { bondAmount: a },
            {
              bondAttorneyFee: atty,
              postagesAndPetties: d.postage ?? 0,
              deedsOfficeFees: deeds,
              electronicGenerationFee: d.electronicGen ?? 0,
              electronicInstructionFee: d.electronicInstr ?? 0,
              deedsOfficeSearches: d.deedsSearch ?? 0,
              totalBondCosts: total
            },
            user.uid
          );
        } catch (e) {
          console.warn("Failed to generate/save PDF:", e);
        }
      }

      const payload: any = { 
        type: 'bond', 
        inputs: { amount: a }, 
        result: { total, atty },
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
        'Bond Cost Calculation',
        { bondAmount: a },
        {
          bondAttorneyFee: atty,
          postagesAndPetties: d.postage ?? 0,
          deedsOfficeFees: deeds,
          electronicGenerationFee: d.electronicGen ?? 0,
          electronicInstructionFee: d.electronicInstr ?? 0,
          deedsOfficeSearches: d.deedsSearch ?? 0,
          totalBondCosts: total
        }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  return (
    <CalculatorLayout
      heroImage={heroImages.bond}
      title="Bond Costs"
      subtitle="Calculate your bond registration fees"
      relatedCalculators={
        <XStack gap="$3" justifyContent="center" flexWrap="wrap">
          <Button flex={isMobile ? undefined : 1} minWidth={isMobile ? 140 : undefined} backgroundColor="$brand" onPress={() => router.push('/transfer')}>
            <BtnText>Transfer Costs</BtnText>
          </Button>
          <Button flex={isMobile ? undefined : 1} minWidth={isMobile ? 140 : undefined} backgroundColor="$brand" onPress={() => router.push('/repayment')}>
            <BtnText>Repayments</BtnText>
          </Button>
        </XStack>
      }
    >
      <Card>
        <AmountField 
          label="Bond Amount" 
          keyboardType="numeric" 
          value={amount} 
          onChangeText={handleAmountChange}
          placeholder="4000000"
          helpText="Enter the total bond amount you're registering"
          presets={PRESET_AMOUNTS}
          error={error}
        />
        <Text color="#9CA3AF" fontSize="$2" marginTop="$2" textAlign="center">
          💡 Quotation values subject to change
        </Text>
    </Card>
      
      <Card title="📊 Cost Breakdown">
        <ResultRow label="Bond Attorney Fee" value={formatZAR(atty)} />
        <ResultRow label="Postages & Petties" value={formatZAR(d.postage ?? 0)} />
        <ResultRow label="Deeds Office Fees" value={formatZAR(deeds)} />
        <ResultRow label="Electronic Generation Fee" value={formatZAR(d.electronicGen ?? 0)} />
        <ResultRow label="Electronic Instruction Fee" value={formatZAR(d.electronicInstr ?? 0)} />
        <ResultRow label="Deeds Office Searches" value={formatZAR(d.deedsSearch ?? 0)} />
        <ResultRow big label="Total Bond Costs (incl. VAT)" value={formatZAR(total)} />
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