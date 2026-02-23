import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, useWindowDimensions, View } from 'react-native';
import { Text as TText, XStack, YStack } from 'tamagui';
import { heroImages } from '../assets/images';
import { BtnText, Button } from '../components/Button';
import { Card } from '../components/Card';
import { ConfirmActionModal } from '../components/ConfirmActionModal';
import { Field } from '../components/Field';
import { HeroImage } from '../components/HeroImage';
import { QuickNavBar } from '../components/Navigation';
import theme from '../config/theme.json';
import { useAuth } from '../contexts/auth-context';
import { fetchMyCalculations } from '../utils/firebase';

export default function Profile(){
  const router = useRouter();
  const { user, logout, updateAccountDetails, changePassword, deactivateAccount } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
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

  const getRoleLabel = (user: { role?: string; userType?: string } | null | undefined) => {
    if (!user) return 'Homeowner';
    if (user.role === 'admin') return 'Admin';
    if (user.role === 'agent') {
      if (user.userType === 'developer') return 'Developer';
      return 'Estate Agent'; // Default for estate-agent or legacy
    }
    return 'Homeowner';
  };

  const roleLabel = getRoleLabel(user);

  const openWhatsApp = () => {
    const msg =
      `Hi Pather & Pather, I'd like to chat to a conveyancer.\n` +
      (user?.displayName ? `Name: ${user.displayName}\n` : '') +
      (user?.email ? `Email: ${user.email}\n` : '');
    const url = `https://wa.me/${theme.whatsappNumber}?text=${encodeURIComponent(msg)}`;

    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

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
        <View
          style={{
            height: windowWidth < 480 ? 200 : 220,
            borderRadius: 16,
            overflow: 'hidden',
            justifyContent: 'flex-end',
            marginBottom: 16,
            shadowColor: 'rgba(0,0,0,0.15)',
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 3,
          }}
        >
          <Image
            source={require('../assets/new-images/my-profile-image.png')}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            contentFit="cover"
            contentPosition="center"
          />

          <LinearGradient
            colors={['rgba(30,30,30,0)', 'rgba(30,30,30,0.4)', 'rgba(30,30,30,0.82)']}
            locations={[0, 0.5, 1]}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, pointerEvents: 'none' }}
          />

          <YStack paddingHorizontal={14} paddingBottom={14} gap="$2">
            <YStack
              alignSelf="flex-start"
              backgroundColor="rgba(255,255,255,0.18)"
              borderColor="rgba(255,255,255,0.22)"
              borderWidth={1}
              paddingHorizontal={10}
              paddingVertical={6}
              borderRadius={999}
            >
              <TText color="#FFFFFF" fontSize={14} fontWeight="700">
                My Profile
              </TText>
            </YStack>

            <TText
              style={{
                fontSize: 20,
                fontWeight: '800',
                color: '#FFFFFF',
                textShadowColor: 'rgba(0,0,0,0.35)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 6,
                textDecorationLine: 'none',
              }}
            >
              {user.displayName || user.email?.split('@')[0] || 'User'}
            </TText>

            <TText style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.92)' }}>
              {roleLabel}
            </TText>
          </YStack>
        </View>

        <YStack gap="$3" marginBottom={16}>
          <Button backgroundColor="#25D366" borderColor="#25D366" onPress={openWhatsApp}>
            <XStack gap="$2" alignItems="center" justifyContent="center">
              <Ionicons name="logo-whatsapp" size={20} color="white" />
              <BtnText>Chat to a Conveyancer</BtnText>
            </XStack>
          </Button>

          <Button backgroundColor="#000" borderColor="#000" onPress={() => router.push('/services')}>
            <XStack gap="$2" alignItems="center" justifyContent="center">
              <Ionicons name="grid-outline" size={18} color="white" />
              <BtnText>View Other Services</BtnText>
            </XStack>
          </Button>
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
              <TText fontWeight="700" fontSize="$5" color="#034c21" textDecorationLine="none">{user.displayName || 'User'}</TText>
              <TText color="$muted" fontSize="$3" marginTop="$1" textDecorationLine="none">{user.email}</TText>
              <XStack gap="$2" marginTop="$2" alignItems="center">
                <View style={{ backgroundColor: '#0A5C3B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                  <TText color="white" fontSize={14} fontWeight="600">{roleLabel}</TText>
                </View>
                <View style={{ backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                  <TText color="$brand" fontSize={14} fontWeight="600">{calcs.length} saved</TText>
                </View>
              </XStack>
            </YStack>
          </XStack>
        </Card>

        <Card title="Saved Calculations" subtitle="View and filter your saved calculator results">
          <YStack gap="$3" marginTop="$2">
            <Button
              onPress={() => router.push('/calculations')}
              opacity={loading ? 0.7 : 1}
            >
              <XStack gap="$2" alignItems="center" justifyContent="center">
                <Ionicons name="calculator-outline" size={18} color="white" />
                <BtnText>{loading ? 'Loading…' : 'View Saved Calculations'}</BtnText>
              </XStack>
            </Button>
          </YStack>
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
              <TText color="$muted" fontSize={14}>Email</TText>
              <TText fontSize="$3" fontWeight="600" textDecorationLine="none">{user.email}</TText>
            </YStack>
            <YStack gap="$1">
              <TText color="$muted" fontSize={14}>Current Role</TText>
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
            <TText color="$muted" fontSize={14}>
              Deactivating your account will sign you out and prevent further access. If you want to re-activate, you may need to contact support.
            </TText>
            <Button backgroundColor="#B02A37" borderColor="#B02A37" onPress={() => setConfirmDeactivateVisible(true)}>
              <XStack gap="$2" alignItems="center" justifyContent="center">
                <Ionicons name="warning-outline" size={18} color="white" />
                <BtnText>Deactivate Account</BtnText>
              </XStack>
            </Button>
          </YStack>
        </Card>

        <Button 
          marginTop="$4"
          backgroundColor="#B02A37"
          borderColor="#B02A37"
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


