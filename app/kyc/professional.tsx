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
import { ArrowLeft, ArrowRight, Briefcase, DollarSign, Check, Info } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useKYC } from '@/contexts/KYCContext';

export default function ProfessionalScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { kycData, setKycData } = useKYC();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customOccupation, setCustomOccupation] = useState('');
  const [customSourceOfWealth, setCustomSourceOfWealth] = useState('');

  const occupationOptions = ['Employed', 'Self-Employed', 'Business Owner', 'Student', 'Unemployed', 'Other'];
  const sourceOfWealthOptions = ['Employment Income', 'Business Income', 'Investments', 'Inheritance', 'Savings', 'Other'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const { professional } = kycData;

    if (!professional.occupation) {
      newErrors.occupation = 'Please select your occupation';
    } else if (professional.occupation === 'Other' && !customOccupation.trim()) {
      newErrors.occupation = 'Please specify your occupation';
    }

    if (!professional.sourceOfWealth) {
      newErrors.sourceOfWealth = 'Please select your source of wealth';
    } else if (professional.sourceOfWealth === 'Other' && !customSourceOfWealth.trim()) {
      newErrors.sourceOfWealth = 'Please specify your source of wealth';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      // If 'Other' was selected, save the custom value
      if (kycData.professional.occupation === 'Other') {
        updateFormData('occupation', customOccupation);
      }
      if (kycData.professional.sourceOfWealth === 'Other') {
        updateFormData('sourceOfWealth', customSourceOfWealth);
      }
      router.push('/kyc/address');
    }
  };

  const updateFormData = (field: 'occupation' | 'sourceOfWealth', value: string) => {
    setKycData(prev => ({
      ...prev,
      professional: {
        ...prev.professional,
        [field]: value,
      },
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSelectOccupation = (option: string) => {
    if (option !== 'Other') setCustomOccupation('');
    updateFormData('occupation', option);
  };

  const handleSelectSource = (option: string) => {
    if (option !== 'Other') setCustomSourceOfWealth('');
    updateFormData('sourceOfWealth', option);
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
          Professional Info
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { backgroundColor: colors.primary, width: '50%' }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          Step 3 of 6
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Professional & Financial Information
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            This information helps us understand your financial profile and ensure compliance with regulatory requirements.
          </Text>

          {/* Occupation */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Occupation *
            </Text>
            <Text style={[styles.labelDescription, { color: colors.textSecondary }]}>
              Please indicate your current occupation
            </Text>
            <View style={styles.optionsContainer}>
              {occupationOptions.map(option => (
                <View key={option}>
                  <TouchableOpacity
                    style={[styles.optionCard, { borderColor: kycData.professional.occupation === option ? colors.primary : colors.border }]}
                    onPress={() => handleSelectOccupation(option)}
                  >
                    <View style={styles.optionContent}>
                      <View style={[styles.radioButton, { borderColor: colors.border }]}>
                        {kycData.professional.occupation === option && (
                          <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
                        )}
                      </View>
                      <Text style={[styles.optionText, { color: colors.text }]}>{option}</Text>
                    </View>
                  </TouchableOpacity>
                  {option === 'Other' && kycData.professional.occupation === 'Other' && (
                    <View style={styles.customInputContainer}>
                      <View style={[styles.inputContainer, { borderColor: errors.occupation ? colors.error : colors.border }]}>
                        <Briefcase size={20} color={colors.textSecondary} />
                        <TextInput
                          style={[styles.textInput, { color: colors.text }]}
                          value={customOccupation}
                          onChangeText={setCustomOccupation}
                          placeholder="Please specify"
                          placeholderTextColor={colors.textSecondary}
                        />
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
            {errors.occupation && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.occupation}
              </Text>
            )}
          </View>

          {/* Source of Wealth */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Source of Wealth *
            </Text>
            <Text style={[styles.labelDescription, { color: colors.textSecondary }]}>
              Please indicate the primary source of the funds you plan to invest
            </Text>
            <View style={styles.optionsContainer}>
              {sourceOfWealthOptions.map(option => (
                <View key={option}>
                  <TouchableOpacity
                    style={[styles.optionCard, { borderColor: kycData.professional.sourceOfWealth === option ? colors.primary : colors.border }]}
                    onPress={() => handleSelectSource(option)}
                  >
                    <View style={styles.optionContent}>
                      <View style={[styles.radioButton, { borderColor: colors.border }]}>
                        {kycData.professional.sourceOfWealth === option && (
                          <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
                        )}
                      </View>
                      <Text style={[styles.optionText, { color: colors.text }]}>{option}</Text>
                    </View>
                  </TouchableOpacity>
                  {option === 'Other' && kycData.professional.sourceOfWealth === 'Other' && (
                    <View style={styles.customInputContainer}>
                      <View style={[styles.inputContainer, { borderColor: errors.sourceOfWealth ? colors.error : colors.border }]}>
                        <Briefcase size={20} color={colors.textSecondary} />
                        <TextInput
                          style={[styles.textInput, { color: colors.text }]}
                          value={customSourceOfWealth}
                          onChangeText={setCustomSourceOfWealth}
                          placeholder="Please specify"
                          placeholderTextColor={colors.textSecondary}
                        />
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
            {errors.sourceOfWealth && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.sourceOfWealth}
              </Text>
            )}
          </View>

          {/* Information Note */}
          <View style={[styles.infoCard, { backgroundColor: colors.primary + '10' }]}>
            <Briefcase size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                Why do we need this information?
              </Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                This information helps us comply with anti-money laundering regulations and better understand your investment profile to provide suitable recommendations.
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
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  labelDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  optionContent: {
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
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  customInputContainer: {
    marginTop: 16,
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