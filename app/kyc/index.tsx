import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, CircleCheck as CheckCircle, Clock, CircleAlert as AlertCircle, ArrowRight, FileText, User, MapPin, Briefcase, Users, CreditCard } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function KYCIntroScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const kycSteps = [
    {
      id: 1,
      title: 'Personal Details',
      description: 'Basic information and contact details',
      icon: User,
      completed: false,
    },
    {
      id: 2,
      title: 'Identification Documents',
      description: 'ID, KRA PIN, and passport photo',
      icon: FileText,
      completed: false,
    },
    {
      id: 3,
      title: 'Professional Information',
      description: 'Occupation and source of wealth',
      icon: Briefcase,
      completed: false,
    },
    {
      id: 4,
      title: 'Address & Residency',
      description: 'Physical and postal addresses',
      icon: MapPin,
      completed: false,
    },
    {
      id: 5,
      title: 'Next of Kin',
      description: 'Emergency contact information',
      icon: Users,
      completed: false,
    },
    {
      id: 6,
      title: 'Review & Submit',
      description: 'Final review of all information',
      icon: CheckCircle,
      completed: false,
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, '#FFA500']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Shield size={48} color={colors.background} />
          <Text style={[styles.headerTitle, { color: colors.background }]}>
            KYC Verification
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.background }]}>
            Complete your identity verification to access all features
          </Text>
        </View>
      </LinearGradient>

      {/* Status Card */}
      <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
        <View style={styles.statusHeader}>
          <Clock size={24} color={colors.warning} />
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            Verification Required
          </Text>
        </View>
        <Text style={[styles.statusDescription, { color: colors.textSecondary }]}>
          To ensure compliance with financial regulations and protect your account, we need to verify your identity. This process typically takes 24-48 hours.
        </Text>
      </View>

      {/* Requirements */}
      <View style={styles.requirementsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          What You'll Need
        </Text>
        
        <View style={[styles.requirementCard, { backgroundColor: colors.card }]}>
          <CreditCard size={20} color={colors.primary} />
          <View style={styles.requirementText}>
            <Text style={[styles.requirementTitle, { color: colors.text }]}>
              Valid ID Document
            </Text>
            <Text style={[styles.requirementDescription, { color: colors.textSecondary }]}>
              National ID or Passport
            </Text>
          </View>
        </View>

        <View style={[styles.requirementCard, { backgroundColor: colors.card }]}>
          <FileText size={20} color={colors.primary} />
          <View style={styles.requirementText}>
            <Text style={[styles.requirementTitle, { color: colors.text }]}>
              KRA PIN Certificate
            </Text>
            <Text style={[styles.requirementDescription, { color: colors.textSecondary }]}>
              Valid KRA PIN document
            </Text>
          </View>
        </View>

        <View style={[styles.requirementCard, { backgroundColor: colors.card }]}>
          <User size={20} color={colors.primary} />
          <View style={styles.requirementText}>
            <Text style={[styles.requirementTitle, { color: colors.text }]}>
              Passport Photo
            </Text>
            <Text style={[styles.requirementDescription, { color: colors.textSecondary }]}>
              Recent clear photograph
            </Text>
          </View>
        </View>
      </View>

      {/* Steps Overview */}
      <View style={styles.stepsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Verification Steps
        </Text>
        
        {kycSteps.map((step, index) => (
          <View key={step.id} style={[styles.stepCard, { backgroundColor: colors.card }]}>
            <View style={styles.stepLeft}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={[styles.stepNumberText, { color: colors.background }]}>
                  {step.id}
                </Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  {step.title}
                </Text>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  {step.description}
                </Text>
              </View>
            </View>
            <step.icon size={20} color={colors.textSecondary} />
          </View>
        ))}
      </View>

      {/* Important Notes */}
      <View style={[styles.notesCard, { backgroundColor: colors.warning + '10' }]}>
        <AlertCircle size={20} color={colors.warning} />
        <View style={styles.notesContent}>
          <Text style={[styles.notesTitle, { color: colors.text }]}>
            Important Notes
          </Text>
          <Text style={[styles.notesText, { color: colors.textSecondary }]}>
            • Ensure all documents are clear and legible{'\n'}
            • All information must match your official documents{'\n'}
            • Joint accounts require KYC for all account holders{'\n'}
            • Process typically takes 24-48 hours for review
          </Text>
        </View>
      </View>

      {/* Start Button */}
      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/kyc/personal-details')}
      >
        <Text style={[styles.startButtonText, { color: colors.background }]}>
          Start Verification
        </Text>
        <ArrowRight size={20} color={colors.background} />
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
  },
  statusCard: {
    margin: 24,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  statusDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  requirementsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  requirementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  requirementText: {
    marginLeft: 16,
    flex: 1,
  },
  requirementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  requirementDescription: {
    fontSize: 14,
  },
  stepsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  stepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 14,
  },
  notesCard: {
    flexDirection: 'row',
    margin: 24,
    padding: 16,
    borderRadius: 12,
  },
  notesContent: {
    marginLeft: 12,
    flex: 1,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});