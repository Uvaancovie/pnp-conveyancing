import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/auth-context';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* User Info Bar */}
      {user && (
        <View style={styles.userBar}>
          <View style={styles.userInfo}>
            <Ionicons 
              name={user.role === 'agent' ? 'briefcase' : 'person'} 
              size={24} 
              color="#2C5530" 
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>Welcome, {user.displayName}</Text>
              <Text style={styles.userRole}>
                {user.role === 'agent' ? 'Agent' : 'Customer'}
              </Text>
            </View>
          </View>
          <View style={styles.userActions}>
            {user.role === 'agent' && (
              <Link href="/profile" asChild>
                <TouchableOpacity style={styles.profileButton}>
                  <Ionicons name="person-circle" size={24} color="#2C5530" />
                </TouchableOpacity>
              </Link>
            )}
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!user && (
        <View style={styles.authBar}>
          <TouchableOpacity 
            style={styles.loginButtonSmall}
            onPress={() => router.push('/login' as any)}
          >
            <Ionicons name="log-in" size={18} color="#2C5530" />
            <Text style={styles.loginButtonSmallText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.registerButtonSmall}
            onPress={() => router.push('/register' as any)}
          >
            <Text style={styles.registerButtonSmallText}>Register</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>PnP Conveyancer</Text>
        <Text style={styles.heroSubtitle}>Your Trusted Property Transfer Partner</Text>
        <Text style={styles.heroDescription}>
          Calculate your transfer costs, bond costs, and monthly repayments instantly with our easy-to-use calculators.
        </Text>
        <View style={styles.credibilityBadge}>
          <Ionicons name="shield-checkmark" size={20} color="#2C5530" />
          <Text style={styles.credibilityText}>
            Using Official SARS April 2025 Rates • LSSA/LPC Attorney Fee Schedule
          </Text>
        </View>
      </View>

      {/* Info / FAQ Section */}
      <View style={styles.infoSection}>
        <Ionicons name="help-circle-outline" size={32} color="#2C5530" />
        <Text style={styles.infoSectionTitle}>New to Conveyancing?</Text>
        <Text style={styles.infoSectionText}>
          Understand the process, costs, and key terms involved in property transfers.
        </Text>
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => router.push('/info' as any)}
        >
          <Text style={styles.infoButtonText}>Learn More</Text>
        </TouchableOpacity>
      </View>

      {/* Features Grid */}
      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Our Services</Text>
        
        <Link href="/transfer" asChild>
          <TouchableOpacity style={styles.featureCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="calculator" size={40} color="#2C5530" />
            </View>
            <Text style={styles.featureTitle}>Transfer Cost Calculator</Text>
            <Text style={styles.featureDescription}>
              Get an instant breakdown of all property transfer costs including attorney fees, deeds office fees, and transfer duty.
            </Text>
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Calculate Now</Text>
              <Ionicons name="arrow-forward" size={20} color="#2C5530" />
            </View>
          </TouchableOpacity>
        </Link>

        <Link href="/bond" asChild>
          <TouchableOpacity style={styles.featureCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="home" size={40} color="#2C5530" />
            </View>
            <Text style={styles.featureTitle}>Bond Cost Calculator</Text>
            <Text style={styles.featureDescription}>
              Calculate once-off bond registration costs including attorney fees and deeds office fees.
            </Text>
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Calculate Now</Text>
              <Ionicons name="arrow-forward" size={20} color="#2C5530" />
            </View>
          </TouchableOpacity>
        </Link>

        <Link href="/repayment" asChild>
          <TouchableOpacity style={styles.featureCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="trending-up" size={40} color="#2C5530" />
            </View>
            <Text style={styles.featureTitle}>Bond Repayment Calculator</Text>
            <Text style={styles.featureDescription}>
              Calculate your monthly bond repayments and see the total interest you'll pay over the loan term.
            </Text>
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Calculate Now</Text>
              <Ionicons name="arrow-forward" size={20} color="#2C5530" />
            </View>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Why Choose Us Section */}
      <View style={styles.whyChooseSection}>
        <Text style={styles.sectionTitle}>Why Choose PnP Conveyancer?</Text>
        
        <View style={styles.benefitRow}>
          <Ionicons name="checkmark-circle" size={24} color="#2C5530" />
          <Text style={styles.benefitText}>Transparent pricing with no hidden fees</Text>
        </View>
        
        <View style={styles.benefitRow}>
          <Ionicons name="checkmark-circle" size={24} color="#2C5530" />
          <Text style={styles.benefitText}>Instant calculations based on current regulations</Text>
        </View>
        
        <View style={styles.benefitRow}>
          <Ionicons name="checkmark-circle" size={24} color="#2C5530" />
          <Text style={styles.benefitText}>Professional service with expert guidance</Text>
        </View>
        
        <View style={styles.benefitRow}>
          <Ionicons name="checkmark-circle" size={24} color="#2C5530" />
          <Text style={styles.benefitText}>Quick and easy lead submission via WhatsApp</Text>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Ready to Get Started?</Text>
        <Text style={styles.ctaDescription}>
          Use our calculators to get an instant quote for your property transfer needs.
        </Text>
        <Link href="/transfer" asChild>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={24} color="#2C5530" />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Download App Section */}
      <View style={styles.downloadSection}>
        <View style={styles.downloadHeader}>
          <Ionicons name="phone-portrait" size={48} color="#2C5530" />
          <Text style={styles.downloadTitle}>Get the Mobile App</Text>
          <Text style={styles.downloadDescription}>
            Download the PnP Conveyancer app directly to your device.
            Calculate costs on the go and submit leads directly from your phone.
          </Text>
        </View>

        <View style={styles.downloadButtons}>
          {/* iOS Download */}
          <TouchableOpacity 
            style={styles.storeButton}
            onPress={() => {
              // Direct download link for iOS (will be generated by Expo)
              const iosUrl = 'https://expo.dev/artifacts/eas/your-build-id.ipa'; // Replace with actual build URL
              if (typeof window !== 'undefined') {
                window.open(iosUrl, '_blank');
              } else {
                alert('Download the app from the App Store or visit our website on a browser');
              }
            }}
          >
            <View style={styles.storeButtonContent}>
              <Ionicons name="logo-apple" size={32} color="#fff" />
              <View style={styles.storeButtonText}>
                <Text style={styles.storeButtonSubtext}>Download for</Text>
                <Text style={styles.storeButtonTitle}>iOS (iPhone)</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Android Download */}
          <TouchableOpacity 
            style={styles.storeButton}
            onPress={() => {
              // Direct download link for Android APK (will be generated by Expo)
              const androidUrl = '/downloads/pnp-conveyancer.apk'; // Will point to your hosted APK
              if (typeof window !== 'undefined') {
                window.location.href = androidUrl;
              } else {
                alert('Download the app from Google Play or visit our website on a browser');
              }
            }}
          >
            <View style={styles.storeButtonContent}>
              <Ionicons name="logo-android" size={32} color="#fff" />
              <View style={styles.storeButtonText}>
                <Text style={styles.storeButtonSubtext}>Download for</Text>
                <Text style={styles.storeButtonTitle}>Android (APK)</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Installation Instructions */}
        <View style={styles.installInstructions}>
          <Text style={styles.instructionsTitle}>Installation Instructions</Text>
          
          <View style={styles.instructionCard}>
            <View style={styles.instructionHeader}>
              <Ionicons name="logo-android" size={24} color="#2C5530" />
              <Text style={styles.instructionPlatform}>Android Installation</Text>
            </View>
            <Text style={styles.instructionStep}>1. Tap "Download for Android" above</Text>
            <Text style={styles.instructionStep}>2. Open the downloaded APK file</Text>
            <Text style={styles.instructionStep}>3. Enable "Install from Unknown Sources" if prompted</Text>
            <Text style={styles.instructionStep}>4. Tap "Install" and wait for completion</Text>
          </View>

          <View style={styles.instructionCard}>
            <View style={styles.instructionHeader}>
              <Ionicons name="logo-apple" size={24} color="#2C5530" />
              <Text style={styles.instructionPlatform}>iOS Installation</Text>
            </View>
            <Text style={styles.instructionStep}>1. Tap "Download for iOS" above</Text>
            <Text style={styles.instructionStep}>2. Follow the TestFlight installation prompts</Text>
            <Text style={styles.instructionStep}>3. Or download directly from the App Store</Text>
            <Text style={styles.instructionNote}>
              Note: iOS requires apps to be signed. We recommend using the App Store version.
            </Text>
          </View>
        </View>

        <View style={styles.appFeatures}>
          <View style={styles.appFeatureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#2C5530" />
            <Text style={styles.appFeatureText}>Free to download and use</Text>
          </View>
          <View style={styles.appFeatureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#2C5530" />
            <Text style={styles.appFeatureText}>Real-time calculations</Text>
          </View>
          <View style={styles.appFeatureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#2C5530" />
            <Text style={styles.appFeatureText}>Save your calculations</Text>
          </View>
          <View style={styles.appFeatureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#2C5530" />
            <Text style={styles.appFeatureText}>Direct WhatsApp integration</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2025 PnP Conveyancer. All rights reserved.
        </Text>
        <Text style={styles.disclaimerText}>
          Legal Disclaimer: These calculations are estimates only. Actual costs may vary. 
          Please consult with a qualified conveyancer for accurate quotations.
        </Text>
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
  heroSection: {
    backgroundColor: '#2C5530',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 20,
    color: '#e8f5e9',
    marginBottom: 16,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 16,
    color: '#e8f5e9',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 600,
  },
  credibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
    gap: 8,
  },
  credibilityText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  featuresContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C5530',
    marginBottom: 24,
    textAlign: 'center',
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C5530',
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5530',
  },
  whyChooseSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  benefitText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  ctaSection: {
    backgroundColor: '#2C5530',
    marginHorizontal: 24,
    marginTop: 40,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 16,
    color: '#e8f5e9',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C5530',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  userBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userDetails: {
    flexDirection: 'column',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userRole: {
    fontSize: 13,
    color: '#666',
    textTransform: 'capitalize',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileButton: {
    padding: 8,
  },
  logoutButton: {
    padding: 8,
  },
  authBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  loginButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  loginButtonSmallText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C5530',
  },
  registerButtonSmall: {
    backgroundColor: '#2C5530',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  registerButtonSmallText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  downloadSection: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 24,
    paddingVertical: 50,
    marginTop: 40,
    alignItems: 'center',
  },
  downloadHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  downloadTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C5530',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  downloadDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 600,
  },
  downloadButtons: {
    flexDirection: width > 600 ? 'row' : 'column',
    gap: 16,
    marginBottom: 32,
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeButton: {
    backgroundColor: '#2C5530',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  storeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storeButtonText: {
    flexDirection: 'column',
  },
  storeButtonSubtext: {
    fontSize: 11,
    color: '#e8f5e9',
    marginBottom: 2,
  },
  storeButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  appFeatures: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  appFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  appFeatureText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  installInstructions: {
    width: '100%',
    maxWidth: 700,
    marginTop: 32,
    gap: 20,
  },
  instructionsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C5530',
    textAlign: 'center',
    marginBottom: 16,
  },
  instructionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  instructionPlatform: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C5530',
  },
  instructionStep: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  instructionNote: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    lineHeight: 20,
  },
  /* Info section styles */
  infoSection: {
    backgroundColor: '#e8f5e9',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1e7dd',
  },
  infoSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C5530',
    marginTop: 12,
  },
  infoSectionText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    maxWidth: 600,
  },
  infoButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderWidth: 2,
    borderColor: '#2C5530',
  },
  infoButtonText: {
    color: '#2C5530',
    fontSize: 16,
    fontWeight: '600',
  },
});