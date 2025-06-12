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
import { ArrowLeft, ArrowRight, Briefcase, DollarSign } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function ProfessionalScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const [formData, setFormData] = useState({
    occupation: '',
    customOccupation: '',
    sourceOfWealth: '',
    customSourceOfWealth: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const occupationOptions = [
    'Employed - Private Sector',
    'Employed - Public Sector',
    'Self-Employed',
    'Business Owner',
    'Student',
    'Retired',
    'Unemployed',
    'Other',
  ];

  const sourceOfWealthOptions = [
    'Employment Income',
    'Business Profits',
    'Investment Returns',
    'Inheritance',
    'Savings',
    'Pension',
    'Family Support',
    'Other',
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.occupation) {
      newErrors.occupation = 'Please select your occupation';
    } else if (formData.occupation === 'Other' && !formData.customOccupation.trim()) {
      newErrors.customOccupation = 'Please specify your occupation';
    }

    if (!formData.sourceOfWealth) {
      newErrors.sourceOfWealth = 'Please select your source of wealth';
    } else if (formData.sourceOfWealth === 'Other' && !formData.customSourceOfWealth.trim()) {
      newErrors.customSourceOfWealth = 'Please specify your source of wealth';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      router.push('/kyc/address');
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            <View style={styles.optionsContainer}>
              {occupationOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: formData.occupation === option ? colors.primary + '20' : colors.card,
                      borderColor: formData.occupation === option ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => updateFormData('occupation', option)}
                >
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.radioButton,
                        {
                          borderColor: formData.occupation === option ? colors.primary : colors.border,
                          backgroundColor: formData.occupation === option ? colors.primary : 'transparent',
                        },
                      ]}
                    >
                      {formData.occupation === option && (
                        <View style={[styles.radioButtonInner, { backgroundColor: colors.background }]} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: formData.occupation === option ? colors.primary : colors.text,
                          fontWeight: formData.occupation === option ? '600' : '400',
                        },
                      ]}
                    >
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            {errors.occupation && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.occupation}
              </Text>
            )}

            {/* Custom Occupation Input */}
            {formData.occupation === 'Other' && (
              <View style={styles.customInputContainer}>
                <View style={[styles.inputContainer, { borderColor: errors.customOccupation ? colors.error : colors.border }]}>
                  <Briefcase size={20} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={formData.customOccupation}
                    onChangeText={(value) => updateFormData('customOccupation', value)}
                    placeholder="Please specify your occupation"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                {errors.customOccupation && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.customOccupation}
                  </Text>
                )}
              </View>
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
              {sourceOfWealthOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: formData.sourceOfWealth === option ? colors.primary + '20' : colors.card,
                      borderColor: formData.sourceOfWealth === option ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => updateFormData('sourceOfWealth', option)}
                >
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.radioButton,
                        {
                          borderColor: formData.sourceOfWealth === option ? colors.primary : colors.border,
                          backgroundColor: formData.sourceOfWealth === option ? colors.primary : 'transparent',
                        },
                      ]}
                    >
                      {formData.sourceOfWealth === option && (
                        <View style={[styles.radioButtonInner, { backgroundColor: colors.background }]} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: formData.sourceOfWealth === option ? colors.primary : colors.text,
                          fontWeight: formData.sourceOfWealth === option ? '600' : '400',
                        },
                      ]}
                    >
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            {errors.sourceOfWealth && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.sourceOfWealth}
              </Text>
            )}

            {/* Custom Source of Wealth Input */}
            {formData.sourceOfWealth === 'Other' && (
              <View style={styles.customInputContainer}>
                <View style={[styles.inputContainer, { borderColor: errors.customSourceOfWealth ? colors.error : colors.border }]}>
                  <DollarSign size={20} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={formData.customSourceOfWealth}
                    onChangeText={(value) => updateFormData('customSourceOfWealth', value)}
                    placeholder="Please specify your source of wealth"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                {errors.customSourceOfWealth && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.customSourceOfWealth}
                  </Text>
                )}
              </View>
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