import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, ArrowRight, FileText, Upload, Camera, Image as ImageIcon, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface DocumentUpload {
  uri: string;
  type: string;
  name: string;
}

export default function IdentificationScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const [formData, setFormData] = useState({
    idDocumentType: '',
    idNumber: '',
    kraPin: '',
  });

  const [documents, setDocuments] = useState<{
    idDocument: DocumentUpload | null;
    passportPhoto: DocumentUpload | null;
  }>({
    idDocument: null,
    passportPhoto: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const idDocumentTypes = ['National ID', 'Passport'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.idDocumentType) {
      newErrors.idDocumentType = 'Please select an ID document type';
    }

    if (!formData.idNumber.trim()) {
      newErrors.idNumber = 'ID number is required';
    }

    if (!formData.kraPin.trim()) {
      newErrors.kraPin = 'KRA PIN is required';
    } else if (!/^[A-Z]\d{9}[A-Z]$/.test(formData.kraPin)) {
      newErrors.kraPin = 'Please enter a valid KRA PIN format (e.g., A000000000X)';
    }

    if (!documents.idDocument) {
      newErrors.idDocument = 'Please upload your ID document';
    }

    if (!documents.passportPhoto) {
      newErrors.passportPhoto = 'Please upload your passport photo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      router.push('/kyc/professional');
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const pickDocument = async (documentType: 'idDocument' | 'passportPhoto') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: documentType === 'passportPhoto' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setDocuments(prev => ({
          ...prev,
          [documentType]: {
            uri: asset.uri,
            type: 'image/jpeg',
            name: `${documentType}.jpg`,
          },
        }));
        
        // Clear error
        if (errors[documentType]) {
          setErrors(prev => ({ ...prev, [documentType]: '' }));
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async (documentType: 'idDocument' | 'passportPhoto') => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: documentType === 'passportPhoto' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setDocuments(prev => ({
          ...prev,
          [documentType]: {
            uri: asset.uri,
            type: 'image/jpeg',
            name: `${documentType}.jpg`,
          },
        }));
        
        // Clear error
        if (errors[documentType]) {
          setErrors(prev => ({ ...prev, [documentType]: '' }));
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImagePickerOptions = (documentType: 'idDocument' | 'passportPhoto') => {
    Alert.alert(
      'Select Image',
      'Choose how you want to add your document',
      [
        { text: 'Camera', onPress: () => takePhoto(documentType) },
        { text: 'Gallery', onPress: () => pickDocument(documentType) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
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
          Identification
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { backgroundColor: colors.primary, width: '33.33%' }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          Step 2 of 6
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Identity Documents
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Please provide your identification documents for verification. Ensure all documents are clear and legible.
          </Text>

          {/* ID Document Type */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              ID Document Type *
            </Text>
            <View style={styles.documentTypeContainer}>
              {idDocumentTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.documentTypeOption,
                    {
                      backgroundColor: formData.idDocumentType === type ? colors.primary : colors.card,
                      borderColor: formData.idDocumentType === type ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => updateFormData('idDocumentType', type)}
                >
                  <FileText
                    size={20}
                    color={formData.idDocumentType === type ? colors.background : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.documentTypeText,
                      {
                        color: formData.idDocumentType === type ? colors.background : colors.text,
                      },
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.idDocumentType && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.idDocumentType}
              </Text>
            )}
          </View>

          {/* ID Number */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              ID Number *
            </Text>
            <View style={[styles.inputContainer, { borderColor: errors.idNumber ? colors.error : colors.border }]}>
              <FileText size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={formData.idNumber}
                onChangeText={(value) => updateFormData('idNumber', value)}
                placeholder="Enter your ID number"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
              />
            </View>
            {errors.idNumber && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.idNumber}
              </Text>
            )}
          </View>

          {/* KRA PIN */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              KRA PIN *
            </Text>
            <View style={[styles.inputContainer, { borderColor: errors.kraPin ? colors.error : colors.border }]}>
              <FileText size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={formData.kraPin}
                onChangeText={(value) => updateFormData('kraPin', value.toUpperCase())}
                placeholder="A000000000X"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
                maxLength={11}
              />
            </View>
            {errors.kraPin && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.kraPin}
              </Text>
            )}
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              Format: Letter + 9 digits + Letter (e.g., A000000000X)
            </Text>
          </View>

          {/* ID Document Upload */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              ID Document Upload *
            </Text>
            <TouchableOpacity
              style={[
                styles.uploadContainer,
                {
                  backgroundColor: documents.idDocument ? colors.success + '10' : colors.card,
                  borderColor: errors.idDocument ? colors.error : (documents.idDocument ? colors.success : colors.border),
                },
              ]}
              onPress={() => showImagePickerOptions('idDocument')}
            >
              {documents.idDocument ? (
                <View style={styles.uploadedContainer}>
                  <Image source={{ uri: documents.idDocument.uri }} style={styles.uploadedImage} />
                  <View style={styles.uploadedInfo}>
                    <CheckCircle size={20} color={colors.success} />
                    <Text style={[styles.uploadedText, { color: colors.success }]}>
                      Document uploaded successfully
                    </Text>
                    <Text style={[styles.uploadedSubtext, { color: colors.textSecondary }]}>
                      Tap to change
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Upload size={32} color={colors.textSecondary} />
                  <Text style={[styles.uploadText, { color: colors.text }]}>
                    Upload ID Document
                  </Text>
                  <Text style={[styles.uploadSubtext, { color: colors.textSecondary }]}>
                    Take a photo or select from gallery
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.idDocument && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.idDocument}
              </Text>
            )}
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              Ensure the document is clear, all corners are visible, and there's no glare.
            </Text>
          </View>

          {/* Passport Photo Upload */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Passport Photo *
            </Text>
            <TouchableOpacity
              style={[
                styles.uploadContainer,
                {
                  backgroundColor: documents.passportPhoto ? colors.success + '10' : colors.card,
                  borderColor: errors.passportPhoto ? colors.error : (documents.passportPhoto ? colors.success : colors.border),
                },
              ]}
              onPress={() => showImagePickerOptions('passportPhoto')}
            >
              {documents.passportPhoto ? (
                <View style={styles.uploadedContainer}>
                  <Image source={{ uri: documents.passportPhoto.uri }} style={styles.uploadedImageSquare} />
                  <View style={styles.uploadedInfo}>
                    <CheckCircle size={20} color={colors.success} />
                    <Text style={[styles.uploadedText, { color: colors.success }]}>
                      Photo uploaded successfully
                    </Text>
                    <Text style={[styles.uploadedSubtext, { color: colors.textSecondary }]}>
                      Tap to change
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Camera size={32} color={colors.textSecondary} />
                  <Text style={[styles.uploadText, { color: colors.text }]}>
                    Upload Passport Photo
                  </Text>
                  <Text style={[styles.uploadSubtext, { color: colors.textSecondary }]}>
                    Recent, clear passport-style photograph
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.passportPhoto && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.passportPhoto}
              </Text>
            )}
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              Use a recent, clear photo with a plain background. Face should be clearly visible.
            </Text>
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
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  helperText: {
    fontSize: 14,
    marginTop: 4,
  },
  documentTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  documentTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  documentTypeText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  uploadContainer: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  uploadedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  uploadedImage: {
    width: 60,
    height: 40,
    borderRadius: 8,
    marginRight: 16,
  },
  uploadedImageSquare: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 16,
  },
  uploadedInfo: {
    flex: 1,
  },
  uploadedText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  uploadedSubtext: {
    fontSize: 14,
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