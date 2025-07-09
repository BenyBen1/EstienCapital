import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { supabase } from '@/services/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; mfa?: string }>({});
  
  // 2FA state
  const [mfaStep, setMfaStep] = useState(false); // false = password step, true = 2FA step
  const [mfaCode, setMfaCode] = useState('');
  const [mfaChallenge, setMfaChallenge] = useState<any>(null);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; mfa?: string } = {};

    if (!mfaStep) {
      // Validate email and password for first step
      if (!email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (!password) {
        newErrors.password = 'Password is required';
      }
    } else if (!mfaCode || mfaCode.length !== 6) {
      // Validate 2FA code for second step
      newErrors.mfa = 'Please enter a valid 6-digit authentication code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    console.log('Login attempt started for:', email);

    try {
      // First, try Supabase authentication to check for MFA
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (supabaseError) {
        // If Supabase fails, fall back to backend login
        console.log('Supabase login failed, trying backend login...');
        await login({ email: email.trim(), password });
        router.replace('/(tabs)');
        return;
      }

      // Check if user has MFA enabled
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.find(factor => factor.status === 'verified');

      if (totpFactor) {
        // User has 2FA enabled, create MFA challenge
        const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
          factorId: totpFactor.id,
        });

        if (challengeError) {
          throw new Error(challengeError.message);
        }

        setMfaChallenge(challengeData);
        setMfaFactorId(totpFactor.id);
        setMfaStep(true);
        return;
      }

      // No 2FA, complete login through backend
      await login({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    }
  };

  const handleVerifyMFA = async () => {
    if (!validateForm()) return;

    try {
      // Verify the MFA code using the stored factor ID
      const { error } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId!,
        challengeId: mfaChallenge.id,
        code: mfaCode,
      });

      if (error) {
        throw new Error(error.message);
      }

      // 2FA verified successfully, now complete login through backend
      console.log('2FA verification successful, completing login...');
      await login({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (error) {
      console.error('MFA verification failed:', error);
      setErrors({ mfa: 'Invalid authentication code. Please try again.' });
    }
  };

  const handleBackTo2FA = () => {
    setMfaStep(false);
    setMfaCode('');
    setMfaChallenge(null);
    setMfaFactorId(null);
    setErrors({});
  };

  if (isLoading) {
    return <LoadingSpinner text="Signing you in..." overlay />;
  }

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={[styles.logoText, { color: colors.background }]}>
                ESTIEN
              </Text>
              <Text style={[styles.logoSubText, { color: colors.background }]}>
                CAPITAL
              </Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              {mfaStep ? 'Two-Factor Authentication' : 'Welcome Back'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {mfaStep 
                ? 'Enter the 6-digit code from your authenticator app' 
                : 'Sign in to your account'
              }
            </Text>

            {!mfaStep && (
              <>
                <Input
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={errors.email}
                />

                <Input
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  error={errors.password}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <EyeOff size={20} color={colors.textSecondary} />
                      ) : (
                        <Eye size={20} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  }
                />

                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={() => router.push('/auth/forgot-password')}
                >
                  <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  disabled={isLoading}
                  fullWidth
                  style={styles.loginButton}
                />
              </>
            )}

            {mfaStep && (
              <>
                <View style={[styles.mfaContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Shield size={32} color={colors.primary} style={{ marginBottom: 16 }} />
                  <Text style={[styles.mfaTitle, { color: colors.text }]}>
                    Secure Login
                  </Text>
                  <Text style={[styles.mfaSubtitle, { color: colors.textSecondary }]}>
                    Your account is protected with two-factor authentication
                  </Text>
                </View>

                <Input
                  label="Authentication Code"
                  value={mfaCode}
                  onChangeText={(text) => {
                    setMfaCode(text);
                    setErrors({ ...errors, mfa: undefined });
                  }}
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus={true}
                  selectTextOnFocus={true}
                  returnKeyType="done"
                  onSubmitEditing={handleVerifyMFA}
                  error={errors.mfa}
                  style={styles.mfaInput}
                />

                <Button
                  title="Verify & Sign In"
                  onPress={handleVerifyMFA}
                  disabled={isLoading || mfaCode.length !== 6}
                  fullWidth
                  style={styles.loginButton}
                />

                <TouchableOpacity
                  onPress={handleBackTo2FA}
                  style={styles.backToPassword}
                >
                  <Text style={[styles.backToPasswordText, { color: colors.primary }]}>
                    ← Back to password
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: colors.textSecondary }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                <Text style={[styles.signupLink, { color: colors.primary }]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 100, // More padding for keyboard
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  logoSubText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 1,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: 24,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
  },
  signupLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mfaContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  mfaTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  mfaSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  mfaInput: {
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: 4,
  },
  backToPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  backToPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
});