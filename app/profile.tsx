import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Text as TText, XStack, YStack } from 'tamagui';
import { heroImages } from '../assets/images';
import { BtnText, Button } from '../components/Button';
import { Card } from '../components/Card';
import { ConfirmActionModal } from '../components/ConfirmActionModal';
import { Field } from '../components/Field';
import { HeroImage } from '../components/HeroImage';
import { QuickNavBar } from '../components/Navigation';
import { useAuth } from '../contexts/auth-context';
import { formatZAR } from '../lib/money';
import { fetchMyCalculations } from '../utils/firebase';

export default function Profile(){
  const router = useRouter();
  const { user, logout, updateAccountDetails, changePassword, deactivateAccount } = useAuth();
  const [calcs, setCalcs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [accountUsername, setAccountUsername] = useState('');
  const [accountFirstName, setAccountFirstName] = useState('');
  const [accountSurname, setAccountSurname] = useState('');
  const [accountPhoneNumber, setAccountPhoneNumber] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [confirmDeactivateVisible, setConfirmDeactivateVisible] = useState(false);

  const roleLabel = user?.role === 'admin' ? 'Admin' : user?.role === 'agent' ? 'Realtor' : 'Homeowner';

  useEffect(() => {
    if (!user) return;
    setAccountUsername(user.username || user.email?.split('@')[0] || '');
    setAccountFirstName(user.firstName || '');
    setAccountSurname(user.surname || '');
    setAccountPhoneNumber(user.phoneNumber || '');
  }, [user?.uid]);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    fetchMyCalculations()
      .then(r => { if (mounted) setCalcs(r as any[]); })
      .catch(err => console.error("Error fetching calculations:", err))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [user]);

  if (!user) {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <HeroImage 
          source={heroImages.profile}
          title="My Profile"
          subtitle="Sign in to view your saved calculations"
          height={180}
          overlayOpacity={0.55}
        />
        
        <Card>
          <YStack gap="$4" padding="$2">
            <TText color="$muted" textAlign="center">Sign in to view your profile and saved calculations.</TText>
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
        {/* Welcome Header */}
        <YStack marginBottom="$4" paddingTop="$2">
          <TText fontSize={28} fontWeight="700" color="$brand" fontFamily="Poppins_700Bold">
            My Profile
          </TText>
          <TText fontSize={16} color="$muted" marginTop="$1" fontFamily="Poppins_400Regular">
            {user.displayName || user.email?.split('@')[0] || 'User'} • {roleLabel}
          </TText>
        </YStack>

        {/* User Info Card */}
        <Card>
          <XStack padding="$4" gap="$3" alignItems="center" backgroundColor="#F5F5F5" borderRadius="$4">
            <YStack
              width={64}
              height={64}
              borderRadius="$12"
              backgroundColor="$brand"
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons name="person" size={32} color="white" />
            </YStack>
            <YStack flex={1}>
              <TText fontWeight="700" fontSize="$5">{user.displayName || 'User'}</TText>
              <TText color="$muted" fontSize="$3" marginTop="$1">{user.email}</TText>
              <XStack gap="$2" marginTop="$2" alignItems="center">
                <View style={{ backgroundColor: '#0A5C3B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                  <TText color="white" fontSize={12} fontWeight="600">{roleLabel}</TText>
                </View>
                <View style={{ backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                  <TText color="$brand" fontSize={12} fontWeight="600">{calcs.length} saved</TText>
                </View>
              </XStack>
            </YStack>
          </XStack>
        </Card>

        {/* Account Details */}
        <Card title="Account Details" subtitle="Update your personal details">
          <YStack gap="$3" marginTop="$2">
            <Field
              label="Username"
              value={accountUsername}
              onChangeText={setAccountUsername}
              autoCapitalize="none"
              placeholder="username"
            />
            <XStack gap="$2">
              <YStack flex={1}>
                <Field
                  label="Name"
                  value={accountFirstName}
                  onChangeText={setAccountFirstName}
                  autoCapitalize="words"
                  placeholder="First name"
                />
              </YStack>
              <YStack flex={1}>
                <Field
                  label="Surname"
                  value={accountSurname}
                  onChangeText={setAccountSurname}
                  autoCapitalize="words"
                  placeholder="Surname"
                />
              </YStack>
            </XStack>
            <Field
              label="Phone Number (Optional)"
              value={accountPhoneNumber}
              onChangeText={setAccountPhoneNumber}
              keyboardType="phone-pad"
              placeholder=""
            />

            <YStack gap="$1">
              <TText color="$muted" fontSize={12}>Email</TText>
              <TText fontSize={14} fontWeight="600">{user.email}</TText>
            </YStack>
            <YStack gap="$1">
              <TText color="$muted" fontSize={12}>Current Role</TText>
              <TText fontSize={14} fontWeight="600">{roleLabel}</TText>
            </YStack>

            <Button
              onPress={async () => {
                setSavingAccount(true);
                try {
                  await updateAccountDetails({
                    username: accountUsername.trim() || undefined,
                    firstName: accountFirstName.trim() || undefined,
                    surname: accountSurname.trim() || undefined,
                    phoneNumber: accountPhoneNumber.trim() || '',
                  });
                  Alert.alert('Saved', 'Your account details were updated.');
                } catch (e: any) {
                  Alert.alert('Update failed', e?.message ?? 'Could not update your details');
                } finally {
                  setSavingAccount(false);
                }
              }}
              opacity={savingAccount ? 0.7 : 1}
            >
              <BtnText>{savingAccount ? 'Saving...' : 'Save Changes'}</BtnText>
            </Button>
          </YStack>
        </Card>

        {/* Change Password */}
        <Card title="Change Password" subtitle="For security, we never show your current password">
          <YStack gap="$3" marginTop="$2">
            <Field
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholder="Enter your current password"
            />
            <Field
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholder="At least 6 characters"
            />
            <Field
              label="Confirm New Password"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholder="Re-enter the new password"
            />
            <Button
              onPress={async () => {
                if (!currentPassword || !newPassword || !confirmNewPassword) {
                  return Alert.alert('Missing info', 'Please complete all password fields.');
                }
                if (newPassword.length < 6) {
                  return Alert.alert('Weak password', 'Password must be at least 6 characters.');
                }
                if (newPassword !== confirmNewPassword) {
                  return Alert.alert('Passwords do not match', 'Please confirm your new password.');
                }
                setChangingPassword(true);
                try {
                  await changePassword(currentPassword, newPassword);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                  Alert.alert('Success', 'Your password has been updated.');
                } catch (e: any) {
                  Alert.alert('Password change failed', e?.message ?? 'Could not update password');
                } finally {
                  setChangingPassword(false);
                }
              }}
              opacity={changingPassword ? 0.7 : 1}
            >
              <BtnText>{changingPassword ? 'Updating...' : 'Update Password'}</BtnText>
            </Button>
          </YStack>
        </Card>

        {/* Legal */}
        <Card title="Legal" subtitle="Read our legal disclaimer">
          <Button variant="secondary" onPress={() => router.push('/legal')}> 
            <XStack gap="$2" alignItems="center" justifyContent="center">
              <Ionicons name="document-text-outline" size={18} color="#0A5C3B" />
              <BtnText color="$brand">View Legal Disclaimer</BtnText>
            </XStack>
          </Button>
        </Card>

        {/* Deactivate Account */}
        <Card title="Deactivate Account" subtitle="This will disable access to your account">
          <YStack gap="$3" marginTop="$2">
            <TText color="$muted" fontSize={13}>
              Deactivating your account will sign you out and prevent further access. If you want to re-activate, you may need to contact support.
            </TText>
            <Button backgroundColor="#DC3545" onPress={() => setConfirmDeactivateVisible(true)}>
              <XStack gap="$2" alignItems="center" justifyContent="center">
                <Ionicons name="warning-outline" size={18} color="white" />
                <BtnText>Deactivate Account</BtnText>
              </XStack>
            </Button>
          </YStack>
        </Card>

        {/* Saved Calculations Section */}
        <YStack marginTop="$4">
          <TText fontSize={20} fontWeight="700" color="$brand" marginBottom="$3" fontFamily="Poppins_700Bold">
            Saved Calculations
          </TText>
          {loading ? (
            <ActivityIndicator size="small" style={{ padding: 20 }} />
          ) : calcs.length === 0 ? (
            <Card>
              <YStack padding="$4" alignItems="center" gap="$3">
                <Ionicons name="calculator-outline" size={64} color="#ccc" />
                <TText color="$muted" textAlign="center" fontSize={16} fontWeight="600">No saved calculations yet</TText>
                <TText color="$muted" fontSize="$3" textAlign="center">Use our calculators and tap "Save to Profile" to keep a record.</TText>
              </YStack>
            </Card>
          ) : (
            calcs.map(c => (
              <YStack key={c.id} marginBottom="$3">
                <Card>
                <YStack padding="$3" gap="$3">
                  <XStack justifyContent="space-between" alignItems="flex-start">
                    <YStack flex={1}>
                      <View style={{ 
                        backgroundColor: c.type === 'transfer' ? '#E3F2FD' : c.type === 'bond' ? '#FFF3E0' : '#F3E5F5',
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 8,
                        alignSelf: 'flex-start',
                        marginBottom: 8
                      }}>
                        <TText fontSize={12} fontWeight="700" style={{ textTransform: 'uppercase', color: '#0A5C3B' }}>
                          {c.type}
                        </TText>
                      </View>
                      {c.name && (
                        <TText fontWeight="700" fontSize={18} color="$color">{c.name}</TText>
                      )}
                    </YStack>
                    <TText fontSize={12} color="$muted">
                      {c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1000).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </TText>
                  </XStack>

                  <View style={{ backgroundColor: '#F9F9F9', padding: 12, borderRadius: 8 }}>
                    <TText fontWeight="700" fontSize={14} color="$brand" marginBottom="$2">Key Details</TText>
                    {Object.entries(c.inputs || {}).slice(0, 3).map(([k, v]) => (
                      <XStack key={k} justifyContent="space-between" marginBottom="$1">
                        <TText fontSize={13} color="$muted" style={{ textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</TText>
                        <TText fontSize={13} fontWeight="600" color="$color">
                          {typeof v === 'number' ? formatZAR(v) : String(v)}
                        </TText>
                      </XStack>
                    ))}
                  </View>

                  {c.result && Object.keys(c.result).length > 0 && (
                    <View style={{ backgroundColor: '#E8F5E9', padding: 12, borderRadius: 8 }}>
                      <TText fontWeight="700" fontSize={14} color="$brand" marginBottom="$2">Results</TText>
                      {Object.entries(c.result).slice(0, 2).map(([k, v]) => (
                        <XStack key={k} justifyContent="space-between" marginBottom="$1">
                          <TText fontSize={13} color="$muted" style={{ textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</TText>
                          <TText fontSize={14} fontWeight="700" color="$brand">
                            {typeof v === 'number' ? formatZAR(v) : String(v)}
                          </TText>
                        </XStack>
                      ))}
                    </View>
                  )}

                  {c.pdfUrl && (
                    <TouchableOpacity
                      onPress={() => {
                        import('expo-web-browser').then(WebBrowser => {
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
                        borderRadius: 8
                      }}
                    >
                      <Ionicons name="document-text" size={18} color="white" />
                      <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>View PDF</Text>
                    </TouchableOpacity>
                  )}
                </YStack>
              </Card>
              </YStack>
            ))
          )}
        </YStack>

        <Button 
          marginTop="$4"
          backgroundColor="#DC3545"
          onPress={async () => {
            await logout().catch(() => {});
            router.replace('/');
          }}
        >
          <XStack gap="$2" alignItems="center">
            <Ionicons name="log-out-outline" size={20} color="white" />
            <BtnText>Sign Out</BtnText>
          </XStack>
        </Button>
      </ScrollView>
      <QuickNavBar />

      <ConfirmActionModal
        visible={confirmDeactivateVisible}
        title="Deactivate account?"
        message="This will disable your account and sign you out. You may need to contact support to re-activate."
        confirmText="Deactivate"
        cancelText="Cancel"
        onCancel={() => setConfirmDeactivateVisible(false)}
        onConfirm={async () => {
          setConfirmDeactivateVisible(false);
          try {
            await deactivateAccount();
            router.replace('/');
          } catch (e: any) {
            Alert.alert('Deactivation failed', e?.message ?? 'Could not deactivate account');
          }
        }}
      />
    </View>
  );
}


