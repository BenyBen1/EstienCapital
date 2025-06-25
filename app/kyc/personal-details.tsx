import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, User, Mail, Phone, Calendar } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useKYC } from '@/contexts/KYCContext';

export default function PersonalDetailsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { kycData, setKycData } = useKYC();
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Autofill email from auth context when the component loads
  useEffect(() => {
    if (user?.email && !kycData.personalDetails.email) {
      updateFormData('email', user.email);
    }
  }, [user]);

  const genderOptions = ['Male', 'Female', 'Other'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const { personalDetails } = kycData;

    if (!personalDetails.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[a-zA-Z\s-]+$/.test(personalDetails.firstName)) {
      newErrors.firstName = 'First name can only contain letters, spaces, and hyphens';
    }

    if (!personalDetails.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[a-zA-Z\s-]+$/.test(personalDetails.lastName)) {
      newErrors.lastName = 'Last name can only contain letters, spaces, and hyphens';
    }

    if (personalDetails.middleName && !/^[a-zA-Z\s-]+$/.test(personalDetails.middleName)) {
      newErrors.middleName = 'Middle name can only contain letters, spaces, and hyphens';
    }

    if (!personalDetails.gender) {
      newErrors.gender = 'Gender selection is required';
    }

    if (!personalDetails.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^(\+254|0)[17]\d{8}$/.test(personalDetails.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid Kenyan phone number';
    }

    if (!personalDetails.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(personalDetails.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      router.push('/kyc/identification');
    }
  };

  const updateFormData = (field: string, value: string) => {
    setKycData(prev => ({
      ...prev,
      personalDetails: {
        ...prev.personalDetails,
        [field]: value,
      },
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Personal Details
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { backgroundColor: colors.primary, width: '16.67%' }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          Step 1 of 6
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Basic Information
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Please provide your personal details as they appear on your official documents.
          </Text>

          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              First Name *
            </Text>
            <View style={[styles.inputContainer, { 
              borderColor: errors.firstName ? colors.error : colors.border,
              backgroundColor: colors.surface 
            }]}>
              <User size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={kycData.personalDetails.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                placeholder="Enter your first name"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
              />
            </View>
            {errors.firstName && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.firstName}
              </Text>
            )}
          </View>

          {/* Middle Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Middle Name
            </Text>
            <View style={[styles.inputContainer, { 
              borderColor: errors.middleName ? colors.error : colors.border,
              backgroundColor: colors.surface 
            }]}>
              <User size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={kycData.personalDetails.middleName}
                onChangeText={(value) => updateFormData('middleName', value)}
                placeholder="Enter your middle name (optional)"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
              />
            </View>
            {errors.middleName && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.middleName}
              </Text>
            )}
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Last Name *
            </Text>
            <View style={[styles.inputContainer, { 
              borderColor: errors.lastName ? colors.error : colors.border,
              backgroundColor: colors.surface 
            }]}>
              <User size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={kycData.personalDetails.lastName}
                onChangeText={(value) => updateFormData('lastName', value)}
                placeholder="Enter your last name"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
              />
            </View>
            {errors.lastName && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.lastName}
              </Text>
            )}
          </View>

          {/* Gender */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Gender *
            </Text>
            <View style={styles.genderContainer}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderOption,
                    {
                      backgroundColor: kycData.personalDetails.gender === option ? colors.primary : colors.card,
                      borderColor: kycData.personalDetails.gender === option ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => updateFormData('gender', option)}
                >
                  <Text
                    style={[
                      styles.genderText,
                      {
                        color: kycData.personalDetails.gender === option ? colors.background : colors.text,
                      },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.gender && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.gender}
              </Text>
            )}
          </View>

          {/* Email (Read-only) */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email Address *</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
              <Mail size={20} color={colors.primary} />
              <TextInput
                style={[styles.textInput, { color: colors.text, fontWeight: '600' }]}
                value={kycData.personalDetails.email}
                editable={false}
              />
            </View>
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              This is your registered email address and cannot be changed here.
            </Text>
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Phone Number *
            </Text>
            <View style={[styles.inputContainer, { 
              borderColor: errors.phoneNumber ? colors.error : colors.border,
              backgroundColor: colors.surface 
            }]}>
              <Phone size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={kycData.personalDetails.phoneNumber}
                onChangeText={(value) => updateFormData('phoneNumber', value)}
                placeholder="+254 7XX XXX XXX"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
            {errors.phoneNumber && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.phoneNumber}
              </Text>
            )}
          </View>

          {/* Date of Birth */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Date of Birth *
            </Text>
            <View style={[styles.inputContainer, { 
              borderColor: errors.dateOfBirth ? colors.error : colors.border,
              backgroundColor: colors.surface 
            }]}>
              <Calendar size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={kycData.personalDetails.dateOfBirth}
                onChangeText={(value) => updateFormData('dateOfBirth', value)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            {errors.dateOfBirth && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.dateOfBirth}
              </Text>
            )}
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              You must be at least 18 years old to open an account.
            </Text>
          </View>

          {/* Information Card */}
          <View style={[styles.infoCard, { backgroundColor: colors.primary + '10' }]}>
            <User size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                Important Information
              </Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Please ensure all information matches your official identification documents exactly. This information will be verified during the KYC process.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.primary }]}
          onPress={handleNext}
        >
          <Text style={[styles.nextButtonText, { color: colors.background }]}>
            Continue
          </Text>
          <ArrowRight size={20} color={colors.background} />
        </TouchableOpacity>
      </View>
    </View>
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
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  formSection: {
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    backgroundColor: 'transparent',
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  helperText: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 18,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  genderText: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});