import { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { ResultRow } from '../components/ResultRow';
import { Button, BtnText } from '../components/Button';
import { saveCalculation } from '../utils/firebase';
import { useConfig } from '../lib/useConfig';
import { calcTransferDuty } from '../lib/duty';
import { fixedBandFee, tieredFee } from '../lib/fees';
import { formatZAR } from '../lib/money';

export default function Transfer(){
  const { data } = useConfig();
  const cfg = data!; // bundled fallback ensures non-null
  const [price, setPrice] = useState('2000000');
  const p = Number((price||'').replace(/\s|,/g, '')) || 0;

  const duty = calcTransferDuty(p, cfg.duty.brackets);
  const exVat = fixedBandFee(p, cfg.feesTransfer.fixedBands) ?? tieredFee(p, cfg.feesTransfer.tiers);
  const atty = Math.round(exVat * (1 + cfg.feesTransfer.vatRate));
  const deeds = cfg.feesTransfer.deedsOfficeByPrice.find(b=>!b.max || p <= b.max)?.fee ?? 0;
  const d = cfg.feesTransfer.disbursements;
  const total = atty + d.postage + d.electronicGen + d.fica + d.deedsSearch + d.ratesClear + deeds + duty;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Card title="Transfer Cost Calculator" subtitle="Quotation values subject to change.">
        <Field label="Purchase Price (R)" keyboardType="numeric" value={price} onChangeText={setPrice} placeholder="2 000 000" />
      </Card>
      <Card title="Results">
        <ResultRow label="Transfer Attorney Fees" value={formatZAR(atty)} />
        <ResultRow label="Postages & Petties" value={formatZAR(d.postage)} />
        <ResultRow label="Deeds Office Fees" value={formatZAR(deeds)} />
        <ResultRow label="Electronic Generation Fee" value={formatZAR(d.electronicGen)} />
        <ResultRow label="FICA" value={formatZAR(d.fica)} />
        <ResultRow label="Deeds Office Searches" value={formatZAR(d.deedsSearch)} />
        <ResultRow label="Rates Clearance Fees" value={formatZAR(d.ratesClear)} />
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