import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Shield, Copy, CheckCircle, Smartphone, Key } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';
import * as Clipboard from 'expo-clipboard';

export default function TwoFactorSetupScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  // TOTP setup state
  const [totpSecret, setTotpSecret] = useState<string>('');
  const [totpQrCode, setTotpQrCode] = useState<string>('');
  const [totpCode, setTotpCode] = useState('');
  const [totpStep, setTotpStep] = useState<number>(0); // 0=setup, 1=verify, 2=success
  const [totpLoading, setTotpLoading] = useState(false);
  const [totpError, setTotpError] = useState<string>('');
  const [totpFactorId, setTotpFactorId] = useState<string | null>(null);
  const [secretCopied, setSecretCopied] = useState(false);

  // Start 2FA setup process
  const handleSetup2FA = async () => {
    setTotpStep(0);
    setTotpCode('');
    setTotpError('');
    setTotpLoading(true);

    try {
      // Enroll a new TOTP factor
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) {
        // Check if 2FA is already set up
        if (error.message.includes('factor with the friendly name') || 
            error.message.includes('already exists')) {
          setTotpStep(2); // Show success state for already enrolled
          setTotpError(''); // Clear error since this is actually success
          return;
        }
        throw new Error(error.message);
      }

      if (data) {
        setTotpSecret(data.totp.secret);
        setTotpQrCode(data.totp.qr_code);
        setTotpFactorId(data.id);
        setTotpStep(1); // verify
        
        // Debug QR code
        console.log('QR Code URL:', data.totp.qr_code);
        console.log('Secret:', data.totp.secret);
      }
    } catch (err: any) {
      setTotpError(err.message ?? 'Failed to setup 2FA');
      console.error('Setup 2FA error:', err);
    } finally {
      setTotpLoading(false);
    }
  };

  // Verify TOTP code and complete setup
  const handleVerifyCode = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setTotpError('Please enter a valid 6-digit code');
      return;
    }

    setTotpLoading(true);
    setTotpError('');

    try {
      // For TOTP enrollment verification, we need to challenge first
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactorId!,
      });

      if (challengeError) {
        throw new Error(challengeError.message);
      }

      // Now verify with the challenge ID
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: totpFactorId!,
        challengeId: challengeData.id,
        code: totpCode,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        setTotpStep(2); // success
      }
    } catch (err: any) {
      setTotpError(err.message ?? 'Invalid code. Please try again.');
      console.error('Verify TOTP error:', err);
    } finally {
      setTotpLoading(false);
    }
  };

  // Copy secret to clipboard
  const copySecret = async () => {
    try {
      await Clipboard.setStringAsync(totpSecret);
      setSecretCopied(true);
      Alert.alert('✅ Copied!', 'Secret key copied to clipboard successfully!');
      setTimeout(() => setSecretCopied(false), 3000);
    } catch (err) {
      console.error('Copy secret error:', err);
      Alert.alert('📋 Copy Failed', `Please copy this key manually:\n\n${totpSecret}`);
    }
  };

  // Auto-start setup when component mounts
  useEffect(() => {
    handleSetup2FA();
  }, []);

  // Auto-focus on verification input when step changes to scan
  useEffect(() => {
    if (totpStep === 1 && totpQrCode) {
      // Small delay to ensure the input is rendered
      setTimeout(() => {
        // Focus will be handled by autoFocus prop on TextInput
      }, 500);
    }
  }, [totpStep, totpQrCode]);

  const handleBack = () => {
    router.back();
  };

  const handleComplete = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Two-Factor Authentication
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Shield size={48} color={colors.primary} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Secure Your Account
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Add an extra layer of security with two-factor authentication
          </Text>
        </View>

        {/* Loading State */}
        {totpLoading && (
          <View style={[styles.loadingCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '20' }]}>
            <Text style={[styles.loadingText, { color: colors.primary }]}>
              Setting up your authenticator...
            </Text>
          </View>
        )}

        {/* Error State */}
        {totpError ? (
          <View style={[styles.errorCard, { backgroundColor: colors.error + '15', borderColor: colors.error + '30' }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              {totpError}
            </Text>
          </View>
        ) : null}

        {/* Step 0: Initial Setup */}
        {totpStep === 0 && (
          <View style={styles.stepContainer}>
            <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
              <Smartphone size={32} color={colors.primary} style={{ marginBottom: 16 }} />
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                You'll Need an Authenticator App
              </Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Download one of these apps on your mobile device:
              </Text>
              <View style={styles.appList}>
                <Text style={[styles.appItem, { color: colors.text }]}>• Google Authenticator</Text>
                <Text style={[styles.appItem, { color: colors.text }]}>• Microsoft Authenticator</Text>
                <Text style={[styles.appItem, { color: colors.text }]}>• Authy</Text>
                <Text style={[styles.appItem, { color: colors.text }]}>• 1Password</Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleSetup2FA}
              disabled={totpLoading}
              style={[
                styles.primaryButton, 
                { 
                  backgroundColor: totpLoading ? colors.textSecondary : colors.primary,
                  shadowColor: colors.primary
                }
              ]}
            >
              <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                {totpLoading ? 'Setting up...' : 'Continue Setup'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 1: QR Code and Verification */}
        {totpStep === 1 && totpQrCode.length > 0 && (
          <View style={styles.stepContainer}>
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressStep, { backgroundColor: colors.success }]}>
                <Text style={[styles.progressText, { color: colors.background }]}>1</Text>
              </View>
              <View style={[styles.progressLine, { backgroundColor: colors.border }]} />
              <View style={[styles.progressStep, { backgroundColor: colors.primary }]}>
                <Text style={[styles.progressText, { color: colors.background }]}>2</Text>
              </View>
            </View>

            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Scan QR Code
            </Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
              Open your authenticator app and scan this QR code
            </Text>
            
            {/* QR Code with better error handling */}
            <View style={styles.qrContainer}>
              {totpQrCode ? (
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.qrTitle, { color: colors.text }]}>
                    Scan with your authenticator app
                  </Text>
                  <View style={styles.qrImageContainer}>
                    <Image 
                      source={{ uri: totpQrCode }} 
                      style={styles.qrCode} 
                      resizeMode="contain"
                      onError={(error) => {
                        console.error('QR Code Image Error:', error);
                        // Don't show error alert, just fail silently to manual mode
                      }}
                    />
                  </View>
                </View>
              ) : (
                <View style={[styles.qrCode, styles.qrPlaceholder, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.qrPlaceholderText, { color: colors.textSecondary }]}>
                    QR Code Loading...
                  </Text>
                </View>
              )}
            </View>

            {/* Manual Setup Option - Better styled */}
            <View style={[styles.manualSetupCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.manualHeaderContainer, { backgroundColor: colors.primary + '10' }]}>
                <Key size={24} color={colors.primary} />
                <Text style={[styles.manualSetupTitle, { color: colors.text }]}>
                  Manual Setup
                </Text>
              </View>
              
              <Text style={[styles.manualSetupSubtitle, { color: colors.textSecondary }]}>
                Can't scan? Enter this key manually in your authenticator app:
              </Text>
              
              {/* Secret Key Display */}
              <View style={[styles.secretKeyContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.secretKeyLabel, { color: colors.textSecondary }]}>
                  Account Name:
                </Text>
                <Text style={[styles.secretKeyValue, { color: colors.text }]}>
                  Estien Capital
                </Text>
                
                <Text style={[styles.secretKeyLabel, { color: colors.textSecondary }]}>
                  Secret Key:
                </Text>
                <Text style={[styles.secretKeyValue, { color: colors.text }]} selectable={true}>
                  {totpSecret}
                </Text>
              </View>
              
              {/* Copy Button */}
              <TouchableOpacity 
                onPress={copySecret} 
                style={[styles.copyButton, { 
                  backgroundColor: secretCopied ? colors.success + '20' : colors.primary + '20', 
                  borderColor: secretCopied ? colors.success + '40' : colors.primary + '40' 
                }]}
              >
                <Copy size={18} color={secretCopied ? colors.success : colors.primary} />
                <Text style={[styles.copyButtonText, { color: secretCopied ? colors.success : colors.primary }]}>
                  {secretCopied ? '✅ Copied!' : '📋 Copy Key'}
                </Text>
              </TouchableOpacity>
              
              {/* Instructions */}
              <View style={[styles.instructionsContainer, { backgroundColor: colors.background + '80' }]}>
                <Text style={[styles.instructionsTitle, { color: colors.text }]}>
                  Setup Steps:
                </Text>
                <Text style={[styles.instructionStep, { color: colors.textSecondary }]}>
                  1. Open your authenticator app
                </Text>
                <Text style={[styles.instructionStep, { color: colors.textSecondary }]}>
                  2. Choose "Enter a setup key" or "Manual entry"
                </Text>
                <Text style={[styles.instructionStep, { color: colors.textSecondary }]}>
                  3. Enter "Estien Capital" as account name
                </Text>
                <Text style={[styles.instructionStep, { color: colors.textSecondary }]}>
                  4. Paste the secret key from above
                </Text>
                <Text style={[styles.instructionStep, { color: colors.textSecondary }]}>
                  5. Save the entry
                </Text>
              </View>
            </View>

            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Enter Verification Code
            </Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
              Enter the 6-digit code from your authenticator app
            </Text>

            <TextInput
              style={[
                styles.codeInput,
                { 
                  borderColor: totpCode.length === 6 ? colors.success : colors.border,
                  backgroundColor: colors.surface,
                  color: colors.text
                }
              ]}
              placeholder="000000"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              value={totpCode}
              onChangeText={(text) => {
                setTotpCode(text);
                setTotpError(''); // Clear error when user types
              }}
              maxLength={6}
              autoFocus={true}
              selectTextOnFocus={true}
              returnKeyType="done"
              onSubmitEditing={handleVerifyCode}
            />

            <TouchableOpacity 
              onPress={handleVerifyCode}
              disabled={totpLoading || totpCode.length !== 6}
              style={[
                styles.primaryButton,
                { 
                  backgroundColor: (totpLoading || totpCode.length !== 6) ? colors.textSecondary : colors.success,
                  shadowColor: colors.success
                }
              ]}
            >
              <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                {totpLoading ? 'Verifying...' : 'Verify & Enable 2FA'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Success */}
        {totpStep === 2 && (
          <View style={styles.stepContainer}>
            <View style={[styles.successCard, { backgroundColor: colors.success + '15', borderColor: colors.success + '30' }]}>
              <CheckCircle size={64} color={colors.success} style={{ marginBottom: 20 }} />
              <Text style={[styles.successTitle, { color: colors.success }]}>
                🎉 Two-Factor Authentication Setup Complete!
              </Text>
              <Text style={[styles.successText, { color: colors.text }]}>
                Your account is now secured with 2FA. You'll need your authenticator app code every time you log in.
              </Text>
            </View>
            
            <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
              <Shield size={24} color={colors.primary} style={{ marginBottom: 12 }} />
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                What's Next?
              </Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                • Your account is now protected with 2FA{'\n'}
                • Next login will require your password + authenticator code{'\n'}
                • Keep your authenticator app safe{'\n'}
                • You can disable 2FA anytime from your profile
              </Text>
            </View>

            <TouchableOpacity 
              onPress={handleComplete}
              style={[styles.primaryButton, { backgroundColor: colors.success, shadowColor: colors.success }]}
            >
              <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                ✅ All Done! Return to Profile
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'android' ? 16 : 12,
    minHeight: Platform.OS === 'android' ? 64 : 56,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: Platform.OS === 'android' ? 12 : 8,
    borderRadius: 20,
    width: Platform.OS === 'android' ? 44 : 40,
    height: Platform.OS === 'android' ? 44 : 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Platform.OS === 'android' ? 8 : 0,
    paddingRight: Platform.OS === 'android' ? 40 : 48, // Account for back button width
  },
  headerSpacer: {
    width: Platform.OS === 'android' ? 44 : 40,
    height: Platform.OS === 'android' ? 44 : 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    borderRadius: 32,
    padding: 20,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  stepContainer: {
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    width: '60%',
    justifyContent: 'center',
  },
  progressStep: {
    borderRadius: 16,
    padding: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 12,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  qrContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  qrImageContainer: {
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  qrCode: {
    width: 280,
    height: 280,
  },
  qrPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  qrPlaceholderText: {
    fontSize: 16,
    fontWeight: '500',
  },
  debugText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  manualSetupCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    width: '100%',
    borderWidth: 1,
    alignItems: 'stretch',
  },
  manualHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  manualSetupTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    textAlign: 'center',
  },
  manualSetupSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  secretKeyContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  secretKeyLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  secretKeyValue: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  instructionsContainer: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionStep: {
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 18,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    minHeight: 56,
  },
  copyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  codeInput: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    fontSize: 28,
    textAlign: 'center',
    width: '100%',
    marginBottom: 32,
    letterSpacing: 12,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 16,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  appList: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
  appItem: {
    fontSize: 15,
    marginBottom: 4,
  },
  successCard: {
    borderRadius: 20,
    padding: 32,
    marginBottom: 24,
    width: '100%',
    borderWidth: 2,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
