import { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { BtnText, Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { ResultRow } from '../components/ResultRow';
import { defaultConfig } from '../lib/config';
import { fixedBandFee, tieredFee } from '../lib/fees';
import { formatZAR } from '../lib/money';
import { useConfig } from '../lib/useConfig';
import { saveCalculation } from '../utils/firebase';

export default function Bond(){
  const { data } = useConfig();
  const cfg = data ?? defaultConfig;
  const [amount, setAmount] = useState('4000000');
  const a = Number((amount||'').replace(/\s|,/g, '')) || 0;

  const exVat = fixedBandFee(a, cfg.feesBond.fixedBands) ?? tieredFee(a, cfg.feesBond.tiers);
  const atty = Math.round(exVat * (1 + cfg.feesBond.vatRate));
  const deeds = cfg.feesBond.deedsOfficeByBond.find(b=>!b.max || a <= b.max)?.fee ?? 0;
  const d = cfg.feesBond.disbursements ?? {} as any;
  const total = atty + (d.postage ?? 0) + (d.deedsSearch ?? 0) + (d.electronicGen ?? 0) + (d.electronicInstr ?? 0) + deeds;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
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
      <Button onPress={async ()=>{
        try {
          await saveCalculation({ type: 'bond', inputs: { amount: a }, result: { total, atty } });
          Alert.alert('Saved', 'Calculation saved to your profile.');
        } catch (err) { Alert.alert('Please sign in', 'Save requires a registered account.'); }
      }}><BtnText>Save to Profile</BtnText></Button>
    </ScrollView>
  );
}