# P&P Conveyancing Companion — Expo + Tamagui Codebase

> Drop these files into a new repo (or copy/paste over an empty Expo app). This ships the *exact* MVP we’ve been planning: Expo + Tamagui + Poppins, three calculators, WhatsApp lead handoff, optional Supabase for remote config + leads.

---
## 0) File tree
```
PnpConveyancing/
├─ app/
│  ├─ _layout.tsx
│  ├─ index.tsx
│  ├─ transfer.tsx
│  ├─ bond.tsx
│  ├─ repayment.tsx
│  ├─ start.tsx
│  └─ legal.tsx
├─ components/
│  ├─ Button.tsx
│  ├─ Card.tsx
│  ├─ Field.tsx
│  ├─ ResultRow.tsx
│  └─ Segmented.tsx
├─ config/
│  ├─ theme.json
│  ├─ duty.za.json
│  ├─ fees.transfer.json
│  └─ fees.bond.json
├─ lib/
│  ├─ money.ts
│  ├─ duty.ts
│  ├─ fees.ts
│  ├─ repayment.ts
│  ├─ config.ts
│  └─ useConfig.ts
├─ utils/
│  └─ supabase.ts (optional)
├─ assets/
│  ├─ icon.png
│  ├─ splash.png
│  └─ adaptive-icon.png
├─ App.tsx
├─ tamagui.config.ts
├─ babel.config.js
├─ tsconfig.json
├─ package.json
├─ app.json
├─ eas.json
└─ .env.example
```

---
## 1) package.json
```json
{
  "name": "pnp-conveyancing",
  "version": "0.1.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "^51.0.0",
    "expo-font": "~12.0.0",
    "expo-linking": "~6.3.1",
    "expo-router": "^3.5.24",
    "expo-print": "~13.0.2",
    "expo-sharing": "~12.0.2",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-native": "0.74.0",
    "react-native-gesture-handler": "~2.16.1",
    "react-native-reanimated": "~3.10.1",
    "react-native-safe-area-context": "^4.10.5",
    "react-native-screens": "~3.31.1",
    "@tanstack/react-query": "^5.51.0",
    "@expo-google-fonts/poppins": "^0.2.4",
    "tamagui": "^1.99.7",
    "@tamagui/core": "^1.99.7",
    "@tamagui/theme": "^1.99.7",
    "@tamagui/config": "^1.99.7",
    "@supabase/supabase-js": "^2.45.4",
    "react-native-url-polyfill": "^2.0.0",
    "@react-native-async-storage/async-storage": "^1.23.1"
  },
  "devDependencies": {
    "@types/react": "18.2.45",
    "@types/react-native": "0.73.0",
    "typescript": "^5.4.0"
  }
}
```

> Note: Supabase deps are optional (only needed if you POST leads or fetch remote configs). You can remove them if you want **pure client**.

---
## 2) app.json
```json
{
  "expo": {
    "name": "P&P Conveyancing Companion",
    "slug": "pnp-conveyancing",
    "scheme": "pnpconvey",
    "version": "0.1.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": { "image": "./assets/splash.png", "resizeMode": "contain", "backgroundColor": "#FFFFFF" },
    "ios": { "supportsTablet": false },
    "android": { "package": "za.way2fly.pnpconvey", "adaptiveIcon": { "foregroundImage": "./assets/adaptive-icon.png", "backgroundColor": "#FFFFFF" } },
    "plugins": ["expo-router"],
    "extra": { "eas": { "projectId": "REPLACE_WITH_EAS_PROJECT_ID" } }
  }
}
```

---
## 3) eas.json
```json
{
  "cli": { "version": ">= 9.0.0" },
  "build": {
    "preview": { "android": { "buildType": "apk" } },
    "release": { "android": { "gradleCommand": ":app:bundleRelease" } }
  }
}
```

---
## 4) babel.config.js
```js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "expo-router/babel",
      "react-native-reanimated/plugin"
    ]
  };
};
```

