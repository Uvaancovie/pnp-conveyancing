import { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { ResultRow } from '../components/ResultRow';
import { Segmented } from '../components/Segmented';
import { monthlyRepayment } from '../lib/repayment';
import { formatZAR } from '../lib/money';
import { saveCalculation } from '../utils/firebase';
import { Button, BtnText } from '../components/Button';

const YEARS = [5, 10, 20, 25, 30];

export default function Repayment(){
  const [amount, setAmount] = useState('6000000');
  const [rate, setRate] = useState('10.5');
  const [years, setYears] = useState<number>(20);
  const a = Number((amount||'').replace(/\s|,/g, '')) || 0;
  const r = Number((rate||'').replace(',', '.')) || 0;

  const { pmt, total, interest } = monthlyRepayment(a, r, years);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
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
      <Button onPress={async ()=>{
        try {
          await saveCalculation({ type: 'repayment', inputs: { principal: a, rate: r, years }, result: { pmt, total, interest } });
          Alert.alert('Saved', 'Calculation saved to your profile.');
        } catch (err) { Alert.alert('Please sign in', 'Save requires a registered account.'); }
      }}><BtnText>Save to Profile</BtnText></Button>
    </ScrollView>
  );
}