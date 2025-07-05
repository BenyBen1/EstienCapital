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
import { Eye, EyeOff, ArrowLeft, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import JointAccountHolderForm from '@/components/profile/JointAccountHolderForm';

type AccountType = 'individual' | 'joint';

export default function SignupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'individual' as AccountType,
  });
  const [jointHolder, setJointHolder] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [jointErrors, setJointErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateJointHolder = () => {
    const newErrors: Record<string, string> = {};
    if (!jointHolder.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!jointHolder.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!jointHolder.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(jointHolder.email)) newErrors.email = 'Please enter a valid email address';
    if (!jointHolder.password) newErrors.password = 'Password is required';
    else if (jointHolder.password.length < 8) newErrors.password = 'Password must be at least 8 characters long';
    if (jointHolder.password !== jointHolder.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setJointErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    if (formData.accountType === 'joint' && !validateJointHolder()) return;
    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        accountType: formData.accountType,
        jointHolder: formData.accountType === 'joint' ? {
          firstName: jointHolder.firstName.trim(),
          lastName: jointHolder.lastName.trim(),
          email: jointHolder.email.trim(),
          password: jointHolder.password,
        } : undefined,
      });
      
      Alert.alert(
        'Account Created',
        'Your account has been created successfully. Please complete your KYC verification.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Creating your account..." overlay />;
  }

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
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
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Join Estien Capital and start investing
            </Text>

            <View style={styles.accountTypeContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Account Type</Text>
              <View style={styles.accountTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.accountTypeButton,
                    {
                      backgroundColor: formData.accountType === 'individual' ? colors.primary : colors.card,
                      borderColor: formData.accountType === 'individual' ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => updateFormData('accountType', 'individual')}
                >
                  <View style={styles.radioContainer}>
                    {formData.accountType === 'individual' && (
                      <Check size={16} color={colors.background} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.accountTypeText,
                      {
                        color: formData.accountType === 'individual' ? colors.background : colors.text,
                      },
                    ]}
                  >
                    Individual Account
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.accountTypeButton,
                    {
                      backgroundColor: formData.accountType === 'joint' ? colors.primary : colors.card,
                      borderColor: formData.accountType === 'joint' ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => updateFormData('accountType', 'joint')}
                >
                  <View style={styles.radioContainer}>
                    {formData.accountType === 'joint' && (
                      <Check size={16} color={colors.background} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.accountTypeText,
                      {
                        color: formData.accountType === 'joint' ? colors.background : colors.text,
                      },
                    ]}
                  >
                    Joint Account
                  </Text>
                </TouchableOpacity>
              </View>
              
              {formData.accountType === 'joint' && (
                <Text style={[styles.jointAccountNote, { color: colors.textSecondary }]}>
                  Joint accounts require KYC verification for all account holders
                </Text>
              )}
            </View>

            <View style={styles.nameRow}>
              <Input
                label="First Name"
                value={formData.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                placeholder="First name"
                autoCapitalize="words"
                error={errors.firstName}
                containerStyle={styles.nameInput}
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChangeText={(value) => updateFormData('lastName', value)}
                placeholder="Last name"
                autoCapitalize="words"
                error={errors.lastName}
                containerStyle={styles.nameInput}
              />
            </View>

            <Input
              label="Email Address"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
            />

            <Input
              label="Password"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              placeholder="Create a password"
              secureTextEntry={!showPassword}
              autoComplete="new-password"
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

            <Input
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              placeholder="Confirm your password"
              secureTextEntry={!showConfirmPassword}
              autoComplete="new-password"
              error={errors.confirmPassword}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              }
            />

            {formData.accountType === 'joint' && (
              <JointAccountHolderForm
                prefix="Second"
                values={jointHolder}
                errors={jointErrors}
                onChange={(field, value) => setJointHolder(prev => ({ ...prev, [field]: value }))}
                colors={colors}
              />
            )}

            <Button
              title="Create Account"
              onPress={handleSignup}
              disabled={isLoading}
              fullWidth
              style={styles.signupButton}
            />

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>
                  Sign In
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
    paddingBottom: 40,
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
  accountTypeContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  accountTypeButtons: {
    gap: 12,
  },
  accountTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  radioContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountTypeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  jointAccountNote: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  signupButton: {
    marginBottom: 24,
    marginTop: 12,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});