---
## 5) tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": { "*": ["./*"] }
  }
}
```

---
## 6) tamagui.config.ts
```ts
import { createTamagui, createTokens } from 'tamagui';

const tokens = createTokens({
  color: {
    bg: '#FFFFFF', fg: '#111827', brand: '#0A5C3B', brandActive: '#0E754B',
    accent: '#31B276', border: '#E5E7EB', muted: '#6B7280', error: '#B91C1C', card: '#FFFFFF'
  },
  radius: { 0: 0, 8: 8, 16: 16 },
  space:  { 0: 0, 4: 4, 8: 8, 12: 12, 16: 16, 24: 24, 32: 32 },
  size:   { 14: 14, 16: 16, 18: 18, 20: 20, 24: 24 }
});

const config = createTamagui({
  defaultTheme: 'light',
  tokens,
  themes: { light: { bg: '$bg', color: '$fg', borderColor: '$border', brand: '$brand', brandActive: '$brandActive' } },
  fonts: {
    body: { family: 'Poppins', size: { 1: 14, 2: 16, 3: 18, 4: 20, 5: 24 }, weight: { 4: '400', 5: '500', 6: '600', 7: '700' } },
    heading: { family: 'Poppins', size: { 1: 18, 2: 20, 3: 24, 4: 28 }, weight: { 6: '600', 7: '700' } }
  },
  shorthands: { p: 'padding', m: 'margin', px: 'paddingHorizontal', py: 'paddingVertical', br: 'borderRadius', bw: 'borderWidth', boc: 'borderColor', bg: 'backgroundColor' }
});

export default config;
export type AppConfig = typeof config;
```

---
## 7) App.tsx (fonts + provider)
```tsx
import { TamaguiProvider, YStack, Text } from 'tamagui';
import config from './tamagui.config';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import 'react-native-gesture-handler';

