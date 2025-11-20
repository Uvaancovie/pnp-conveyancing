import { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { BtnText, Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { ResultRow } from '../components/ResultRow';
import { defaultConfig } from '../lib/config';
import { calcTransferDuty } from '../lib/duty';
import { fixedBandFee, tieredFee } from '../lib/fees';
import { formatZAR } from '../lib/money';
import { useConfig } from '../lib/useConfig';
import { saveCalculation } from '../utils/firebase';

export default function Transfer(){
  const { data } = useConfig();
  const cfg = data ?? defaultConfig; // use default inline config when data is not loaded
  const [price, setPrice] = useState('2000000');
  const p = Number((price||'').replace(/\s|,/g, '')) || 0;

  const duty = calcTransferDuty(p, cfg.duty.brackets);
  const exVat = fixedBandFee(p, cfg.feesTransfer.fixedBands) ?? tieredFee(p, cfg.feesTransfer.tiers);
  const atty = Math.round(exVat * (1 + cfg.feesTransfer.vatRate));
  const deeds = cfg.feesTransfer.deedsOfficeByPrice.find(b=>!b.max || p <= b.max)?.fee ?? 0;
  const d = cfg.feesTransfer.disbursements ?? {} as any;
  const total = atty + (d.postage ?? 0) + (d.electronicGen ?? 0) + (d.fica ?? 0) + (d.deedsSearch ?? 0) + (d.ratesClear ?? 0) + deeds + duty;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Card title="Transfer Cost Calculator" subtitle="Quotation values subject to change.">
        <Field label="Purchase Price (R)" keyboardType="numeric" value={price} onChangeText={setPrice} placeholder="2 000 000" />
      </Card>
      <Card title="Results">
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
      <Button onPress={async ()=>{
        try {
          await saveCalculation({ type: 'transfer', inputs: { price: p }, result: { total, duty, atty } });
          Alert.alert('Saved', 'Calculation saved to your profile.');
        } catch (err) { Alert.alert('Please sign in', 'Save requires a registered account.'); }
      }}><BtnText>Save to Profile</BtnText></Button>
    </ScrollView>
  );
}