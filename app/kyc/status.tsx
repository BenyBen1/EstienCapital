import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleCheck as CheckCircle, Clock, CircleAlert as AlertCircle, Chrome as Home, FileText, Phone, MessageCircle, Mail } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function KYCStatusScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  
  // Mock status - in real app, this would come from API
  const [kycStatus] = useState<'pending' | 'approved' | 'rejected' | 'action_required'>('pending');

  const getStatusConfig = () => {
    switch (kycStatus) {
      case 'approved':
        return {
          icon: CheckCircle,
          color: colors.success,
          title: 'KYC Approved',
          description: 'Your identity verification has been successfully completed. You now have full access to all features.',
          actionText: 'Continue to Dashboard',
          actionRoute: '/(tabs)',
        };
      case 'rejected':
        return {
          icon: AlertCircle,
          color: colors.error,
          title: 'KYC Rejected',
          description: 'Unfortunately, we were unable to verify your identity with the provided information. Please contact support for assistance.',
          actionText: 'Contact Support',
          actionRoute: null,
        };
      case 'action_required':
        return {
          icon: AlertCircle,
          color: colors.warning,
          title: 'Action Required',
          description: 'Additional information or documentation is required to complete your verification. Please check your email for details.',
          actionText: 'Update Information',
          actionRoute: '/kyc',
        };
      default:
        return {
          icon: Clock,
          color: colors.warning,
          title: 'Under Review',
          description: 'Your KYC application has been submitted and is currently under review. This process typically takes 24-48 hours.',
          actionText: 'Go to Dashboard',
          actionRoute: '/(tabs)',
        };
    }
  };

  const statusConfig = getStatusConfig();

  const timeline = [
    {
      step: 'Application Submitted',
      completed: true,
      timestamp: '2024-01-15 10:30 AM',
    },
    {
      step: 'Document Verification',
      completed: kycStatus !== 'pending',
      timestamp: kycStatus !== 'pending' ? '2024-01-15 02:15 PM' : null,
    },
    {
      step: 'Identity Verification',
      completed: kycStatus === 'approved',
      timestamp: kycStatus === 'approved' ? '2024-01-15 04:45 PM' : null,
    },
    {
      step: 'Account Activation',
      completed: kycStatus === 'approved',
      timestamp: kycStatus === 'approved' ? '2024-01-15 05:00 PM' : null,
    },
  ];

  const handleAction = () => {
    if (statusConfig.actionRoute) {
      router.push(statusConfig.actionRoute as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[statusConfig.color, statusConfig.color + '80']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <statusConfig.icon size={48} color={colors.background} />
          <Text style={[styles.headerTitle, { color: colors.background }]}>
            {statusConfig.title}
          </Text>
          <Text style={[styles.headerDescription, { color: colors.background }]}>
            {statusConfig.description}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Status Timeline */}
        <View style={styles.timelineSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Verification Progress
          </Text>
          
          {timeline.map((item, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineIndicator,
                    {
                      backgroundColor: item.completed ? colors.success : colors.border,
                    },
                  ]}
                >
                  {item.completed && (
                    <CheckCircle size={16} color={colors.background} />
                  )}
                </View>
                {index < timeline.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      {
                        backgroundColor: item.completed ? colors.success : colors.border,
                      },
                    ]}
                  />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineStep,
                    {
                      color: item.completed ? colors.text : colors.textSecondary,
                      fontWeight: item.completed ? '600' : '400',
                    },
                  ]}
                >
                  {item.step}
                </Text>
                {item.timestamp && (
                  <Text style={[styles.timelineTimestamp, { color: colors.textSecondary }]}>
                    {item.timestamp}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Information Cards */}
        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            What's Next?
          </Text>
          
          {kycStatus === 'pending' && (
            <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
              <Clock size={20} color={colors.warning} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>
                  Review in Progress
                </Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Our team is currently reviewing your documents. You'll receive an email notification once the review is complete.
                </Text>
              </View>
            </View>
          )}

          {kycStatus === 'approved' && (
            <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
              <CheckCircle size={20} color={colors.success} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>
                  Account Fully Activated
                </Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  You can now access all features including deposits, withdrawals, and investment management.
                </Text>
              </View>
            </View>
          )}

          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <FileText size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                Keep Your Information Updated
              </Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Remember to update your profile if any of your personal information changes to maintain compliance.
              </Text>
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.supportSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Need Help?
          </Text>
          
          <TouchableOpacity style={[styles.supportCard, { backgroundColor: colors.card }]}>
            <Phone size={20} color={colors.primary} />
            <View style={styles.supportContent}>
              <Text style={[styles.supportTitle, { color: colors.text }]}>
                Call Support
              </Text>
              <Text style={[styles.supportSubtitle, { color: colors.textSecondary }]}>
                +254 700 000 000
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.supportCard, { backgroundColor: colors.card }]}>
            <MessageCircle size={20} color={colors.primary} />
            <View style={styles.supportContent}>
              <Text style={[styles.supportTitle, { color: colors.text }]}>
                WhatsApp Support
              </Text>
              <Text style={[styles.supportSubtitle, { color: colors.textSecondary }]}>
                Chat with our team
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.supportCard, { backgroundColor: colors.card }]}>
            <Mail size={20} color={colors.primary} />
            <View style={styles.supportContent}>
              <Text style={[styles.supportTitle, { color: colors.text }]}>
                Email Support
              </Text>
              <Text style={[styles.supportSubtitle, { color: colors.textSecondary }]}>
                support@estien.co.ke
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={handleAction}
        >
          <Home size={20} color={colors.background} />
          <Text style={[styles.actionButtonText, { color: colors.background }]}>
            {statusConfig.actionText}
          </Text>
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
  headerDescription: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  timelineSection: {
    marginTop: 32,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    height: 40,
    marginTop: 8,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineStep: {
    fontSize: 16,
    marginBottom: 4,
  },
  timelineTimestamp: {
    fontSize: 14,
  },
  infoSection: {
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
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
  supportSection: {
    marginBottom: 40,
  },
  supportCard: {
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
  supportContent: {
    marginLeft: 12,
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  supportSubtitle: {
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  actionButton: {
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
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});