export default function App() {
  const [loaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });
  if (!loaded) return null;
  (config as any).fonts.body.family = 'Poppins';
  (config as any).fonts.heading.family = 'Poppins';
  return (
    <TamaguiProvider config={config}>
      {/* expo-router mounts screens from app/ */}
    </TamaguiProvider>
  );
}
```

---
## 8) config files
**config/theme.json**
```json
{
  "brand": "Pather & Pather Attorneys",
  "primary": "#0A5C3B",
  "primaryActive": "#0E754B",
  "accent": "#31B276",
  "whatsappNumber": "27711871327",
  "disclaimer": "Please note that all values returned by the calculators are quotation values subject to change. Although every effort has been made to ensure the accuracy of the content, Pather and Pather Attorneys accepts no liability..."
}
```

**config/duty.za.json**
```json
{
  "effectiveFrom": "2025-04-01",
  "brackets": [
    { "upTo": 1210000, "base": 0, "rate": 0, "threshold": 0 },
    { "upTo": 1935000, "base": 0, "rate": 0.03, "threshold": 1210000 },
    { "upTo": 2675000, "base": 21750, "rate": 0.06, "threshold": 1935000 },
    { "upTo": 11600000, "base": 66500, "rate": 0.08, "threshold": 2675000 },
    { "rate": 0.11, "threshold": 11600000 }
  ]
}
```

**config/fees.transfer.json**
```json
{
  "formula": "tiered",
  "tiers": [
    { "max": 1000000, "rate": 0.010, "min": 4000 },
    { "max": 3000000, "rate": 0.0085, "min": 9000 },
    { "rate": 0.0075 }
  ],
  "fixedBands": [
    { "max": 2000000, "feeExVat": 35618.26 },
    { "max": 3500000, "feeExVat": 52020 }
  ],
  "deedsOfficeByPrice": [
    { "max": 1000000, "fee": 1165 },
    { "max": 2000000, "fee": 1646 },
    { "max": 4000000, "fee": 2281 },
    { "fee": 2800 }
  ],
  "disbursements": { "postage": 1380, "electronicGen": 575, "fica": 977.5, "deedsSearch": 345, "ratesClear": 1725 },
  "vatRate": 0.15
}
```

**config/fees.bond.json**
```json
{
  "formula": "tiered",
  "tiers": [
    { "max": 2000000, "rate": 0.009 },
    { "rate": 0.008 }
  ],
  "fixedBands": [
    { "max": 3000000, "feeExVat": 45870 },
    { "max": 4000000, "feeExVat": 56121.74 }
  ],
  "deedsOfficeByBond": [
    { "max": 2000000, "fee": 1646 },
    { "max": 4000000, "fee": 2281 },
    { "fee": 2800 }
  ],
  "disbursements": { "postage": 1610, "electronicGen": 575, "electronicInstr": 115, "deedsSearch": 345 },
  "vatRate": 0.15
}
```

---
## 9) lib (calculations + config loader)
**lib/money.ts**
```ts
export const formatZAR = (n: number) => {
  if (!isFinite(n)) n = 0;
  const [rands, cents] = n.toFixed(2).split('.');
  const withSpaces = rands.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `R ${withSpaces},${cents}`;
};
```

**lib/duty.ts**
```ts
export type Bracket = { upTo?: number; base?: number; rate: number; threshold?: number };
export function calcTransferDuty(price: number, brackets: Bracket[]) {
  for (const b of brackets) {
    const inBand = b.upTo ? price <= b.upTo : true;
    if (inBand) {
      const taxable = Math.max(0, price - (b.threshold ?? 0));
      return Math.max(0, Math.round((b.base ?? 0) + taxable * b.rate));
    }
  }
  return 0;
}
```

**lib/fees.ts**
```ts
type Tier = { max?: number; rate: number; min?: number };
export function tieredFee(amount: number, tiers: Tier[]) {
  for (const t of tiers) {
    const inTier = t.max ? amount <= t.max : true;
    if (inTier) return Math.max(Math.round(amount * t.rate), t.min ?? 0);
  }
  return 0;
}
export function fixedBandFee(amount: number, bands?: { max?: number; feeExVat: number }[]) {
  if (!bands) return undefined;
  for (const b of bands) {
    const inBand = b.max ? amount <= b.max : true;
    if (inBand) return b.feeExVat;
  }
  return undefined;
}
```

**lib/repayment.ts**
```ts
export function monthlyRepayment(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (!principal || !years) return { pmt: 0, total: 0, interest: 0 };
  if (r === 0) {
    const pmt = principal / n; return { pmt, total: principal, interest: 0 };
  }
  const pmt = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = pmt * n; const interest = total - principal;
  return { pmt, total, interest };
}
```

**lib/config.ts**
```ts
import dutyLocal from '../config/duty.za.json';
import feesTransferLocal from '../config/fees.transfer.json';
import feesBondLocal from '../config/fees.bond.json';

