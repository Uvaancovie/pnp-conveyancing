import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/auth-context';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserRole } from '../types/auth';

interface CalculationHistory {
  id: string;
  type: 'transfer' | 'bond' | 'repayment';
  timestamp: Date;
  data: any;
  total: number;
}

export default function ProfileScreen() {
  const { user, logout, updateRole } = useAuth();
  const router = useRouter();
  const [calculations, setCalculations] = useState<CalculationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingRole, setChangingRole] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    // Only load calculation history for agents
    if (user.role !== 'agent') {
      setCalculations([]);
      setLoading(false);
      return;
    }

    loadCalculationHistory();
  }, [user]);

  const loadCalculationHistory = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const history = userData.calculationHistory || [];
        setCalculations(history.map((calc: any) => ({
          ...calc,
          timestamp: calc.timestamp.toDate()
        })));
      }
    } catch (error) {
      console.error('Error loading calculation history:', error);
      Alert.alert('Error', 'Failed to load calculation history');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleRoleChange = async (newRole: UserRole) => {
    if (!user || newRole === user.role) return;

    Alert.alert(
      'Change Role',
      `Are you sure you want to change your role to ${newRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setChangingRole(true);
            try {
              await updateRole(newRole);
              Alert.alert('Success', `Your role has been changed to ${newRole}.`);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to change role');
            } finally {
              setChangingRole(false);
            }
          }
        }
      ]
    );
  };

  const formatCurrency = (amount: number): string =>
    `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (date: Date): string =>
    date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const getCalculationTypeIcon = (type: string) => {
    switch (type) {
      case 'transfer': return 'calculator';
      case 'bond': return 'home';
      case 'repayment': return 'trending-up';
      default: return 'document';
    }
  };

  const getCalculationTypeLabel = (type: string) => {
    switch (type) {
      case 'transfer': return 'Transfer Cost';
      case 'bond': return 'Bond Cost';
      case 'repayment': return 'Repayment';
      default: return type;
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2C5530" />
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Ionicons 
            name={user.role === 'agent' ? 'briefcase' : 'person'} 
            size={48} 
            color="#2C5530" 
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.displayName}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <Text style={styles.profileRole}>
              {user.role === 'agent' ? 'Agent' : 'Customer'}
            </Text>
          </View>
        </View>

        {/* Role Change */}
        <View style={styles.roleSection}>
          <Text style={styles.sectionTitle}>Account Role</Text>
          <Text style={styles.roleDescription}>
            Change your account type. Agents can view calculation history and manage leads.
          </Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                user.role === 'customer' && styles.roleButtonActive
              ]}
              onPress={() => handleRoleChange('customer')}
              disabled={changingRole}
            >
              <Ionicons name="person" size={20} color={user.role === 'customer' ? '#fff' : '#2C5530'} />
              <Text style={[
                styles.roleButtonText,
                user.role === 'customer' && styles.roleButtonTextActive
              ]}>
                Customer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                user.role === 'agent' && styles.roleButtonActive
              ]}
              onPress={() => handleRoleChange('agent')}
              disabled={changingRole}
            >
              <Ionicons name="briefcase" size={20} color={user.role === 'agent' ? '#fff' : '#2C5530'} />
              <Text style={[
                styles.roleButtonText,
                user.role === 'agent' && styles.roleButtonTextActive
              ]}>
                Agent
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{calculations.length}</Text>
          <Text style={styles.statLabel}>Total Calculations</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {calculations.length > 0 ?
              formatCurrency(calculations.reduce((sum, calc) => sum + calc.total, 0)) :
              'R 0.00'
            }
          </Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>

      {/* Calculation History (agents only) */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Calculation History</Text>

        {user?.role !== 'agent' ? (
          <View style={styles.emptyState}>
            <Ionicons name="lock-closed" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>Agents only</Text>
            <Text style={styles.emptyText}>
              Calculation history is available to registered agents only. If you are a conveyancer,
              please register as an agent to view and manage calculation history.
            </Text>
            <Link href="/register" asChild>
              <TouchableOpacity style={styles.startButton}>
                <Text style={styles.startButtonText}>Register as an Agent</Text>
              </TouchableOpacity>
            </Link>
          </View>
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : calculations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No calculations yet</Text>
            <Text style={styles.emptyText}>
              Your calculation history will appear here once leads or calculations are associated with your account.
            </Text>
            <Link href="/transfer" asChild>
              <TouchableOpacity style={styles.startButton}>
                <Text style={styles.startButtonText}>Start Calculating</Text>
              </TouchableOpacity>
            </Link>
          </View>
        ) : (
          <View style={styles.historyList}>
            {calculations
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
              .map((calc) => (
                <View key={calc.id} style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    <Ionicons
                      name={getCalculationTypeIcon(calc.type)}
                      size={24}
                      color="#2C5530"
                    />
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyType}>
                      {getCalculationTypeLabel(calc.type)}
                    </Text>
                    <Text style={styles.historyDate}>
                      {formatDate(calc.timestamp)}
                    </Text>
                  </View>
                  <View style={styles.historyAmount}>
                    <Text style={styles.historyTotal}>
                      {formatCurrency(calc.total)}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5530',
    marginLeft: 8,
  },
  logoutButton: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C5530',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#999',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C5530',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  historySection: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C5530',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C5530',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#2C5530',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  historyContent: {
    flex: 1,
  },
  historyType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5530',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
  },
  historyAmount: {
    alignItems: 'flex-end',
  },
  historyTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C5530',
  },
  roleSection: {
    marginTop: 16,
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2C5530',
    backgroundColor: '#fff',
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: '#2C5530',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5530',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
});