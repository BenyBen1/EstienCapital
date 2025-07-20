import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Shield } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TwoFactorScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { reloadUserFromStorage } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const inputRefs = useRef<TextInput[]>([]);

  // Get email from route params or AsyncStorage
  useEffect(() => {
    const getEmailFromStorage = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('pending_verification_email');
        if (savedEmail) {
          setUserEmail(savedEmail);
        }
      } catch (error) {
        console.error('Error getting email from storage:', error);
      }
    };
    getEmailFromStorage();
  }, []);

  const handleCodeChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index: number) => {
    if (index > 0 && !code[index]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const codeString = code.join('');
    if (codeString.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    if (!userEmail) {
      Alert.alert('Error', 'Email not found. Please go back and register again.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Verify the OTP with Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        email: userEmail,
        token: codeString,
        type: 'signup'
      });

      if (error) {
        Alert.alert('Verification Failed', error.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        console.log('Two-factor: Email verification successful for user:', data.user.id);
        
        // Clear the stored email
        await AsyncStorage.removeItem('pending_verification_email');
        
        // Save the Supabase session tokens to AsyncStorage for the AuthContext
        if (data.session) {
          console.log('Two-factor: Saving session tokens...');
          await AsyncStorage.setItem('auth_token', data.session.access_token);
          await AsyncStorage.setItem('refresh_token', data.session.refresh_token);
          
          // Try to fetch the complete user profile from backend
          try {
            console.log('Two-factor: Fetching profile from backend...');
            const response = await fetch(`http://192.168.0.175:5000/api/profile/${data.user.id}`, {
              headers: {
                'Authorization': `Bearer ${data.session.access_token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const profileData = await response.json();
              console.log('Two-factor: Backend profile data:', profileData);
              
              // Create properly formatted user object
              const userProfile = {
                id: profileData.id,
                email: profileData.email,
                firstName: profileData.first_name || '',
                lastName: profileData.last_name || '',
                phoneNumber: profileData.phone_number || '',
                kycStatus: profileData.kyc_status || 'not_started',
                createdAt: profileData.created_at || data.user.created_at,
                updatedAt: profileData.updated_at || data.user.updated_at || data.user.created_at,
                accountType: profileData.account_type || 'individual',
                groupId: profileData.group_id || undefined,
              };
              
              console.log('Two-factor: Saving formatted user profile:', userProfile);
              await AsyncStorage.setItem('user_data', JSON.stringify(userProfile));
            } else {
              console.log('Two-factor: Backend profile fetch failed, using Supabase data');
              // Fallback to basic Supabase user data
              const userProfile = {
                id: data.user.id,
                email: data.user.email || userEmail,
                firstName: data.user.user_metadata?.firstName || '',
                lastName: data.user.user_metadata?.lastName || '',
                phoneNumber: data.user.user_metadata?.phoneNumber || '',
                kycStatus: 'not_started' as const,
                createdAt: data.user.created_at,
                updatedAt: data.user.updated_at || data.user.created_at,
                accountType: 'individual' as const,
              };
              
              console.log('Two-factor: Saving fallback user profile:', userProfile);
              await AsyncStorage.setItem('user_data', JSON.stringify(userProfile));
            }
          } catch (profileError) {
            console.warn('Could not fetch profile from backend, using basic Supabase data:', profileError);
            
            // Fallback to basic Supabase user data
            const userProfile = {
              id: data.user.id,
              email: data.user.email || userEmail,
              firstName: data.user.user_metadata?.firstName || '',
              lastName: data.user.user_metadata?.lastName || '',
              phoneNumber: data.user.user_metadata?.phoneNumber || '',
              kycStatus: 'not_started' as const,
              createdAt: data.user.created_at,
              updatedAt: data.user.updated_at || data.user.created_at,
              accountType: 'individual' as const,
            };
            
            console.log('Two-factor: Saving error fallback user profile:', userProfile);
            await AsyncStorage.setItem('user_data', JSON.stringify(userProfile));
          }
        }
        
        // Trigger AuthContext to reload user data from storage
        try {
          console.log('Two-factor: Triggering AuthContext reload...');
          await reloadUserFromStorage();
          console.log('Two-factor: AuthContext reload completed');
        } catch (reloadError) {
          console.warn('Two-factor: Failed to reload AuthContext:', reloadError);
        }
        
        console.log('Two-factor: Navigating to main app...');
        // User is now verified and logged in
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'An unexpected error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace('/auth/login')}
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <View style={[styles.iconBackground, { backgroundColor: colors.primary }]}>
                  <Shield size={40} color={colors.background} />
                </View>
              </View>

              <Text style={[styles.title, { color: colors.text }]}>
                Email Verification
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Enter the 6-digit code sent to your email address
              </Text>

              <View style={styles.codeContainer}>
                {[0, 1, 2, 3, 4, 5].map((digitIndex) => (
                  <TextInput
                    key={`input-${digitIndex}`}
                    ref={(ref) => {
                      if (ref) inputRefs.current[digitIndex] = ref;
                    }}
                    style={[
                      styles.codeInput,
                      {
                        backgroundColor: colors.card,
                        borderColor: code[digitIndex] ? colors.primary : colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={code[digitIndex] || ''}
                    onChangeText={(value) => handleCodeChange(value, digitIndex)}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === 'Backspace') {
                        handleBackspace(digitIndex);
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  { backgroundColor: colors.primary },
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleVerify}
                disabled={isLoading}
              >
                <Text style={[styles.verifyButtonText, { color: colors.background }]}>
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.resendContainer}>
                <Text style={[styles.resendText, { color: colors.textSecondary }]}>
                  Having trouble?{' '}
                </Text>
                <Text style={[styles.resendLink, { color: colors.primary }]}>
                  Contact Support
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
  },
  verifyButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
  },
  resendLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});