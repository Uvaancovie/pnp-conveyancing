import { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { ResultRow } from '../components/ResultRow';
import { Button, BtnText } from '../components/Button';
import { useConfig } from '../lib/useConfig';
import { fixedBandFee, tieredFee } from '../lib/fees';
import { formatZAR } from '../lib/money';
import { saveCalculation } from '../utils/firebase';

export default function Bond(){
  const { data } = useConfig();
  const cfg = data!;
  const [amount, setAmount] = useState('4000000');
  const a = Number((amount||'').replace(/\s|,/g, '')) || 0;

  const exVat = fixedBandFee(a, cfg.feesBond.fixedBands) ?? tieredFee(a, cfg.feesBond.tiers);
  const atty = Math.round(exVat * (1 + cfg.feesBond.vatRate));
  const deeds = cfg.feesBond.deedsOfficeByBond.find(b=>!b.max || a <= b.max)?.fee ?? 0;
  const d = cfg.feesBond.disbursements;
  const total = atty + d.postage + d.deedsSearch + d.electronicGen + d.electronicInstr + deeds;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Card title="Bond Cost Calculator" subtitle="Quotation values subject to change.">
        <Field label="Bond Amount (R)" keyboardType="numeric" value={amount} onChangeText={setAmount} placeholder="4 000 000" />
      </Card>
      <Card title="Results">
        <ResultRow label="Bond Attorney Fee" value={formatZAR(atty)} />
        <ResultRow label="Postages & Petties" value={formatZAR(d.postage)} />
        <ResultRow label="Deeds Office Fees" value={formatZAR(deeds)} />
        <ResultRow label="Electronic Generation Fee" value={formatZAR(d.electronicGen)} />
        <ResultRow label="Electronic Instruction Fee" value={formatZAR(d.electronicInstr)} />
        <ResultRow label="Deeds Office Searches" value={formatZAR(d.deedsSearch)} />
        <ResultRow big label="Total Bond Costs (incl. VAT)" value={formatZAR(total)} />
      </Card>
      <Button onPress={async ()=>{
        try {
          await saveCalculation({ type: 'bond', inputs: { amount: a }, result: { total, atty } });
          Alert.alert('Saved', 'Calculation saved to your profile.');
        } catch (err) { Alert.alert('Please sign in', 'Save requires a registered account.'); }
      }}><BtnText>Save to Profile</BtnText></Button>
    </ScrollView>
  );
}