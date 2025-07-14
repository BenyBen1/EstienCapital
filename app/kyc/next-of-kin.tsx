import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Users, User, Phone, Mail } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useKYC } from '@/contexts/KYCContext';

export default function NextOfKinScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { kycData, setKycData } = useKYC();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const relationshipOptions = ['Spouse', 'Parent', 'Sibling', 'Child', 'Other'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!kycData.nextOfKin.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[a-zA-Z\s-]+$/.test(kycData.nextOfKin.firstName)) {
      newErrors.firstName = 'First name can only contain letters, spaces, and hyphens';
    }

    if (!kycData.nextOfKin.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[a-zA-Z\s-]+$/.test(kycData.nextOfKin.lastName)) {
      newErrors.lastName = 'Last name can only contain letters, spaces, and hyphens';
    }

    if (!kycData.nextOfKin.relationship) {
      newErrors.relationship = 'Relationship is required';
    }

    if (!kycData.nextOfKin.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^(\+254|0)[17]\d{8}$/.test(kycData.nextOfKin.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid Kenyan phone number';
    }

    if (kycData.nextOfKin.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(kycData.nextOfKin.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      router.push('/kyc/review');
    }
  };

  const updateFormData = (field: string, value: string) => {
    setKycData(prev => ({
      ...prev,
      nextOfKin: {
        ...prev.nextOfKin,
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
          Next of Kin
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { backgroundColor: colors.primary, width: '83.33%' }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          Step 5 of 6
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Next of Kin Information
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Please provide details of your next of kin. This person will be contacted in case of emergency or if we're unable to reach you.
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
                value={kycData.nextOfKin.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                placeholder="Enter first name"
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
                value={kycData.nextOfKin.lastName}
                onChangeText={(value) => updateFormData('lastName', value)}
                placeholder="Enter last name"
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

          {/* Relationship */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Relationship *
            </Text>
            <Text style={[styles.labelDescription, { color: colors.textSecondary }]}>
              How is this person related to you?
            </Text>
            <View style={styles.relationshipContainer}>
              {relationshipOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.relationshipOption,
                    {
                      backgroundColor: kycData.nextOfKin.relationship === option ? colors.primary : colors.card,
                      borderColor: kycData.nextOfKin.relationship === option ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => updateFormData('relationship', option)}
                >
                  <Text
                    style={[
                      styles.relationshipText,
                      {
                        color: kycData.nextOfKin.relationship === option ? colors.background : colors.text,
                      },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.relationship && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.relationship}
              </Text>
            )}
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
                value={kycData.nextOfKin.phoneNumber}
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

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Email Address
            </Text>
            <Text style={[styles.labelDescription, { color: colors.textSecondary }]}>
              Optional - for additional contact method
            </Text>
            <View style={[styles.inputContainer, { 
              borderColor: errors.email ? colors.error : colors.border,
              backgroundColor: colors.surface 
            }]}>
              <Mail size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={kycData.nextOfKin.email}
                onChangeText={(value) => updateFormData('email', value)}
                placeholder="Enter email address (optional)"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.email}
              </Text>
            )}
          </View>

          {/* Information Note */}
          <View style={[styles.infoCard, { backgroundColor: colors.primary + '10' }]}>
            <Users size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                Next of Kin Purpose
              </Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Your next of kin information is kept confidential and will only be used in emergency situations or if we're unable to contact you regarding your account.
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
            Review & Submit
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
    marginBottom: 4,
  },
  labelDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 18,
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
  },
  relationshipContainer: {
    gap: 8,
  },
  relationshipOption: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  relationshipText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
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