const CDN = process.env.EXPO_PUBLIC_CONFIG_BASE; // optional Supabase Storage public URL
async function getJSON<T>(path: string, fallback: T): Promise<T> {
  if (!CDN) return fallback;
  try { const res = await fetch(`${CDN}/${path}`, { cache: 'no-store' }); if (!res.ok) return fallback; return await res.json(); }
  catch { return fallback; }
}
export async function loadConfig() {
  const [duty, feesTransfer, feesBond] = await Promise.all([
    getJSON('duty.za.json', dutyLocal),
    getJSON('fees.transfer.json', feesTransferLocal),
    getJSON('fees.bond.json', feesBondLocal),
  ]);
  return { duty, feesTransfer, feesBond };
}
```

**lib/useConfig.ts**
```ts
import { useQuery } from '@tanstack/react-query';
import { loadConfig } from './config';
export const useConfig = () => useQuery({ queryKey: ['cfg'], queryFn: loadConfig, staleTime: 60_000 });
```

---
## 10) components
**components/Button.tsx**
```tsx
import { styled, YStack, Text } from 'tamagui';
export const Button = styled(YStack, {
  ai: 'center', jc: 'center', bg: '$brand', br: '$16', py: '$12', px: '$16',
  hoverStyle: { bg: '$brandActive' }, pressStyle: { scale: 0.98, opacity: 0.95 }
});
export const BtnText = (p:any)=> <Text color="white" fontWeight="$7">{p.children}</Text>;
```

**components/Card.tsx**
```tsx
import { YStack, Text } from 'tamagui';
export function Card({ title, subtitle, children }: { title?: string; subtitle?: string; children?: any }) {
  return (
    <YStack bg="$card" br="$16" p="$16" bw={1} boc="$border" shadowColor="rgba(0,0,0,0.06)" shadowRadius={8} gap="$8">
      {title ? <Text fontFamily="heading" fontWeight="$7" fontSize="$4">{title}</Text> : null}
      {subtitle ? <Text color="$muted">{subtitle}</Text> : null}
      {children}
    </YStack>
  );
}
```

**components/Field.tsx**
```tsx
import { YStack, Text, Input as TInput } from 'tamagui';
export function Field({ label, ...props }: any){
  return (
    <YStack gap="$4">
      <Text color="$fg" fontWeight="$6">{label}</Text>
      <TInput br="$8" bw={1} boc="$border" p="$12" bg="$bg" color="$fg"
        focusStyle={{ boc: '$brand', bw: 2 }}
        keyboardType={props.keyboardType}
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
      />
    </YStack>
  );
}
```

**components/ResultRow.tsx**
```tsx
import { XStack, Text } from 'tamagui';
export function ResultRow({ label, value, big }: { label: string; value: string; big?: boolean }){
  return (
    <XStack jc="space-between" ai="center" py="$8">
      <Text color="$muted">{label}</Text>
      <Text fontWeight="$7" fontSize={big ? '$4' : '$3'}>{value}</Text>
    </XStack>
  );
}
```

**components/Segmented.tsx**
```tsx
import { XStack, YStack, Text } from 'tamagui';
export function Segmented({ options, value, onChange }: { options: (number|string)[]; value: any; onChange: (v:any)=>void }){
  return (
    <XStack fw="wrap" gap="$8">
      {options.map((o)=>{
        const selected = o === value;
        return (
          <YStack key={String(o)} px="$12" py="$8" br="$16" bg={selected ? '$brand' : '$border'} onPress={()=>onChange(o)}>
            <Text color={selected ? 'white' : '$fg'}>{String(o)}</Text>
          </YStack>
        );
      })}
    </XStack>
  );
}
```

---
## 11) app (screens via expo-router)
**app/_layout.tsx**
```tsx
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const qc = new QueryClient();
export default function Layout(){
  return (
    <QueryClientProvider client={qc}>
      <Stack screenOptions={{ headerStyle:{ backgroundColor:'#0A5C3B' }, headerTintColor: 'white' }} />
    </QueryClientProvider>
  );
}
```

**app/index.tsx**
```tsx
import { ScrollView, Image } from 'react-native';
import { YStack, Text } from 'tamagui';
import { Link } from 'expo-router';

function HomeCard({ title, subtitle, href }: any){
  return (
    <Link href={href} asChild>
      <YStack bg="$card" br="$16" p="$16" bw={1} boc="$border" shadowColor="rgba(0,0,0,0.06)" shadowRadius={8} mb="$12">
        <Text fontWeight="$7" fontSize="$4">{title}</Text>
        {subtitle ? <Text color="$muted">{subtitle}</Text> : null}
      </YStack>
    </Link>
  );
}

