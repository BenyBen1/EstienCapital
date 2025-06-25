import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, ArrowRight, FileText, Upload, Camera, Image as ImageIcon, CheckCircle, User } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useKYC } from '@/contexts/KYCContext';

interface DocumentUpload {
  uri: string;
  type: string;
  name: string;
}

export default function IdentificationScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { kycData, setKycData } = useKYC();
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const idDocumentTypes = ['National ID', 'Passport'];

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      try {
        const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        
        if (mediaLibraryStatus.status !== 'granted' || cameraStatus.status !== 'granted') {
          Alert.alert(
            'Permissions Required',
            'We need access to your camera and photo library to upload documents. Please enable these permissions in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() }
            ]
          );
        }
      } catch (error) {
        console.error('Permission request error:', error);
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const { identification } = kycData;

    if (!identification.idDocumentType) {
      newErrors.idDocumentType = 'Please select an ID document type';
    }

    if (!identification.idNumber.trim()) {
      newErrors.idNumber = 'ID number is required';
    }

    if (!identification.kraPin.trim()) {
      newErrors.kraPin = 'KRA PIN is required';
    } else if (!/^[A-Z]\d{9}[A-Z]$/.test(identification.kraPin)) {
      newErrors.kraPin = 'Please enter a valid KRA PIN format (e.g., A000000000X)';
    }

    if (!identification.idDocument) {
      newErrors.idDocument = 'Please upload your ID document';
    }

    if (!identification.passportPhoto) {
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
    setKycData(prev => ({
      ...prev,
      identification: {
        ...prev.identification,
        [field]: value,
      },
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateDocument = (field: 'idDocument' | 'passportPhoto', value: DocumentUpload | null) => {
    setKycData(prev => ({
      ...prev,
      identification: {
        ...prev.identification,
        [field]: value,
      },
    }));
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
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        updateDocument(documentType, {
          uri: asset.uri,
          name: asset.fileName || `${documentType}_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async (documentType: 'idDocument' | 'passportPhoto') => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: documentType === 'passportPhoto' ? [1, 1] : [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        updateDocument(documentType, {
          uri: asset.uri,
          name: asset.fileName || `${documentType}_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImagePickerOptions = (documentType: 'idDocument' | 'passportPhoto') => {
    if (Platform.OS === 'web') {
      // On web, directly open file picker
      pickDocument(documentType);
      return;
    }

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
              {idDocumentTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.documentTypeOption,
                    {
                      backgroundColor: kycData.identification.idDocumentType === type ? colors.primary : colors.card,
                      borderColor: kycData.identification.idDocumentType === type ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => updateFormData('idDocumentType', type)}
                >
                  {type === 'National ID' ? (
                    <User size={20} color={kycData.identification.idDocumentType === type ? colors.background : colors.text} />
                  ) : (
                    <FileText size={20} color={kycData.identification.idDocumentType === type ? colors.background : colors.text} />
                  )}
                  <Text style={[styles.documentTypeText, { color: kycData.identification.idDocumentType === type ? colors.background : colors.text }]}>
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
              {kycData.identification.idDocumentType === 'Passport' ? 'Passport Number' : 'ID Number'} *
            </Text>
            <View style={[styles.inputContainer, { borderColor: errors.idNumber ? colors.error : colors.border, backgroundColor: colors.surface }]}>
              <FileText size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={kycData.identification.idNumber}
                onChangeText={(value) => updateFormData('idNumber', value)}
                placeholder={
                  kycData.identification.idDocumentType === 'Passport'
                    ? 'Enter your passport number'
                    : 'Enter your national ID number'
                }
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
            <View style={[styles.inputContainer, { borderColor: errors.kraPin ? colors.error : colors.border, backgroundColor: colors.surface }]}>
              <FileText size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={kycData.identification.kraPin}
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
              {kycData.identification.idDocumentType === 'Passport' ? 'Upload Passport Page' : 'Upload ID Front'} *
            </Text>
            <TouchableOpacity
              style={[
                styles.uploadContainer, 
                { 
                  borderColor: errors.idDocument ? colors.error : colors.border,
                  backgroundColor: colors.surface 
                }
              ]}
              onPress={() => showImagePickerOptions('idDocument')}
            >
              {kycData.identification.idDocument ? (
                <View style={styles.uploadedContainer}>
                  <Image source={{ uri: kycData.identification.idDocument.uri }} style={styles.uploadedImage} />
                  <View style={styles.uploadedInfo}>
                    <Text style={[styles.uploadedText, { color: colors.text }]} numberOfLines={2}>
                      {kycData.identification.idDocument.name}
                    </Text>
                    <View style={styles.successContainer}>
                      <CheckCircle size={16} color={colors.success} />
                      <Text style={[styles.uploadedSubtext, { color: colors.success }]}>
                        Uploaded successfully
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.changeButton, { backgroundColor: colors.primary + '20' }]}
                    onPress={() => showImagePickerOptions('idDocument')}
                  >
                    <Upload size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <View style={[styles.uploadIcon, { backgroundColor: colors.primary + '20' }]}>
                    <FileText size={32} color={colors.primary} />
                  </View>
                  <Text style={[styles.uploadText, { color: colors.text }]}>
                    Upload ID Document
                  </Text>
                  <Text style={[styles.uploadSubtext, { color: colors.textSecondary }]}>
                    Take a photo or select from gallery
                  </Text>
                  <View style={[styles.uploadButton, { backgroundColor: colors.primary }]}>
                    <Upload size={16} color={colors.background} />
                    <Text style={[styles.uploadButtonText, { color: colors.background }]}>
                      Choose File
                    </Text>
                  </View>
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
            <Text style={[styles.label, { color: colors.text }]}>Passport Photo *</Text>
            <TouchableOpacity
              style={[
                styles.uploadContainer, 
                { 
                  borderColor: errors.passportPhoto ? colors.error : colors.border,
                  backgroundColor: colors.surface 
                }
              ]}
              onPress={() => showImagePickerOptions('passportPhoto')}
            >
              {kycData.identification.passportPhoto ? (
                <View style={styles.uploadedContainer}>
                  <Image source={{ uri: kycData.identification.passportPhoto.uri }} style={styles.uploadedImageSquare} />
                  <View style={styles.uploadedInfo}>
                    <Text style={[styles.uploadedText, { color: colors.text }]} numberOfLines={2}>
                      {kycData.identification.passportPhoto.name}
                    </Text>
                    <View style={styles.successContainer}>
                      <CheckCircle size={16} color={colors.success} />
                      <Text style={[styles.uploadedSubtext, { color: colors.success }]}>
                        Uploaded successfully
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.changeButton, { backgroundColor: colors.primary + '20' }]}
                    onPress={() => showImagePickerOptions('passportPhoto')}
                  >
                    <Camera size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <View style={[styles.uploadIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Camera size={32} color={colors.primary} />
                  </View>
                  <Text style={[styles.uploadText, { color: colors.text }]}>
                    Upload Passport Photo
                  </Text>
                  <Text style={[styles.uploadSubtext, { color: colors.textSecondary }]}>
                    Recent, clear passport-style photograph
                  </Text>
                  <View style={[styles.uploadButton, { backgroundColor: colors.primary }]}>
                    <Camera size={16} color={colors.background} />
                    <Text style={[styles.uploadButtonText, { color: colors.background }]}>
                      Take Photo
                    </Text>
                  </View>
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

          {/* Information Card */}
          <View style={[styles.infoCard, { backgroundColor: colors.primary + '10' }]}>
            <FileText size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                Document Requirements
              </Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                • Documents must be clear and legible{'\n'}
                • All corners must be visible{'\n'}
                • No glare or shadows{'\n'}
                • Photos should be recent and high quality
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
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    textAlign: 'center',
  },
  uploadContainer: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    width: '100%',
  },
  uploadIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  uploadSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  uploadedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 8,
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
    marginRight: 12,
  },
  uploadedText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  uploadedSubtext: {
    fontSize: 12,
    fontWeight: '500',
  },
  changeButton: {
    padding: 8,
    borderRadius: 8,
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