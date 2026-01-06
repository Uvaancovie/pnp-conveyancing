import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { BtnText, Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Field } from '../../components/Field';
import { useAuth } from '../../contexts/auth-context';
import {
  getAdminDashboardToken,
  loginAdminDashboard,
  setAdminDashboardToken,
  verifyAdminDashboardToken,
} from '../../utils/adminDashboardAuth';

// Firebase imports - initialize directly to avoid module loading issues
import { getApp, getApps, initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore, orderBy, query } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDgyr9c1-1qlmMftGjdWNUyWv2eqvUNP4w",
  authDomain: "pnp-conveyancer.firebaseapp.com",
  projectId: "pnp-conveyancer",
  storageBucket: "pnp-conveyancer.firebasestorage.app",
  messagingSenderId: "223625627019",
  appId: "1:223625627019:web:a01d3da9084abe2e5c5b8e",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Local fetch functions
async function fetchAllUsers() {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(s => ({ id: s.id, ...(s.data() as any) }));
  } catch (err) {
    console.error('fetchAllUsers error:', err);
    // Fallback without ordering
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(s => ({ id: s.id, ...(s.data() as any) }));
  }
}

async function fetchUserCalculations(uid: string) {
  try {
    const q = query(collection(db, 'users', uid, 'calculations'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(s => ({ id: s.id, ...(s.data() as any) }));
  } catch (err) {
    console.error('fetchUserCalculations error:', err);
    // Fallback without ordering
    const snap = await getDocs(collection(db, 'users', uid, 'calculations'));
    return snap.docs.map(s => ({ id: s.id, ...(s.data() as any) }));
  }
}

// Simple bar component for charts (works on web and native)
function SimpleBar({ label, value, maxValue, color = '#0A5C3B' }: { label: string; value: number; maxValue: number; color?: string }) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <YStack marginBottom="$2">
      <XStack justifyContent="space-between" marginBottom="$1">
        <Text fontSize="$2" color="$muted">{label}</Text>
        <Text fontSize="$2" fontWeight="700">{value}</Text>
      </XStack>
      <View style={{ height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${percentage}%`, backgroundColor: color, borderRadius: 4 }} />
      </View>
    </YStack>
  );
}

// KPI Card component
function KPICard({ title, value, subtitle, icon, color = '#0A5C3B' }: { title: string; value: string | number; subtitle?: string; icon: string; color?: string }) {
  return (
    <YStack 
      backgroundColor="$card" 
      padding="$4" 
      borderRadius="$4" 
      borderWidth={1} 
      borderColor="$border"
      flex={1}
      minWidth={150}
    >
      <XStack alignItems="center" gap="$2" marginBottom="$2">
        <Ionicons name={icon as any} size={20} color={color} />
        <Text fontSize="$2" color="$muted">{title}</Text>
      </XStack>
      <Text fontSize="$7" fontWeight="700" color={color}>{value}</Text>
      {subtitle && <Text fontSize="$2" color="$muted" marginTop="$1">{subtitle}</Text>}
    </YStack>
  );
}

interface UserWithCalcs {
  id: string;
  email: string;
  displayName?: string;
  role?: string;
  createdAt?: any;
  calculations: any[];
}

interface DashboardStats {
  totalUsers: number;
  totalCalculations: number;
  transferCalcs: number;
  bondCalcs: number;
  repaymentCalcs: number;
  avgCalcsPerUser: number;
  totalPropertyValue: number;
  totalBondValue: number;
  usersThisMonth: number;
  calcsThisMonth: number;
  usersByMonth: { month: string; count: number }[];
  calcsByType: { type: string; count: number }[];
  topUsers: { name: string; email: string; calcCount: number }[];
  recentActivity: { user: string; type: string; date: Date; value?: number }[];
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserWithCalcs[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [gateLoading, setGateLoading] = useState(true);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminAuthBusy, setAdminAuthBusy] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics'>('overview');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    // Require a signed-in app user before admin access.
    if (!user) {
      router.replace('/login');
      return;
    }

    // If the user already has the admin role, allow immediately.
    if (user.role === 'admin') {
      setAdminAuthed(true);
      setGateLoading(false);
      loadDashboardData();
      return;
    }

    // Otherwise, require the admin dashboard username/password token.
    (async () => {
      try {
        const token = await getAdminDashboardToken();
        if (!token) {
          setAdminAuthed(false);
          return;
        }

        const ok = await verifyAdminDashboardToken(token);
        setAdminAuthed(ok);
        if (ok) {
          loadDashboardData();
        }
      } catch {
        setAdminAuthed(false);
      } finally {
        setGateLoading(false);
      }
    })();
  }, [user?.uid, user?.role, authLoading]);

  async function handleAdminLogin() {
    if (!adminUsername.trim() || !adminPassword) {
      setAdminAuthError('Enter username and password.');
      return;
    }

    setAdminAuthBusy(true);
    setAdminAuthError(null);
    try {
      const token = await loginAdminDashboard(adminUsername.trim(), adminPassword);
      await setAdminDashboardToken(token);
      setAdminAuthed(true);
      await loadDashboardData();
    } catch {
      setAdminAuthError('Invalid username or password.');
      setAdminAuthed(false);
    } finally {
      setAdminAuthBusy(false);
      setGateLoading(false);
    }
  }

  async function loadDashboardData() {
    try {
      console.log('Loading dashboard data...');
      const allUsers = await fetchAllUsers();
      
      console.log('Fetched users:', allUsers.length);
      
      // Fetch calculations for each user
      const usersWithCalcs: UserWithCalcs[] = await Promise.all(
        allUsers.map(async (u: any) => {
          try {
            const calcs = await fetchUserCalculations(u.id);
            return { ...u, calculations: calcs || [] };
          } catch (err) {
            console.warn('Error fetching calcs for user:', u.id, err);
            return { ...u, calculations: [] };
          }
        })
      );
      
      setUsers(usersWithCalcs);
      calculateStats(usersWithCalcs);
    } catch (err: any) {
      console.error("Error loading dashboard data:", err);
      
      // Show helpful error message
      if (err.code === 'permission-denied') {
        alert('Firebase Permission Error: Please update your Firestore Security Rules.\n\nIn Firebase Console > Firestore Database > Rules, add:\n\nmatch /users/{userId} {\n  allow read: if true;\n  match /calculations/{calcId} {\n    allow read: if true;\n  }\n}');
      }
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(usersData: UserWithCalcs[]) {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    let totalCalcs = 0;
    let transferCalcs = 0;
    let bondCalcs = 0;
    let repaymentCalcs = 0;
    let totalPropertyValue = 0;
    let totalBondValue = 0;
    let calcsThisMonth = 0;
    const recentActivity: DashboardStats['recentActivity'] = [];
    
    // Process all calculations
    usersData.forEach(u => {
      totalCalcs += u.calculations.length;
      
      u.calculations.forEach((calc: any) => {
        const calcDate = calc.createdAt?.seconds 
          ? new Date(calc.createdAt.seconds * 1000) 
          : new Date();
        
        if (calc.type === 'transfer') {
          transferCalcs++;
          if (calc.inputs?.price) totalPropertyValue += calc.inputs.price;
        } else if (calc.type === 'bond') {
          bondCalcs++;
          if (calc.inputs?.amount) totalBondValue += calc.inputs.amount;
        } else if (calc.type === 'repayment') {
          repaymentCalcs++;
          if (calc.inputs?.principal) totalBondValue += calc.inputs.principal;
        }
        
        if (calcDate.getMonth() === thisMonth && calcDate.getFullYear() === thisYear) {
          calcsThisMonth++;
        }
        
        // Add to recent activity
        if (recentActivity.length < 10) {
          recentActivity.push({
            user: u.displayName || u.email || 'Unknown',
            type: calc.type,
            date: calcDate,
            value: calc.inputs?.price || calc.inputs?.amount || calc.inputs?.principal
          });
        }
      });
    });
    
    // Sort recent activity by date
    recentActivity.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    // Users this month
    const usersThisMonth = usersData.filter(u => {
      if (!u.createdAt?.seconds) return false;
      const date = new Date(u.createdAt.seconds * 1000);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    }).length;
    
    // Users by month (last 6 months)
    const usersByMonth: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(thisYear, thisMonth - i, 1);
      const monthName = d.toLocaleDateString('en-ZA', { month: 'short' });
      const count = usersData.filter(u => {
        if (!u.createdAt?.seconds) return false;
        const date = new Date(u.createdAt.seconds * 1000);
        return date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear();
      }).length;
      usersByMonth.push({ month: monthName, count });
    }
    
    // Top users by calculation count
    const topUsers = [...usersData]
      .sort((a, b) => b.calculations.length - a.calculations.length)
      .slice(0, 5)
      .map(u => ({
        name: u.displayName || 'Unnamed',
        email: u.email,
        calcCount: u.calculations.length
      }));
    
    setStats({
      totalUsers: usersData.length,
      totalCalculations: totalCalcs,
      transferCalcs,
      bondCalcs,
      repaymentCalcs,
      avgCalcsPerUser: usersData.length > 0 ? Math.round((totalCalcs / usersData.length) * 10) / 10 : 0,
      totalPropertyValue,
      totalBondValue,
      usersThisMonth,
      calcsThisMonth,
      usersByMonth,
      calcsByType: [
        { type: 'Transfer', count: transferCalcs },
        { type: 'Bond', count: bondCalcs },
        { type: 'Repayment', count: repaymentCalcs }
      ],
      topUsers,
      recentActivity
    });
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `R${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `R${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R${(value / 1000).toFixed(0)}K`;
    return `R${value}`;
  };

  if (authLoading || gateLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
        <ActivityIndicator size="large" color="#0A5C3B" />
        <Text color="$muted" marginTop="$3">Loading dashboard...</Text>
      </YStack>
    );
  }

  if (!adminAuthed) {
    return (
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <YStack gap="$4">
          <YStack marginBottom="$2">
            <Text fontSize="$7" fontWeight="700" color="$brand">Admin Access</Text>
            <Text color="$muted">Enter admin dashboard credentials to continue.</Text>
          </YStack>

          <Card>
            <YStack gap="$3">
              <Field
                label="Admin Username"
                value={adminUsername}
                onChangeText={setAdminUsername}
                placeholder="Username"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Field
                label="Admin Password"
                value={adminPassword}
                onChangeText={setAdminPassword}
                placeholder="Password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              {adminAuthError ? (
                <Text color="$red10" fontSize="$2">{adminAuthError}</Text>
              ) : null}

              <Button onPress={handleAdminLogin} disabled={adminAuthBusy}>
                <BtnText>{adminAuthBusy ? 'Signing in…' : 'Sign In'}</BtnText>
              </Button>
            </YStack>
          </Card>
        </YStack>
      </ScrollView>
    );
  }

  if (loading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
        <ActivityIndicator size="large" color="#0A5C3B" />
        <Text color="$muted" marginTop="$3">Loading dashboard...</Text>
      </YStack>
    );
  }

  const maxCalcsByType = Math.max(...(stats?.calcsByType.map(c => c.count) || [1]));
  const maxUsersByMonth = Math.max(...(stats?.usersByMonth.map(m => m.count) || [1]));

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      {/* Header */}
      <YStack marginBottom="$4">
        <Text fontSize="$7" fontWeight="700" color="$brand">Business Intelligence</Text>
        <Text color="$muted">Real-time analytics & insights</Text>
      </YStack>

      {/* Tab Navigation */}
      <XStack gap="$2" marginBottom="$4">
        {(['overview', 'users', 'analytics'] as const).map(tab => (
          <TouchableOpacity 
            key={tab} 
            onPress={() => setActiveTab(tab)}
            style={{ flex: 1 }}
          >
            <YStack 
              backgroundColor={activeTab === tab ? '$brand' : '$card'}
              padding="$3"
              borderRadius="$3"
              alignItems="center"
              borderWidth={1}
              borderColor={activeTab === tab ? '$brand' : '$border'}
            >
              <Text 
                color={activeTab === tab ? 'white' : '$muted'} 
                fontWeight="700"
                textTransform="capitalize"
              >
                {tab}
              </Text>
            </YStack>
          </TouchableOpacity>
        ))}
      </XStack>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <YStack gap="$4">
          {/* KPI Row 1 */}
          <XStack gap="$3" flexWrap="wrap">
            <KPICard 
              title="Total Users" 
              value={stats.totalUsers} 
              subtitle={`+${stats.usersThisMonth} this month`}
              icon="people" 
            />
            <KPICard 
              title="Total Calculations" 
              value={stats.totalCalculations}
              subtitle={`+${stats.calcsThisMonth} this month`}
              icon="calculator" 
              color="#31B276"
            />
          </XStack>

          {/* KPI Row 2 */}
          <XStack gap="$3" flexWrap="wrap">
            <KPICard 
              title="Property Value" 
              value={formatCurrency(stats.totalPropertyValue)}
              subtitle="Total calculated"
              icon="home" 
              color="#E67E22"
            />
            <KPICard 
              title="Bond Value" 
              value={formatCurrency(stats.totalBondValue)}
              subtitle="Total calculated"
              icon="cash" 
              color="#9B59B6"
            />
          </XStack>

          {/* Calculations by Type */}
          <Card title="Calculations by Type" subtitle="Distribution of calculator usage">
            {stats.calcsByType.map((item, i) => (
              <SimpleBar 
                key={i}
                label={item.type}
                value={item.count}
                maxValue={maxCalcsByType}
                color={item.type === 'Transfer' ? '#0A5C3B' : item.type === 'Bond' ? '#31B276' : '#E67E22'}
              />
            ))}
          </Card>

          {/* Recent Activity */}
          <Card title="Recent Activity" subtitle="Latest calculations">
            {stats.recentActivity.length === 0 ? (
              <Text color="$muted" textAlign="center" padding="$4">No recent activity</Text>
            ) : (
              stats.recentActivity.slice(0, 5).map((activity, i) => (
                <XStack 
                  key={i}
                  padding="$2"
                  borderBottomWidth={i < 4 ? 1 : 0}
                  borderBottomColor="$border"
                  alignItems="center"
                  gap="$3"
                >
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: activity.type === 'transfer' ? '#0A5C3B' : activity.type === 'bond' ? '#31B276' : '#E67E22',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Ionicons 
                      name={activity.type === 'transfer' ? 'swap-horizontal' : activity.type === 'bond' ? 'document-text' : 'trending-up'} 
                      size={16} 
                      color="white" 
                    />
                  </View>
                  <YStack flex={1}>
                    <Text fontSize="$3" fontWeight="600">{activity.user}</Text>
                    <Text fontSize="$2" color="$muted">
                      {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} calculation
                      {activity.value ? ` • ${formatCurrency(activity.value)}` : ''}
                    </Text>
                  </YStack>
                  <Text fontSize="$2" color="$muted">
                    {activity.date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                  </Text>
                </XStack>
              ))
            )}
          </Card>
        </YStack>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <YStack gap="$4">
          {/* User Stats */}
          <XStack gap="$3" flexWrap="wrap">
            <KPICard 
              title="Avg Calcs/User" 
              value={stats?.avgCalcsPerUser || 0}
              icon="analytics" 
            />
            <KPICard 
              title="New This Month" 
              value={stats?.usersThisMonth || 0}
              icon="person-add" 
              color="#31B276"
            />
          </XStack>

          {/* User Growth Chart */}
          <Card title="User Growth" subtitle="New registrations by month">
            {stats?.usersByMonth.map((item, i) => (
              <SimpleBar 
                key={i}
                label={item.month}
                value={item.count}
                maxValue={maxUsersByMonth || 1}
                color="#0A5C3B"
              />
            ))}
          </Card>

          {/* Top Users */}
          <Card title="Top Users" subtitle="By calculation count">
            {stats?.topUsers.map((u, i) => (
              <XStack 
                key={i}
                padding="$3"
                borderBottomWidth={i < (stats?.topUsers.length || 0) - 1 ? 1 : 0}
                borderBottomColor="$border"
                alignItems="center"
                gap="$3"
              >
                <View style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#0A5C3B',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Text color="white" fontWeight="700" fontSize="$2">{i + 1}</Text>
                </View>
                <YStack flex={1}>
                  <Text fontWeight="600">{u.name}</Text>
                  <Text fontSize="$2" color="$muted">{u.email}</Text>
                </YStack>
                <Text fontWeight="700" color="$brand">{u.calcCount} calcs</Text>
              </XStack>
            ))}
          </Card>

          {/* All Users List */}
          <Card title="All Users" subtitle={`${users.length} registered`}>
            {users.map((u, i) => (
              <TouchableOpacity 
                key={u.id} 
                onPress={() => router.push(`/admin/user/${u.id}`)}
              >
                <XStack 
                  padding="$3"
                  borderBottomWidth={i < users.length - 1 ? 1 : 0}
                  borderBottomColor="$border"
                  alignItems="center"
                  gap="$3"
                >
                  <View style={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: 20, 
                    backgroundColor: '#0A5C3B',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Text color="white" fontWeight="700">
                      {(u.displayName || u.email || 'U')[0].toUpperCase()}
                    </Text>
                  </View>
                  <YStack flex={1}>
                    <Text fontWeight="600">{u.displayName || 'Unnamed User'}</Text>
                    <Text fontSize="$2" color="$muted">{u.email}</Text>
                  </YStack>
                  <YStack alignItems="flex-end">
                    <Text fontSize="$3" fontWeight="700" color="$brand">{u.calculations.length}</Text>
                    <Text fontSize="$1" color="$muted">calcs</Text>
                  </YStack>
                  <Ionicons name="chevron-forward" size={16} color="#ccc" />
                </XStack>
              </TouchableOpacity>
            ))}
          </Card>
        </YStack>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && stats && (
        <YStack gap="$4">
          {/* Value Metrics */}
          <Card title="Financial Overview" subtitle="Total values from calculations">
            <YStack gap="$4" padding="$2">
              <YStack>
                <Text fontSize="$2" color="$muted">Total Property Value Calculated</Text>
                <Text fontSize="$6" fontWeight="700" color="#0A5C3B">
                  {formatCurrency(stats.totalPropertyValue)}
                </Text>
              </YStack>
              <YStack>
                <Text fontSize="$2" color="$muted">Total Bond Value Calculated</Text>
                <Text fontSize="$6" fontWeight="700" color="#31B276">
                  {formatCurrency(stats.totalBondValue)}
                </Text>
              </YStack>
              <YStack>
                <Text fontSize="$2" color="$muted">Average Property Value</Text>
                <Text fontSize="$5" fontWeight="700" color="#E67E22">
                  {stats.transferCalcs > 0 
                    ? formatCurrency(Math.round(stats.totalPropertyValue / stats.transferCalcs))
                    : 'N/A'}
                </Text>
              </YStack>
            </YStack>
          </Card>

          {/* Calculator Usage Breakdown */}
          <Card title="Calculator Usage" subtitle="Percentage breakdown">
            {stats.calcsByType.map((item, i) => {
              const percentage = stats.totalCalculations > 0 
                ? Math.round((item.count / stats.totalCalculations) * 100) 
                : 0;
              return (
                <XStack 
                  key={i}
                  padding="$3"
                  borderBottomWidth={i < stats.calcsByType.length - 1 ? 1 : 0}
                  borderBottomColor="$border"
                  alignItems="center"
                  gap="$3"
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: item.type === 'Transfer' ? '#0A5C3B' : item.type === 'Bond' ? '#31B276' : '#E67E22',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Ionicons 
                      name={item.type === 'Transfer' ? 'swap-horizontal' : item.type === 'Bond' ? 'document-text' : 'trending-up'} 
                      size={20} 
                      color="white" 
                    />
                  </View>
                  <YStack flex={1}>
                    <Text fontWeight="600">{item.type}</Text>
                    <Text fontSize="$2" color="$muted">{item.count} calculations</Text>
                  </YStack>
                  <YStack alignItems="flex-end">
                    <Text fontSize="$5" fontWeight="700">{percentage}%</Text>
                  </YStack>
                </XStack>
              );
            })}
          </Card>

          {/* Key Insights */}
          <Card title="Key Insights" subtitle="Business intelligence summary">
            <YStack gap="$3" padding="$2">
              <XStack alignItems="center" gap="$2">
                <Ionicons name="bulb" size={20} color="#FFD700" />
                <Text flex={1} fontSize="$3">
                  {stats.transferCalcs > stats.bondCalcs 
                    ? 'Transfer calculator is the most popular tool'
                    : stats.bondCalcs > stats.repaymentCalcs
                    ? 'Bond calculator is getting the most usage'
                    : 'Repayment calculator is trending'}
                </Text>
              </XStack>
              <XStack alignItems="center" gap="$2">
                <Ionicons name="trending-up" size={20} color="#31B276" />
                <Text flex={1} fontSize="$3">
                  Average of {stats.avgCalcsPerUser} calculations per user
                </Text>
              </XStack>
              <XStack alignItems="center" gap="$2">
                <Ionicons name="people" size={20} color="#0A5C3B" />
                <Text flex={1} fontSize="$3">
                  {stats.usersThisMonth} new user{stats.usersThisMonth !== 1 ? 's' : ''} registered this month
                </Text>
              </XStack>
              {stats.totalPropertyValue > 0 && (
                <XStack alignItems="center" gap="$2">
                  <Ionicons name="home" size={20} color="#E67E22" />
                  <Text flex={1} fontSize="$3">
                    {formatCurrency(stats.totalPropertyValue)} in property values calculated
                  </Text>
                </XStack>
              )}
            </YStack>
          </Card>
        </YStack>
      )}

      {/* Back Button */}
      <YStack marginTop="$4">
        <Button backgroundColor="$brand" onPress={() => router.push('/')}>
          <BtnText>Back to Home</BtnText>
        </Button>
      </YStack>
    </ScrollView>
  );
}
