import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, ScrollView } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { BtnText, Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { ResultRow } from '../components/ResultRow';
import { SaveCalculationModal } from '../components/SaveCalculationModal';
import { defaultConfig } from '../lib/config';
import { fixedBandFee, tieredFee } from '../lib/fees';
import { formatZAR } from '../lib/money';
import { useConfig } from '../lib/useConfig';
import { saveCalculation } from '../utils/firebase';
import { generateAndSharePDF } from '../utils/pdf-generator';

export default function Bond(){
  const router = useRouter();
  const { data } = useConfig();
  const cfg = data ?? defaultConfig;
  const [amount, setAmount] = useState('4000000');
  const [modalVisible, setModalVisible] = useState(false);
  const a = Number((amount||'').replace(/\s|,/g, '')) || 0;

  const exVat = fixedBandFee(a, cfg.feesBond.fixedBands) ?? tieredFee(a, cfg.feesBond.tiers);
  const atty = Math.round(exVat * (1 + cfg.feesBond.vatRate));
  const deeds = cfg.feesBond.deedsOfficeByBond.find(b=>!b.max || a <= b.max)?.fee ?? 0;
  const d = cfg.feesBond.disbursements ?? {} as any;
  const total = atty + (d.postage ?? 0) + (d.deedsSearch ?? 0) + (d.electronicGen ?? 0) + (d.electronicInstr ?? 0) + deeds;

  const handleSave = async (name: string) => {
    try {
      await saveCalculation({ 
        type: 'bond', 
        inputs: { amount: a }, 
        result: { total, atty },
        name 
      });
      if (Platform.OS === 'web') {
        if (window.confirm('Calculation saved successfully! Would you like to view your profile?')) {
          router.push('/profile');
        }
      } else {
        Alert.alert('Saved', 'Calculation saved to your profile.', [
          { text: 'Stay Here', style: 'cancel' },
          { text: 'View Profile', onPress: () => router.push('/profile') }
        ]);
      }
    } catch (err: any) { 
      console.error(err);
      if (err.message === 'not-signed-in') {
        Alert.alert('Please sign in', 'Save requires a registered account.');
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
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      <Card title="Bond Cost Calculator" subtitle="Quotation values subject to change.">
        <Field label="Bond Amount (R)" keyboardType="numeric" value={amount} onChangeText={setAmount} placeholder="4 000 000" />
      </Card>
      <Card title="Results">
        <ResultRow label="Bond Attorney Fee" value={formatZAR(atty)} />
        <ResultRow label="Postages & Petties" value={formatZAR(d.postage ?? 0)} />
        <ResultRow label="Deeds Office Fees" value={formatZAR(deeds)} />
        <ResultRow label="Electronic Generation Fee" value={formatZAR(d.electronicGen ?? 0)} />
        <ResultRow label="Electronic Instruction Fee" value={formatZAR(d.electronicInstr ?? 0)} />
        <ResultRow label="Deeds Office Searches" value={formatZAR(d.deedsSearch ?? 0)} />
        <ResultRow big label="Total Bond Costs (incl. VAT)" value={formatZAR(total)} />
      </Card>
      <YStack gap="$3" marginTop="$4">
        <XStack gap="$3">
          <Button flex={1} onPress={handleExport}><BtnText>Export PDF / Share</BtnText></Button>
        </XStack>

        <Button onPress={() => setModalVisible(true)}><BtnText>Save to Profile</BtnText></Button>

        <Button variant="outline" onPress={() => router.push('/profile')}>
            <BtnText color="$brand">View My Profile</BtnText>
        </Button>
        
        <Text textAlign="center" color="$muted" fontSize="$3" marginTop="$2">Related Calculators</Text>
        <XStack gap="$3" justifyContent="center">
          <Button flex={1} backgroundColor="$brand" onPress={() => router.push('/transfer')}>
            <BtnText>Transfer Costs</BtnText>
          </Button>
          <Button flex={1} backgroundColor="$brand" onPress={() => router.push('/repayment')}>
            <BtnText>Repayments</BtnText>
          </Button>
        </XStack>
      </YStack>

      <SaveCalculationModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSave={handleSave}
      />
    </ScrollView>
  );
}