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
import { ArrowLeft, ArrowRight, MapPin, Chrome as Home, Mail } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useKYC } from '@/contexts/KYCContext';

export default function AddressScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { kycData, setKycData } = useKYC();
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const countries = [
    'Kenya',
    'Uganda',
    'Tanzania',
    'Rwanda',
    'Burundi',
    'South Sudan',
    'Ethiopia',
    'Somalia',
    'Other',
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const { address } = kycData;

    if (!address.physicalAddress.trim()) {
      newErrors.physicalAddress = 'Physical address is required';
    }

    if (!address.city.trim()) {
      newErrors.city = 'City/Town is required';
    }

    if (!address.countryOfResidency) {
      newErrors.countryOfResidency = 'Country of residency is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      router.push('/kyc/next-of-kin');
    }
  };

  const updateFormData = (field: string, value: string) => {
    setKycData(prev => ({
      ...prev,
      address: {
        ...prev.address,
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
          Address & Residency
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { backgroundColor: colors.primary, width: '66.67%' }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          Step 4 of 6
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Address & Residency Information
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Please provide your current address and residency details. This information is required for regulatory compliance.
          </Text>

          {/* Physical Address */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Physical Address *
            </Text>
            <Text style={[styles.labelDescription, { color: colors.textSecondary }]}>
              Your current residential address
            </Text>
            <View style={[styles.inputContainer, { borderColor: errors.physicalAddress ? colors.error : colors.border }]}>
              <Home size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={kycData.address.physicalAddress}
                onChangeText={(value) => updateFormData('physicalAddress', value)}
                placeholder="e.g., Apartment A, Building B, Street C"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            {errors.physicalAddress && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.physicalAddress}
              </Text>
            )}
          </View>

          {/* City/Town */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              City/Town *
            </Text>
            <View style={[styles.inputContainer, { borderColor: errors.city ? colors.error : colors.border }]}>
              <MapPin size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={kycData.address.city}
                onChangeText={(value) => updateFormData('city', value)}
                placeholder="e.g., Nairobi"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
              />
            </View>
            {errors.city && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.city}
              </Text>
            )}
          </View>

          {/* Country of Residency */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Country of Residency *
            </Text>
            <Text style={[styles.labelDescription, { color: colors.textSecondary }]}>
              The country where you currently reside
            </Text>
            <View style={styles.countryContainer}>
              {countries.map(country => (
                <TouchableOpacity
                  key={country}
                  style={[
                    styles.countryOption,
                    {
                      backgroundColor: kycData.address.countryOfResidency === country ? colors.primary : colors.card,
                      borderColor: kycData.address.countryOfResidency === country ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => updateFormData('countryOfResidency', country)}
                >
                  <Text
                    style={[
                      styles.countryText,
                      {
                        color: kycData.address.countryOfResidency === country ? colors.background : colors.text,
                      },
                    ]}
                  >
                    {country}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.countryOfResidency && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.countryOfResidency}
              </Text>
            )}
          </View>

          {/* Postal Address */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Postal Address
            </Text>
            <Text style={[styles.labelDescription, { color: colors.textSecondary }]}>
              If different from physical address (optional)
            </Text>
            <View style={[styles.inputContainer, { borderColor: colors.border }]}>
              <Mail size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={kycData.address.postalAddress}
                onChangeText={(value) => updateFormData('postalAddress', value)}
                placeholder="e.g., P.O. Box 12345"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          {/* Postal Code */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Postal Code
            </Text>
            <View style={[styles.inputContainer, { borderColor: colors.border }]}>
              <Mail size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={kycData.address.postalCode}
                onChangeText={(value) => updateFormData('postalCode', value)}
                placeholder="e.g., 00100"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Information Note */}
          <View style={[styles.infoCard, { backgroundColor: colors.primary + '10' }]}>
            <MapPin size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                Address Verification
              </Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Your address information may be verified against official records. Please ensure all details are accurate and match your official documents.
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
    marginBottom: 4,
  },
  labelDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  textAreaInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    minHeight: 80,
  },
  countryContainer: {
    gap: 8,
  },
  countryOption: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  countryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  countryText: {
    fontSize: 16,
    flex: 1,
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
    marginBottom: 4,
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