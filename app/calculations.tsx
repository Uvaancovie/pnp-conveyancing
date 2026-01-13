import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Text as TText, XStack, YStack } from 'tamagui';
import { heroImages } from '../assets/images';
import { BtnText, Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { HeroImage } from '../components/HeroImage';
import { QuickNavBar } from '../components/Navigation';
import { Segmented } from '../components/Segmented';
import { useAuth } from '../contexts/auth-context';
import { formatZAR } from '../lib/money';
import { fetchMyCalculations } from '../utils/firebase';

type CalcType = 'all' | 'transfer' | 'bond' | 'repayment';

function parseNumber(input: unknown): number | undefined {
  if (typeof input === 'number' && Number.isFinite(input)) return input;
  if (typeof input !== 'string') return undefined;
  const cleaned = input.replace(/\s|,/g, '');
  if (!cleaned) return undefined;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : undefined;
}

function parseIsoDate(input: string): Date | undefined {
  const trimmed = (input ?? '').trim();
  if (!trimmed) return undefined;

  // Accept YYYY-MM-DD
  const m = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return undefined;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return undefined;

  const date = new Date(Date.UTC(year, month - 1, day));
  return Number.isFinite(date.getTime()) ? date : undefined;
}

function parseIsoMonth(input: string): { year: number; month: number } | undefined {
  const trimmed = (input ?? '').trim();
  if (!trimmed) return undefined;

  // Accept YYYY-MM
  const m = trimmed.match(/^(\d{4})-(\d{2})$/);
  if (!m) return undefined;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (!year || month < 1 || month > 12) return undefined;
  return { year, month };
}

function createdAtToDate(createdAt: any): Date | undefined {
  if (!createdAt) return undefined;
  if (typeof createdAt?.toDate === 'function') {
    const d = createdAt.toDate();
    return d instanceof Date ? d : undefined;
  }
  if (typeof createdAt?.seconds === 'number') {
    return new Date(createdAt.seconds * 1000);
  }
  return undefined;
}

function extractInputAmount(inputs: any): number | undefined {
  const candidates = [inputs?.price, inputs?.purchasePrice, inputs?.amount, inputs?.bondAmount, inputs?.principal];
  for (const c of candidates) {
    const n = parseNumber(c);
    if (n !== undefined) return n;
  }
  // Fallback: first numeric field
  if (inputs && typeof inputs === 'object') {
    for (const v of Object.values(inputs)) {
      const n = parseNumber(v);
      if (n !== undefined) return n;
    }
  }
  return undefined;
}

function extractResultAmount(result: any): number | undefined {
  const candidates = [result?.total, result?.totalTransferCosts, result?.totalBondCosts, result?.totalLoanRepayment, result?.pmt, result?.monthlyRepayment];
  for (const c of candidates) {
    const n = parseNumber(c);
    if (n !== undefined) return n;
  }
  return undefined;
}

export default function CalculationsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [calcs, setCalcs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState<CalcType>('all');
  const [month, setMonth] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    setLoading(true);
    fetchMyCalculations()
      .then((r) => {
        if (mounted) setCalcs(r as any[]);
      })
      .catch((err) => console.error('Error fetching calculations:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [user?.uid]);

  const filtered = useMemo(() => {
    const parsedMonth = parseIsoMonth(month);
    const parsedFrom = parseIsoDate(fromDate);
    const parsedTo = parseIsoDate(toDate);

    const pMin = parseNumber(priceMin);
    const pMax = parseNumber(priceMax);
    const aMin = parseNumber(amountMin);
    const aMax = parseNumber(amountMax);

    return (calcs ?? []).filter((c) => {
      if (type !== 'all' && c?.type !== type) return false;

      const created = createdAtToDate(c?.createdAt);
      if (parsedMonth && created) {
        const y = created.getFullYear();
        const m = created.getMonth() + 1;
        if (y !== parsedMonth.year || m !== parsedMonth.month) return false;
      }

      if ((parsedFrom || parsedTo) && created) {
        const createdUtc = new Date(Date.UTC(created.getFullYear(), created.getMonth(), created.getDate()));
        if (parsedFrom && createdUtc < parsedFrom) return false;
        if (parsedTo && createdUtc > parsedTo) return false;
      }

      const inputAmount = extractInputAmount(c?.inputs);
      if (pMin !== undefined && inputAmount !== undefined && inputAmount < pMin) return false;
      if (pMax !== undefined && inputAmount !== undefined && inputAmount > pMax) return false;

      const resultAmount = extractResultAmount(c?.result);
      if (aMin !== undefined && resultAmount !== undefined && resultAmount < aMin) return false;
      if (aMax !== undefined && resultAmount !== undefined && resultAmount > aMax) return false;

      return true;
    });
  }, [amountMax, amountMin, calcs, fromDate, month, priceMax, priceMin, toDate, type]);

  if (!user) {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          <HeroImage
            source={heroImages.profile}
            title="Saved Calculations"
            subtitle="Sign in to view your saved calculator results"
            height={180}
            overlayOpacity={0.55}
          />

          <Card>
            <YStack gap="$4" padding="$2">
              <TText color="$muted" textAlign="center">
                Sign in to view and filter your saved calculations.
              </TText>
              <XStack gap="$3" justifyContent="center">
                <Button flex={1} onPress={() => router.push('/login')}>
                  <BtnText>Sign In</BtnText>
                </Button>
                <Button flex={1} variant="secondary" onPress={() => router.push('/signup')}>
                  <BtnText color="$brand">Create Account</BtnText>
                </Button>
              </XStack>
            </YStack>
          </Card>
        </ScrollView>
        <QuickNavBar />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <YStack marginBottom="$4" paddingTop="$2">
          <TText fontSize={28} fontWeight="700" color="$brand" fontFamily="Poppins_700Bold">
            Saved Calculations
          </TText>
          <TText fontSize={14} color="$muted" marginTop="$1" fontFamily="Poppins_400Regular">
            {filtered.length} result{filtered.length === 1 ? '' : 's'}
          </TText>
        </YStack>

        <Card title="Filter" subtitle="Filter by date/month, amount, type, and price range">
          <YStack gap="$3" marginTop="$2">
            <YStack gap="$2">
              <TText color="$muted" fontSize={12}>
                Type
              </TText>
              <Segmented
                options={['all', 'transfer', 'bond', 'repayment']}
                value={type}
                onChange={(v) => setType(v as CalcType)}
              />
            </YStack>

            <Field
              label="Filter by month (YYYY-MM)"
              value={month}
              onChangeText={setMonth}
              autoCapitalize="none"
              placeholder="2026-01"
            />

            <XStack gap="$2">
              <YStack flex={1}>
                <Field
                  label="From date (YYYY-MM-DD)"
                  value={fromDate}
                  onChangeText={setFromDate}
                  autoCapitalize="none"
                  placeholder="2026-01-01"
                />
              </YStack>
              <YStack flex={1}>
                <Field
                  label="To date (YYYY-MM-DD)"
                  value={toDate}
                  onChangeText={setToDate}
                  autoCapitalize="none"
                  placeholder="2026-01-31"
                />
              </YStack>
            </XStack>

            <XStack gap="$2">
              <YStack flex={1}>
                <Field
                  label="Price min"
                  value={priceMin}
                  onChangeText={setPriceMin}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </YStack>
              <YStack flex={1}>
                <Field
                  label="Price max"
                  value={priceMax}
                  onChangeText={setPriceMax}
                  keyboardType="numeric"
                  placeholder="10 000 000"
                />
              </YStack>
            </XStack>

            <XStack gap="$2">
              <YStack flex={1}>
                <Field
                  label="Amount min"
                  value={amountMin}
                  onChangeText={setAmountMin}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </YStack>
              <YStack flex={1}>
                <Field
                  label="Amount max"
                  value={amountMax}
                  onChangeText={setAmountMax}
                  keyboardType="numeric"
                  placeholder="2 000 000"
                />
              </YStack>
            </XStack>

            <Button
              variant="outline"
              borderColor="#9CA3AF"
              hoverStyle={{ backgroundColor: '#F3F4F6', borderColor: '#9CA3AF' }}
              onPress={() => {
                setType('all');
                setMonth('');
                setFromDate('');
                setToDate('');
                setPriceMin('');
                setPriceMax('');
                setAmountMin('');
                setAmountMax('');
              }}
            >
              <BtnText color="#6B7280">Clear filters</BtnText>
            </Button>
          </YStack>
        </Card>

        {loading ? (
          <ActivityIndicator size="small" style={{ padding: 20 }} />
        ) : filtered.length === 0 ? (
          <Card>
            <YStack padding="$4" alignItems="center" gap="$3">
              <Ionicons name="calculator-outline" size={64} color="#ccc" />
              <TText color="$muted" textAlign="center" fontSize={16} fontWeight="600">
                No matching calculations
              </TText>
              <TText color="$muted" fontSize="$3" textAlign="center">
                Try clearing filters or saving a new calculation.
              </TText>
            </YStack>
          </Card>
        ) : (
          filtered.map((c) => (
            <YStack key={c.id} marginBottom="$3">
              <Card>
                <YStack padding="$3" gap="$3">
                  <XStack justifyContent="space-between" alignItems="flex-start">
                    <YStack flex={1}>
                      <View
                        style={{
                          backgroundColor:
                            c.type === 'transfer'
                              ? '#E3F2FD'
                              : c.type === 'bond'
                                ? '#FFF3E0'
                                : '#F3E5F5',
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 8,
                          alignSelf: 'flex-start',
                          marginBottom: 8,
                        }}
                      >
                        <TText fontSize={12} fontWeight="700" style={{ textTransform: 'uppercase', color: '#0A5C3B' }}>
                          {c.type}
                        </TText>
                      </View>
                      {c.name ? <TText fontWeight="700" fontSize={18} color="$color">{c.name}</TText> : null}
                    </YStack>
                    <TText fontSize={12} color="$muted">
                      {c.createdAt?.seconds
                        ? new Date(c.createdAt.seconds * 1000).toLocaleDateString('en-ZA', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : ''}
                    </TText>
                  </XStack>

                  <View style={{ backgroundColor: '#F9F9F9', padding: 12, borderRadius: 8 }}>
                    <TText fontWeight="700" fontSize={14} color="$brand" marginBottom="$2">
                      Key Details
                    </TText>
                    {Object.entries(c.inputs || {})
                      .slice(0, 3)
                      .map(([k, v]) => (
                        <XStack key={k} justifyContent="space-between" marginBottom="$1">
                          <TText fontSize={13} color="$muted" style={{ textTransform: 'capitalize' }}>
                            {k.replace(/([A-Z])/g, ' $1').trim()}
                          </TText>
                          <TText fontSize={13} fontWeight="600" color="$color">
                            {typeof v === 'number' ? formatZAR(v) : String(v)}
                          </TText>
                        </XStack>
                      ))}
                  </View>

                  {c.result && Object.keys(c.result).length > 0 ? (
                    <View style={{ backgroundColor: '#E8F5E9', padding: 12, borderRadius: 8 }}>
                      <TText fontWeight="700" fontSize={14} color="$brand" marginBottom="$2">
                        Results
                      </TText>
                      {Object.entries(c.result)
                        .slice(0, 2)
                        .map(([k, v]) => (
                          <XStack key={k} justifyContent="space-between" marginBottom="$1">
                            <TText fontSize={13} color="$muted" style={{ textTransform: 'capitalize' }}>
                              {k.replace(/([A-Z])/g, ' $1').trim()}
                            </TText>
                            <TText fontSize={14} fontWeight="700" color="$brand">
                              {typeof v === 'number' ? formatZAR(v) : String(v)}
                            </TText>
                          </XStack>
                        ))}
                    </View>
                  ) : null}

                  {c.pdfUrl ? (
                    <TouchableOpacity
                      onPress={() => {
                        import('expo-web-browser').then((WebBrowser) => {
                          WebBrowser.openBrowserAsync(c.pdfUrl);
                        });
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        backgroundColor: '#0A5C3B',
                        paddingVertical: 10,
                        borderRadius: 8,
                      }}
                    >
                      <Ionicons name="document-text" size={18} color="white" />
                      <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>View PDF</Text>
                    </TouchableOpacity>
                  ) : null}
                </YStack>
              </Card>
            </YStack>
          ))
        )}
      </ScrollView>
      <QuickNavBar />
    </View>
  );
}
