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
import { calcTransferDuty } from '../lib/duty';
import { fixedBandFee, tieredFee } from '../lib/fees';
import { formatZAR } from '../lib/money';
import { useConfig } from '../lib/useConfig';
import { saveCalculation } from '../utils/firebase';
import { generateAndSavePDF, generateAndSharePDF } from '../utils/pdf-generator';

export default function Transfer() {
  const router = useRouter();
  const { user } = useAuth();
  const { data } = useConfig();
  const cfg = data ?? defaultConfig;
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [price, setPrice] = useState('2000000');
  const [modalVisible, setModalVisible] = useState(false);
  const [savedPromptVisible, setSavedPromptVisible] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const p = Number((price || '').replace(/\s|,|R/g, '')) || 0;

  const handlePriceChange = (value: string) => {
    setPrice(value);
    const num = Number(value.replace(/\s|,|R/g, ''));
    if (num < 0) {
      setError('Price must be positive');
    } else if (num > 100000000) {
      setError('Price seems unusually high');
    } else {
      setError('');
    }
  };

  const duty = calcTransferDuty(p, cfg.duty.brackets);
  const exVat = fixedBandFee(p, cfg.feesTransfer.fixedBands) ?? tieredFee(p, cfg.feesTransfer.tiers);
  const atty = Math.round(exVat * (1 + cfg.feesTransfer.vatRate));
  const deeds = cfg.feesTransfer.deedsOfficeByPrice.find(b => !b.max || p <= b.max)?.fee ?? 0;
  const d = cfg.feesTransfer.disbursements ?? {} as any;
  const total = atty + (d.postage ?? 0) + (d.electronicGen ?? 0) + (d.fica ?? 0) + (d.deedsSearch ?? 0) + (d.ratesClear ?? 0) + deeds + duty;

  const canSave = !!user && (user.role === 'customer' || user.role === 'agent');

  const handleSave = async (name: string) => {
    try {
      let pdfUrl;
      // Only generate PDF on native platforms to avoid print dialog on web
      if (user && Platform.OS !== 'web') {
        try {
          pdfUrl = await generateAndSavePDF(
            'Transfer Cost Calculation',
            { purchasePrice: p },
            {
              transferAttorneyFees: atty,
              postagesAndPetties: d.postage ?? 0,
              deedsOfficeFees: deeds,
              electronicGenerationFee: d.electronicGen ?? 0,
              fica: d.fica ?? 0,
              deedsOfficeSearches: d.deedsSearch ?? 0,
              ratesClearanceFees: d.ratesClear ?? 0,
              transferDuty: duty,
              totalTransferCosts: total
            },
            user.uid
          );
        } catch (e) {
          console.warn("Failed to generate/save PDF:", e);
        }
      }

      const payload: any = {
        type: 'transfer',
        inputs: { price: p },
        result: { total, duty, atty },
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
    if (exporting) return;
    setExporting(true);
    try {
      await generateAndSharePDF(
        'Transfer Cost Calculation',
        { purchasePrice: p },
        {
          transferAttorneyFees: atty,
          postagesAndPetties: d.postage ?? 0,
          deedsOfficeFees: deeds,
          electronicGenerationFee: d.electronicGen ?? 0,
          fica: d.fica ?? 0,
          deedsOfficeSearches: d.deedsSearch ?? 0,
          ratesClearanceFees: d.ratesClear ?? 0,
          transferDuty: duty,
          totalTransferCosts: total
        }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  return (
    <CalculatorLayout
      heroImage={heroImages.transfer}
      title="Transfer Costs"
      subtitle="Calculate your property transfer fees"
      relatedCalculators={
        <XStack gap="$3" justifyContent="center" flexWrap="wrap">
          <Button flex={isMobile ? undefined : 1} minWidth={isMobile ? 140 : undefined} backgroundColor="$brand" onPress={() => router.push('/bond')}>
            <BtnText>Bond Costs</BtnText>
          </Button>
          <Button flex={isMobile ? undefined : 1} minWidth={isMobile ? 140 : undefined} backgroundColor="$brand" onPress={() => router.push('/repayment')}>
            <BtnText>Repayments</BtnText>
          </Button>
        </XStack>
      }
    >
      <Card>
        <AmountField
          label="Purchase Price"
          keyboardType="numeric"
          value={price}
          onChangeText={handlePriceChange}
          placeholder="2 000 000"
          helpText="Enter the property purchase price"
          error={error}
        />
        <Text color="#9CA3AF" fontSize="$2" marginTop="$2" textAlign="center">
          Quotation values subject to change
        </Text>
      </Card>

      <Card title="Cost Breakdown">
        <ResultRow label="Transfer Attorney Fees" value={formatZAR(atty)} />
        <ResultRow label="Postages & Petties" value={formatZAR(d.postage ?? 0)} />
        <ResultRow label="Deeds Office Fees" value={formatZAR(deeds)} />
        <ResultRow label="Electronic Generation Fee" value={formatZAR(d.electronicGen ?? 0)} />
        <ResultRow label="FICA" value={formatZAR(d.fica ?? 0)} />
        <ResultRow label="Deeds Office Searches" value={formatZAR(d.deedsSearch ?? 0)} />
        <ResultRow label="Rates Clearance Fees" value={formatZAR(d.ratesClear ?? 0)} />
        <ResultRow label="Transfer Duty" value={formatZAR(duty)} />
        <ResultRow big label="Total Transfer Costs (incl. VAT)" value={formatZAR(total)} />
      </Card>

      <CalculatorActions>
        <XStack gap="$3" flexWrap="wrap" marginBottom="$3">
          <Button
            flex={isMobile ? undefined : 1}
            minWidth={isMobile ? '100%' : undefined}
            onPress={handleExport}
            disabled={exporting}
            opacity={exporting ? 0.6 : 1}
          >
            <BtnText>{exporting ? 'Generating...' : 'Export PDF / Share'}</BtnText>
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
            <BtnText>Save to Profile</BtnText>
          </Button>
        </XStack>

        <Button
          variant="outline"
          borderColor="#9CA3AF"
          hoverStyle={{ backgroundColor: '#F3F4F6', borderColor: '#9CA3AF' }}
          onPress={() => router.push('/profile')}
          marginBottom="$3"
        >
          <BtnText color="#6B7280">View My Profile</BtnText>
        </Button>

        <Button
          backgroundColor="#000"
          borderColor="#000"
          hoverStyle={{ backgroundColor: '#111', borderColor: '#111' }}
          onPress={() => router.push('/services')}
        >
          <BtnText>View Other Services</BtnText>
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
        title="Saved"
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