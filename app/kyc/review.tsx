import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CircleCheck as CheckCircle, CreditCard as Edit, User, FileText, Briefcase, MapPin, Users, Send } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useKYC } from '@/contexts/KYCContext';
import { useAuth } from '@/contexts/AuthContext';
import * as FileSystem from 'expo-file-system';
import { api } from '@/services/api';

export default function ReviewScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { kycData, resetKycData } = useKYC();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to convert file URI to a base64 string
  const fileToBase64 = async (uri: string) => {
    try {
      const content = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/jpeg;base64,${content}`;
    } catch (e) {
      console.error('Failed to read file to base64', e);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit KYC.');
      return;
    }
    if (!kycData.identification.idDocument || !kycData.identification.passportPhoto) {
      Alert.alert('Error', 'ID Document and Passport Photo are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert files to base64
      const idDocumentBase64 = await fileToBase64(kycData.identification.idDocument.uri);
      const passportPhotoBase64 = await fileToBase64(kycData.identification.passportPhoto.uri);

      if (!idDocumentBase64 || !passportPhotoBase64) {
        throw new Error('Failed to convert files for upload.');
      }

      const payload = {
        userId: user.id,
        ...kycData.personalDetails,
        idType: kycData.identification.idDocumentType,
        idNumber: kycData.identification.idNumber,
        kraPin: kycData.identification.kraPin,
        occupation: kycData.professional.occupation,
        sourceOfWealth: kycData.professional.sourceOfWealth,
        ...kycData.address,
        ...kycData.nextOfKin,
        // File data
        idDocument: {
          base64: idDocumentBase64,
          fileName: kycData.identification.idDocument.name,
        },
        passportPhoto: {
          base64: passportPhotoBase64,
          fileName: kycData.identification.passportPhoto.name,
        },
      };

      // Send data to the backend
      await api.post('/kyc/submit', payload);

      Alert.alert(
        'KYC Submitted Successfully',
        'Your information has been submitted for review. This typically takes 24-48 hours.',
        [
          {
            text: 'OK',
            onPress: () => {
              resetKycData(); // Clear the form
              router.push('/kyc/status');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('KYC Submission Error:', error);
      Alert.alert('Submission Failed', error.response?.data?.error || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const editSection = (section: string) => {
    switch (section) {
      case 'personal':
        router.push('/kyc/personal-details');
        break;
      case 'identification':
        router.push('/kyc/identification');
        break;
      case 'professional':
        router.push('/kyc/professional');
        break;
      case 'address':
        router.push('/kyc/address');
        break;
      case 'nextOfKin':
        router.push('/kyc/next-of-kin');
        break;
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
          Review & Submit
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { backgroundColor: colors.primary, width: '100%' }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          Step 6 of 6
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Review Your Information
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Please review all the information below carefully before submitting. You can edit any section by tapping the edit button.
          </Text>

          {/* Personal Details */}
          <View style={[styles.reviewCard, { backgroundColor: colors.card }]}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewTitleContainer}>
                <User size={20} color={colors.primary} />
                <Text style={[styles.reviewTitle, { color: colors.text }]}>
                  Personal Details
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: colors.primary + '20' }]}
                onPress={() => editSection('personal')}
              >
                <Edit size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.reviewContent}>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Name:</Text>
                <Text style={[styles.reviewValue, { color: colors.text }]}>
                  {`${kycData.personalDetails.firstName} ${kycData.personalDetails.middleName} ${kycData.personalDetails.lastName}`}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Gender:</Text>
                <Text style={[styles.reviewValue, { color: colors.text }]}>
                  {kycData.personalDetails.gender}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Email:</Text>
                <Text style={[styles.reviewValue, { color: colors.text }]}>
                  {kycData.personalDetails.email}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Phone:</Text>
                <Text style={[styles.reviewValue, { color: colors.text }]}>
                  {kycData.personalDetails.phoneNumber}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Date of Birth:</Text>
                <Text style={[styles.reviewValue, { color: colors.text }]}>
                  {kycData.personalDetails.dateOfBirth}
                </Text>
              </View>
            </View>
          </View>

          {/* Identification */}
          <View style={[styles.reviewCard, { backgroundColor: colors.card }]}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewTitleContainer}>
                <FileText size={20} color={colors.primary} />
                <Text style={[styles.reviewTitle, { color: colors.text }]}>
                  Identification
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: colors.primary + '20' }]}
                onPress={() => editSection('identification')}
              >
                <Edit size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.reviewContent}>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>ID Type:</Text>
                <Text style={[styles.reviewValue, { color: colors.text }]}>
                  {kycData.identification.idDocumentType}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>ID Number:</Text>
                <Text style={[styles.reviewValue, { color: colors.text }]}>
                  {kycData.identification.idNumber}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>KRA PIN:</Text>
                <Text style={[styles.reviewValue, { color: colors.text }]}>
                  {kycData.identification.kraPin}
                </Text>
              </View>
              <View style={styles.documentsRow}>
                <View style={styles.documentItem}>
                  <Text style={[styles.documentLabel, { color: colors.textSecondary }]}>
                    ID Document
                  </Text>
                  <View style={[styles.documentStatus, { backgroundColor: kycData.identification.idDocument ? colors.success + '20' : colors.error + '20' }]}>
                    <CheckCircle size={16} color={kycData.identification.idDocument ? colors.success : colors.error} />
                    <Text style={[styles.documentStatusText, { color: kycData.identification.idDocument ? colors.success : colors.error }]}>
                      {kycData.identification.idDocument ? 'Uploaded' : 'Missing'}
                    </Text>
                  </View>
                </View>
                <View style={styles.documentItem}>
                  <Text style={[styles.documentLabel, { color: colors.textSecondary }]}>
                    Passport Photo
                  </Text>
                  <View style={[styles.documentStatus, { backgroundColor: kycData.identification.passportPhoto ? colors.success + '20' : colors.error + '20' }]}>
                    <CheckCircle size={16} color={kycData.identification.passportPhoto ? colors.success : colors.error} />
                    <Text style={[styles.documentStatusText, { color: kycData.identification.passportPhoto ? colors.success : colors.error }]}>
                      {kycData.identification.passportPhoto ? 'Uploaded' : 'Missing'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Professional Information */}
          <View style={[styles.reviewCard, { backgroundColor: colors.card }]}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewTitleContainer}>
                <Briefcase size={20} color={colors.primary} />
                <Text style={[styles.reviewTitle, { color: colors.text }]}>
                  Professional Information
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: colors.primary + '20' }]}
                onPress={() => editSection('professional')}
              >
                <Edit size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.reviewContent}>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Occupation:</Text>
                <Text style={[styles.reviewValue, { color: colors.text }]}>
                  {kycData.professional.occupation}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Source of Wealth:</Text>
                <Text style={[styles.reviewValue, { color: colors.text }]}>
                  {kycData.professional.sourceOfWealth}
                </Text>
              </View>
            </View>
          </View>

          {/* Address & Residency */}
          <View style={[styles.reviewCard, { backgroundColor: colors.card }]}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewTitleContainer}>
                <MapPin size={20} color={colors.primary} />
                <Text style={[styles.reviewTitle, { color: colors.text }]}>
                  Address & Residency
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: colors.primary + '20' }]}
                onPress={() => editSection('address')}
              >
                <Edit size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.reviewContent}>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Physical Address:</Text>
                <Text style={[styles.reviewValue, { color: colors.text }]}>
                  {kycData.address.physicalAddress}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>City:</Text>
                <Text style={[styles.reviewValue, { color: colors.text }]}>
                  {kycData.address.city}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Country:</Text>
                <Text style={[styles.reviewValue, { color: colors.text }]}>
                  {kycData.address.countryOfResidency}
                </Text>
              </View>
              {kycData.address.postalAddress && (
                <View style={styles.reviewRow}>
                  <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Postal Address:</Text>
                  <Text style={[styles.reviewValue, { color: colors.text }]}>
                    {kycData.address.postalAddress}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Next of Kin */}
          <View style={[styles.reviewCard, { backgroundColor: colors.card }]}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewTitleContainer}>
                <Users size={20} color={colors.primary} />
                <Text style={[styles.reviewTitle, { color: colors.text }]}>
                  Next of Kin
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: colors.primary + '20' }]}
                onPress={() => editSection('nextOfKin')}
              >
                <Edit size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.reviewContent}>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Name:</Text>
                <Text style={[styles.reviewValue, { color: colors.text }]}>
                  {`${kycData.nextOfKin.firstName} ${kycData.nextOfKin.lastName}`}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Relationship:</Text>
                <Text style={[styles.reviewValue, { color: colors.text }]}>
                  {kycData.nextOfKin.relationship}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Phone:</Text>
                <Text style={[styles.reviewValue, { color: colors.text }]}>
                  {kycData.nextOfKin.phoneNumber}
                </Text>
              </View>
              {kycData.nextOfKin.email && (
                <View style={styles.reviewRow}>
                  <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Email:</Text>
                  <Text style={[styles.reviewValue, { color: colors.text }]}>
                    {kycData.nextOfKin.email}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Declaration */}
          <View style={[styles.declarationCard, { backgroundColor: colors.warning + '10' }]}>
            <Text style={[styles.declarationTitle, { color: colors.text }]}>
              Declaration
            </Text>
            <Text style={[styles.declarationText, { color: colors.textSecondary }]}>
              By submitting this KYC information, I declare that:
              {'\n\n'}• All information provided is true, accurate, and complete
              {'\n'}• I understand that providing false information may result in account closure
              {'\n'}• I consent to Estien Capital verifying this information with relevant authorities
              {'\n'}• I agree to notify Estien Capital of any changes to this information
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary },
            isSubmitting && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Send size={20} color={colors.background} />
          <Text style={[styles.submitButtonText, { color: colors.background }]}>
            {isSubmitting ? 'Submitting...' : 'Submit KYC Application'}
          </Text>
          {isSubmitting && <ActivityIndicator color={colors.background} style={{ marginLeft: 8 }} />}
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
  reviewCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
  },
  reviewContent: {
    gap: 12,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reviewLabel: {
    fontSize: 14,
    flex: 1,
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  documentsRow: {
    gap: 8,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  documentLabel: {
    fontSize: 14,
  },
  documentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  documentStatusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  declarationCard: {
    padding: 20,
    borderRadius: 16,
    marginTop: 16,
  },
  declarationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  declarationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  submitButton: {
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
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});