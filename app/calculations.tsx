import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { Text as TText, XStack, YStack } from 'tamagui';
import { heroImages } from '../assets/images';
import { AmountField } from '../components/AmountField';
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
  const cleaned = input.replace(/\s|,|R/g, '');
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
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 380;

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
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const sortedAndRanked = useMemo(() => {
    return [...filtered]
      .map((calc) => {
        const resultAmount = extractResultAmount(calc?.result);
        return {
          ...calc,
          sortValue: resultAmount ?? 0,
        };
      })
      .sort((a, b) => b.sortValue - a.sortValue) // Highest to lowest
      .map((calc, index) => ({
        ...calc,
        rank: index + 1,
      }));
  }, [filtered]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (type !== 'all') count++;
    if (month) count++;
    if (fromDate || toDate) count++;
    if (priceMin || priceMax) count++;
    if (amountMin || amountMax) count++;
    return count;
  }, [type, month, fromDate, toDate, priceMin, priceMax, amountMin, amountMax]);

  const clearAllFilters = () => {
    setType('all');
    setMonth('');
    setFromDate('');
    setToDate('');
    setPriceMin('');
    setPriceMax('');
    setAmountMin('');
    setAmountMax('');
  };

  const setDatePreset = (preset: 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'all') => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    switch (preset) {
      case 'last7': {
        const from = new Date(today);
        from.setDate(from.getDate() - 7);
        setFromDate(`${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}-${String(from.getDate()).padStart(2, '0')}`);
        setToDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
        setMonth('');
        break;
      }
      case 'last30': {
        const from = new Date(today);
        from.setDate(from.getDate() - 30);
        setFromDate(`${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}-${String(from.getDate()).padStart(2, '0')}`);
        setToDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
        setMonth('');
        break;
      }
      case 'thisMonth': {
        setMonth(`${year}-${String(month + 1).padStart(2, '0')}`);
        setFromDate('');
        setToDate('');
        break;
      }
      case 'lastMonth': {
        const lastMonth = month === 0 ? 11 : month - 1;
        const lastMonthYear = month === 0 ? year - 1 : year;
        setMonth(`${lastMonthYear}-${String(lastMonth + 1).padStart(2, '0')}`);
        setFromDate('');
        setToDate('');
        break;
      }
      case 'all': {
        setMonth('');
        setFromDate('');
        setToDate('');
        break;
      }
    }
  };

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
            {/* Calculation Type Filter */}
            <YStack gap="$2">
              <TText color="$muted" fontSize={12}>
                Calculation Type
              </TText>
              <Segmented
                options={['all', 'transfer', 'bond', 'repayment']}
                value={type}
                onChange={(v) => setType(v as CalcType)}
              />
            </YStack>

            {/* Quick Date Presets */}
            <YStack gap="$2">
              <TText color="$muted" fontSize={12}>
                Quick Date Filter
              </TText>
              <XStack gap="$2" flexWrap="wrap">
                <TouchableOpacity
                  onPress={() => setDatePreset('last7')}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: (fromDate && toDate && !month) ? '#0A5C3B' : '#F3F4F6',
                    borderWidth: 1,
                    borderColor: (fromDate && toDate && !month) ? '#0A5C3B' : '#E5E7EB',
                  }}
                >
                  <TText
                    fontSize={12}
                    fontWeight="600"
                    color={(fromDate && toDate && !month) ? '#FFFFFF' : '#6B7280'}
                  >
                    Last 7 days
                  </TText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setDatePreset('last30')}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: (fromDate && toDate && !month) ? '#F3F4F6' : '#F3F4F6',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                >
                  <TText fontSize={12} fontWeight="600" color="#6B7280">
                    Last 30 days
                  </TText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setDatePreset('thisMonth')}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: month ? '#0A5C3B' : '#F3F4F6',
                    borderWidth: 1,
                    borderColor: month ? '#0A5C3B' : '#E5E7EB',
                  }}
                >
                  <TText
                    fontSize={12}
                    fontWeight="600"
                    color={month ? '#FFFFFF' : '#6B7280'}
                  >
                    This month
                  </TText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setDatePreset('lastMonth')}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: '#F3F4F6',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                >
                  <TText fontSize={12} fontWeight="600" color="#6B7280">
                    Last month
                  </TText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setDatePreset('all')}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: (!month && !fromDate && !toDate) ? '#0A5C3B' : '#F3F4F6',
                    borderWidth: 1,
                    borderColor: (!month && !fromDate && !toDate) ? '#0A5C3B' : '#E5E7EB',
                  }}
                >
                  <TText
                    fontSize={12}
                    fontWeight="600"
                    color={(!month && !fromDate && !toDate) ? '#FFFFFF' : '#6B7280'}
                  >
                    All time
                  </TText>
                </TouchableOpacity>
              </XStack>
            </YStack>

            {/* Advanced Filters Toggle */}
            <TouchableOpacity
              onPress={() => setShowAdvanced(!showAdvanced)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 8,
                paddingHorizontal: 4,
              }}
            >
              <XStack gap="$2" alignItems="center">
                <TText fontSize={14} fontWeight="600" color="$brand">
                  Advanced Filters
                </TText>
                {activeFilterCount > 0 && (
                  <View
                    style={{
                      backgroundColor: '#0A5C3B',
                      borderRadius: 12,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      minWidth: 20,
                      alignItems: 'center',
                    }}
                  >
                    <TText fontSize={11} fontWeight="700" color="#FFFFFF">
                      {activeFilterCount}
                    </TText>
                  </View>
                )}
              </XStack>
              <Ionicons
                name={showAdvanced ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#0A5C3B"
              />
            </TouchableOpacity>

            {/* Advanced Filters - Collapsible */}
            {showAdvanced && (
              <YStack gap="$3" paddingTop="$2">
                <Field
                  label="Specific Month (YYYY-MM)"
                  value={month}
                  onChangeText={setMonth}
                  autoCapitalize="none"
                  placeholder="e.g. 2026-01"
                />

                <XStack gap="$2">
                  <YStack flex={1}>
                    <Field
                      label="From Date"
                      value={fromDate}
                      onChangeText={setFromDate}
                      autoCapitalize="none"
                      placeholder="YYYY-MM-DD"
                    />
                  </YStack>
                  <YStack flex={1}>
                    <Field
                      label="To Date"
                      value={toDate}
                      onChangeText={setToDate}
                      autoCapitalize="none"
                      placeholder="YYYY-MM-DD"
                    />
                  </YStack>
                </XStack>

                <YStack gap="$1">
                  <TText color="$muted" fontSize={12}>
                    Input Amount Range (Property Price / Bond Amount)
                  </TText>
                  <XStack gap="$2">
                    <YStack flex={1}>
                      <AmountField
                        label=""
                        value={priceMin}
                        onChangeText={setPriceMin}
                        keyboardType="numeric"
                        placeholder="500 000"
                      />
                    </YStack>
                    <YStack flex={1}>
                      <AmountField
                        label=""
                        value={priceMax}
                        onChangeText={setPriceMax}
                        keyboardType="numeric"
                        placeholder="5 000 000"
                      />
                    </YStack>
                  </XStack>
                </YStack>

                <YStack gap="$1">
                  <TText color="$muted" fontSize={12}>
                    Result Amount Range (Total Costs / Monthly Payment)
                  </TText>
                  <XStack gap="$2">
                    <YStack flex={1}>
                      <AmountField
                        label=""
                        value={amountMin}
                        onChangeText={setAmountMin}
                        keyboardType="numeric"
                        placeholder="10 000"
                      />
                    </YStack>
                    <YStack flex={1}>
                      <AmountField
                        label=""
                        value={amountMax}
                        onChangeText={setAmountMax}
                        keyboardType="numeric"
                        placeholder="200 000"
                      />
                    </YStack>
                  </XStack>
                </YStack>
              </YStack>
            )}

            {/* Clear Filters Button */}
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                borderColor="#DC3545"
                backgroundColor="#FFF5F5"
                hoverStyle={{ backgroundColor: '#FEE2E2', borderColor: '#DC3545' }}
                onPress={clearAllFilters}
              >
                <XStack gap="$2" alignItems="center" justifyContent="center">
                  <Ionicons name="close-circle-outline" size={18} color="#DC3545" />
                  <BtnText color="#DC3545">Clear All Filters ({activeFilterCount})</BtnText>
                </XStack>
              </Button>
            )}
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
          sortedAndRanked.map((c) => {
            const isTopThree = c.rank <= 3;
            const rankColors = {
              1: { bg: '#0A5C3B', text: '#FFFFFF', icon: '#FFD700' }, // Gold for #1
              2: { bg: '#31B276', text: '#FFFFFF', icon: '#C0C0C0' }, // Silver for #2
              3: { bg: '#E8F5E9', text: '#0A5C3B', icon: '#CD7F32' }, // Bronze for #3
              default: { bg: '#FFFFFF', text: '#0A5C3B', icon: '#0A5C3B' },
            };
            const colors = isTopThree ? rankColors[c.rank as keyof typeof rankColors] : rankColors.default;
            const resultAmount = extractResultAmount(c?.result);

            return (
              <YStack key={c.id} marginBottom="$3">
                <Card>
                  <YStack padding="$3" gap="$3">
                    {/* Ranking Header */}
                    <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
                      <XStack alignItems="center" gap="$2" flex={1}>
                        {/* Rank Badge */}
                        <View
                          style={{
                            width: isTopThree ? (isSmallDevice ? 36 : 48) : (isSmallDevice ? 32 : 40),
                            height: isTopThree ? (isSmallDevice ? 36 : 48) : (isSmallDevice ? 32 : 40),
                            borderRadius: isTopThree ? 24 : 20,
                            backgroundColor: colors.bg,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: isTopThree ? 2 : 1,
                            borderColor: isTopThree ? colors.icon : '#0A5C3B',
                            shadowColor: isTopThree ? colors.icon : 'transparent',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: isTopThree ? 0.3 : 0,
                            shadowRadius: 4,
                            elevation: isTopThree ? 5 : 0,
                          }}
                        >
                          {isTopThree ? (
                            <Ionicons
                              name={c.rank === 1 ? 'trophy' : c.rank === 2 ? 'medal' : 'medal-outline'}
                              size={c.rank === 1 ? (isSmallDevice ? 18 : 24) : (isSmallDevice ? 16 : 20)}
                              color={colors.icon}
                            />
                          ) : (
                            <TText fontSize={isSmallDevice ? 12 : 16} fontWeight="700" color={colors.text}>
                              #{c.rank}
                            </TText>
                          )}
                        </View>

                        {/* Type Badge */}
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
                          }}
                        >
                          <TText fontSize={12} fontWeight="700" style={{ textTransform: 'uppercase', color: '#0A5C3B' }}>
                            {c.type}
                          </TText>
                        </View>
                      </XStack>

                      {/* Main Amount Display */}
                      <YStack alignItems="flex-end" flexShrink={1} marginLeft="$2">
                        {resultAmount !== undefined && (
                          <>
                            <TText fontSize={10} color="$muted" fontWeight="500" numberOfLines={1}>
                              {c.rank === 1 ? 'Highest' : c.rank === sortedAndRanked.length ? 'Lowest' : ''}
                            </TText>
                            <TText
                              fontSize={isTopThree ? (isSmallDevice ? 16 : 20) : (isSmallDevice ? 14 : 16)}
                              fontWeight="700"
                              color={isTopThree ? '#0A5C3B' : '$brand'}
                              numberOfLines={1}
                              style={{ flexShrink: 1 }}
                            >
                              {formatZAR(resultAmount)}
                            </TText>
                          </>
                        )}
                      </YStack>
                    </XStack>

                    {/* Name and Date */}
                    <XStack justifyContent="space-between" alignItems="flex-start">
                      <YStack flex={1}>
                        {c.name ? (
                          <TText fontWeight="700" fontSize={18} color="$color" marginBottom="$1">
                            {c.name}
                          </TText>
                        ) : null}
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

                    {/* Key Details */}
                    <View style={{ backgroundColor: '#F9F9F9', padding: 12, borderRadius: 8 }}>
                      <TText fontWeight="700" fontSize={14} color="$brand" marginBottom="$2">
                        Key Details
                      </TText>
                      {Object.entries(c.inputs || {})
                        .slice(0, 3)
                        .map(([k, v]) => (
                          <XStack key={k} justifyContent="space-between" marginBottom="$1" gap="$2">
                            <TText fontSize={isSmallDevice ? 10 : 12} color="$muted" flex={1} style={{ textTransform: 'capitalize' }}>
                              {k.replace(/([A-Z])/g, ' $1').trim()}
                            </TText>
                            <TText fontSize={isSmallDevice ? 10 : 12} fontWeight="600" color="$color" textAlign="right">
                              {typeof v === 'number' ? formatZAR(v) : String(v)}
                            </TText>
                          </XStack>
                        ))}
                    </View>

                    {/* Results Section */}
                    {c.result && Object.keys(c.result).length > 0 ? (
                      <View style={{ backgroundColor: '#E8F5E9', padding: 12, borderRadius: 8 }}>
                        <TText fontWeight="700" fontSize={14} color="$brand" marginBottom="$2">
                          Results
                        </TText>
                        {Object.entries(c.result)
                          .slice(0, 2)
                          .map(([k, v]) => (
                            <XStack key={k} justifyContent="space-between" marginBottom="$1" gap="$2">
                              <TText fontSize={isSmallDevice ? 10 : 12} color="$muted" flex={1} style={{ textTransform: 'capitalize' }}>
                                {k.replace(/([A-Z])/g, ' $1').trim()}
                              </TText>
                              <TText fontSize={isSmallDevice ? 11 : 12} fontWeight="700" color="$brand" textAlign="right">
                                {typeof v === 'number' ? formatZAR(v) : String(v)}
                              </TText>
                            </XStack>
                          ))}
                      </View>
                    ) : null}

                    {/* Action Buttons */}
                    <XStack gap="$2" marginTop="$2">
                      {c.pdfUrl ? (
                        <>
                          <TouchableOpacity
                            onPress={() => {
                              import('expo-web-browser').then((WebBrowser) => {
                                WebBrowser.openBrowserAsync(c.pdfUrl);
                              });
                            }}
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              backgroundColor: '#E8F5E9',
                              paddingVertical: 10,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: '#0A5C3B',
                            }}
                          >
                            <Ionicons name="eye-outline" size={18} color="#0A5C3B" />
                            <Text style={{ color: '#0A5C3B', fontWeight: '600', fontSize: 13 }}>View</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={async () => {
                              if (Platform.OS === 'web') {
                                window.open(c.pdfUrl, '_blank');
                                return;
                              }

                              try {
                                const filename = `Calculation_${c.name || c.id}.pdf`.replace(/\s+/g, '_');
                                const fileUri = FileSystem.cacheDirectory + filename;

                                const downloadResumable = FileSystem.createDownloadResumable(
                                  c.pdfUrl,
                                  fileUri
                                );

                                const result = await downloadResumable.downloadAsync();
                                if (result) {
                                  await Sharing.shareAsync(result.uri, {
                                    mimeType: 'application/pdf',
                                    dialogTitle: 'PnP Calculation PDF',
                                    UTI: 'com.adobe.pdf'
                                  });
                                }
                              } catch (error) {
                                console.error('Error sharing PDF:', error);
                                Alert.alert('Error', 'Could not prepare the PDF for sharing.');
                              }
                            }}
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              backgroundColor: '#0A5C3B',
                              paddingVertical: 10,
                              borderRadius: 8,
                            }}
                          >
                            <Ionicons name="share-outline" size={18} color="white" />
                            <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>Share/Save</Text>
                          </TouchableOpacity>
                        </>
                      ) : null}
                    </XStack>
                  </YStack>
                </Card>
              </YStack>
            );
          })
        )}
      </ScrollView>
      <QuickNavBar />
    </View>
  );
}