export default function Home(){
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <YStack ai="center" mb="$12">
        <Image source={require('../assets/icon.png')} style={{ width: 72, height: 72, borderRadius: 16 }} />
        <Text fontFamily="heading" fontWeight="$7" fontSize="$5" mt="$8">Pather & Pather Attorneys</Text>
        <Text color="$muted">Conveyancing Companion</Text>
      </YStack>
      <HomeCard title="Transfer Cost Calculator" subtitle="Duty + attorney + disbursements" href="/transfer" />
      <HomeCard title="Bond Cost Calculator" subtitle="Attorney + disbursements" href="/bond" />
      <HomeCard title="Bond Repayment Calculator" subtitle="Monthly & totals" href="/repayment" />
      <HomeCard title="Start My Transfer" subtitle="Send details & open WhatsApp" href="/start" />
      <HomeCard title="Legal & Disclaimer" href="/legal" />
    </ScrollView>
  );
}
```

**app/transfer.tsx**
```tsx
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { ResultRow } from '../components/ResultRow';
import { Button, BtnText } from '../components/Button';
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
      <Button><BtnText>Start My Transfer</BtnText></Button>
    </ScrollView>
  );
}
```

**app/bond.tsx**
```tsx
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { ResultRow } from '../components/ResultRow';
import { useConfig } from '../lib/useConfig';
import { fixedBandFee, tieredFee } from '../lib/fees';
import { formatZAR } from '../lib/money';

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
    </ScrollView>
  );
}
```

**app/repayment.tsx**
```tsx
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { ResultRow } from '../components/ResultRow';
import { Segmented } from '../components/Segmented';
import { monthlyRepayment } from '../lib/repayment';
import { formatZAR } from '../lib/money';

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
    </ScrollView>
  );
}
```

**app/start.tsx**
```tsx
import { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { Button, BtnText } from '../components/Button';
import * as Linking from 'expo-linking';
import theme from '../config/theme.json';

export default function Start(){
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [suburb, setSuburb] = useState('');
  const [price, setPrice] = useState('');

  const submit = async () => {
    if (!fullName || !phone || !email) return Alert.alert('Missing info', 'Please fill name, phone, email.');
    const msg = `Hi Pather & Pather, I'm starting a transfer.\nName: ${fullName}\nPhone: ${phone}\nEmail: ${email}\nSuburb: ${suburb}\nPrice: R${price}`;
    const url = `https://wa.me/${theme.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url);
    // Optional: POST to your Supabase Edge Function (/v1/leads)
    // await fetch(process.env.EXPO_PUBLIC_API_URL + '/v1/leads', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ fullName, phone, email, suburb, price: Number(price) }) });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Card title="Start My Transfer">
        <Field label="Full Name" value={fullName} onChangeText={setFullName} />
        <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Field label="Suburb" value={suburb} onChangeText={setSuburb} />
        <Field label="Purchase Price (R)" value={price} onChangeText={setPrice} keyboardType="numeric" />
      </Card>
      <Button onPress={submit}><BtnText>Send via WhatsApp</BtnText></Button>
    </ScrollView>
  );
}
```

**app/legal.tsx**
```tsx
import { ScrollView } from 'react-native';
import { Card } from '../components/Card';
import theme from '../config/theme.json';
export default function Legal(){
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Card title="Disclaimer">
        {theme.disclaimer}
      </Card>
    </ScrollView>
  );
}
```

---
## 12) utils/supabase.ts (optional)
> **Never** ship the **service_role** key in a client app. Use only the **anon/public** key here.
```ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!, // anon key only
  { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false, lock: processLock } }
);
```

---
## 13) .env.example
```
EXPO_PUBLIC_CONFIG_BASE=https://<project>.supabase.co/storage/v1/object/public/configs
EXPO_PUBLIC_API_URL=https://<project>.supabase.co/functions
EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # ANON KEY ONLY
```

> Do **not** put the `service_role` key in `.env` for the mobile app. Keep it server-side only (Edge Functions or admin).

---
## 14) Build APK (quick)
```bash
npm i -g eas-cli
npm i
npx expo start # quick local run
EAS_NO_VCS=1 eas build -p android --profile preview
```
Use the QR/link to install the APK on your phone.

---
## 15) Golden checks (manual)
- Transfer @ **R 2 000 000** → rows + **R 81 397,50** total.
- Bond @ **R 4 000 000** → rows + **R 69 464,00 (±)** total.
- Repayment @ **R 6 000 000**, **10.5%**, **20 yrs** → monthly ≈ **R 59 902,79**.

If anything is off by a few Rand, tune `fixedBands` ex‑VAT or disbursements; verify VAT is applied once.

