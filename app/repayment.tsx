import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, ScrollView } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { BtnText, Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { ResultRow } from '../components/ResultRow';
import { Segmented } from '../components/Segmented';
import { formatZAR } from '../lib/money';
import { monthlyRepayment } from '../lib/repayment';
import { saveCalculation } from '../utils/firebase';

const YEARS = [5, 10, 20, 25, 30];

export default function Repayment(){
  const router = useRouter();
  const [amount, setAmount] = useState('6000000');
  const [rate, setRate] = useState('10.5');
  const [years, setYears] = useState<number>(20);
  const a = Number((amount||'').replace(/\s|,/g, '')) || 0;
  const r = Number((rate||'').replace(',', '.')) || 0;

  const { pmt, total, interest } = monthlyRepayment(a, r, years);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      <Card title="Bond Repayment Calculator">
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
        <Button onPress={async ()=>{
          try {
            await saveCalculation({ type: 'repayment', inputs: { principal: a, rate: r, years }, result: { pmt, total, interest } });
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
        }}><BtnText>Save to Profile</BtnText></Button>

        <Button variant="outline" onPress={() => router.push('/profile')}>
            <BtnText color="$brand">View My Profile</BtnText>
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
    </ScrollView>
  );
}