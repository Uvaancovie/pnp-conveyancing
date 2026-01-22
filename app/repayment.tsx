import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, ScrollView, View } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { heroImages } from '../assets/images';
import { BtnText, Button } from '../components/Button';
import { Card } from '../components/Card';
import { ConfirmActionModal } from '../components/ConfirmActionModal';
import { Field } from '../components/Field';
import { HeroImage } from '../components/HeroImage';
import { QuickNavBar } from '../components/Navigation';
import { ResultRow } from '../components/ResultRow';
import { SaveCalculationModal } from '../components/SaveCalculationModal';
import { Segmented } from '../components/Segmented';
import { useAuth } from '../contexts/auth-context';
import { formatZAR } from '../lib/money';
import { monthlyRepayment } from '../lib/repayment';
import { saveCalculation } from '../utils/firebase';
import { generateAndSavePDF, generateAndSharePDF } from '../utils/pdf-generator';

const YEARS = [5, 10, 20, 25, 30];

export default function Repayment(){
  const router = useRouter();
  const { user } = useAuth();
  const [amount, setAmount] = useState('6000000');
  const [rate, setRate] = useState('10.5');
  const [years, setYears] = useState<number>(20);
  const [modalVisible, setModalVisible] = useState(false);
  const [savedPromptVisible, setSavedPromptVisible] = useState(false);
  const a = Number((amount||'').replace(/\s|,/g, '')) || 0;
  const r = Number((rate||'').replace(',', '.')) || 0;

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
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <HeroImage 
          source={heroImages.repayment}
          title="Repayments"
          subtitle="Calculate monthly payments & totals"
          height={160}
          overlayOpacity={0}
        />
        
        <Card>
          <Field label="Bond Amount (R)" keyboardType="numeric" value={amount} onChangeText={setAmount} placeholder="6 000 000" />
          <Field label="Interest Rate %" keyboardType="numeric" value={rate} onChangeText={setRate} placeholder="10.5" />
          <Segmented options={YEARS} value={years} onChange={setYears} />
        </Card>
        <Card title="Results">
          <ResultRow label="Interest Repayment" value={formatZAR(interest)} />
          <ResultRow label="Total Loan Repayment" value={formatZAR(total)} />
          <ResultRow big label="Total Monthly Cost" value={formatZAR(pmt)} />
        </Card>
        <YStack gap="$3" marginTop="$4">
          <XStack gap="$3">
            <Button flex={1} onPress={handleExport}><BtnText>Export PDF / Share</BtnText></Button>
          </XStack>

          <Button
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

          <Button
            variant="outline"
            borderColor="#9CA3AF"
            hoverStyle={{ backgroundColor: '#F3F4F6', borderColor: '#9CA3AF' }}
            onPress={() => router.push('/profile')}
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
          
          <Text textAlign="center" color="$muted" fontSize="$3" marginTop="$2">Related Calculators</Text>
          <XStack gap="$3" justifyContent="center">
            <Button flex={1} backgroundColor="$brand" onPress={() => router.push('/transfer')}>
              <BtnText>Transfer Costs</BtnText>
            </Button>
            <Button flex={1} backgroundColor="$brand" onPress={() => router.push('/bond')}>
              <BtnText>Bond Costs</BtnText>
            </Button>
          </XStack>
        </YStack>

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
      </ScrollView>
      <QuickNavBar />
    </View>
  );
}