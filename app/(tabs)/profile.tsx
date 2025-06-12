import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { User, Settings, CreditCard, Shield, FileText, CircleHelp as HelpCircle, Moon, Sun, LogOut, ChevronRight, Phone, MessageCircle, Mail } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const [kycStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            router.replace('/');
          },
        },
      ]
    );
  };

  const getKycStatusColor = () => {
    switch (kycStatus) {
      case 'approved':
        return colors.success;
      case 'rejected':
        return colors.error;
      default:
        return colors.warning;
    }
  };

  const getKycStatusText = () => {
    switch (kycStatus) {
      case 'approved':
        return 'Verified';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending Review';
    }
  };

  const profileSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'personal-info',
          icon: User,
          title: 'Personal Information',
          subtitle: 'Update your personal details',
          onPress: () => Alert.alert('Info', 'Personal information management coming soon'),
        },
        {
          id: 'kyc-status',
          icon: Shield,
          title: 'KYC Status',
          subtitle: getKycStatusText(),
          badge: true,
          badgeColor: getKycStatusColor(),
          onPress: () => Alert.alert('KYC Status', `Your KYC status is: ${getKycStatusText()}`),
        },
        {
          id: 'bank-details',
          icon: CreditCard,
          title: 'Bank & Payment Details',
          subtitle: 'Manage withdrawal methods',
          onPress: () => Alert.alert('Info', 'Bank details management coming soon'),
        },
      ],
    },
    {
      title: 'App Settings',
      items: [
        {
          id: 'theme',
          icon: isDarkMode ? Moon : Sun,
          title: 'Dark Mode',
          subtitle: 'Toggle dark/light theme',
          hasSwitch: true,
          switchValue: isDarkMode,
          onSwitchChange: toggleTheme,
        },
        {
          id: 'notifications',
          icon: Settings,
          title: 'Notification Settings',
          subtitle: 'Manage your notifications',
          onPress: () => Alert.alert('Info', 'Notification settings coming soon'),
        },
      ],
    },
    {
      title: 'Legal & Support',
      items: [
        {
          id: 'terms',
          icon: FileText,
          title: 'Terms & Conditions',
          subtitle: 'Read our terms of service',
          onPress: () => Alert.alert('Info', 'Terms & Conditions coming soon'),
        },
        {
          id: 'privacy',
          icon: FileText,
          title: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
          onPress: () => Alert.alert('Info', 'Privacy Policy coming soon'),
        },
      ],
    },
    {
      title: 'Get Help',
      items: [
        {
          id: 'phone',
          icon: Phone,
          title: 'Call Support',
          subtitle: '+254 700 000 000',
          onPress: () => Alert.alert('Call Support', 'This would open phone dialer'),
        },
        {
          id: 'whatsapp',
          icon: MessageCircle,
          title: 'WhatsApp Support',
          subtitle: 'Chat with our support team',
          onPress: () => Alert.alert('WhatsApp', 'This would open WhatsApp chat'),
        },
        {
          id: 'email',
          icon: Mail,
          title: 'Email Support',
          subtitle: 'support@estien.co.ke',
          onPress: () => Alert.alert('Email Support', 'This would open email client'),
        },
        {
          id: 'faq',
          icon: HelpCircle,
          title: 'FAQ & Help Center',
          subtitle: 'Find answers to common questions',
          onPress: () => Alert.alert('Info', 'FAQ section coming soon'),
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Profile
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User Info Card */}
        <View style={[styles.userCard, { backgroundColor: colors.card }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.background }]}>
              JD
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              John Doe
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              john.doe@example.com
            </Text>
            <View style={styles.kycBadge}>
              <View
                style={[
                  styles.kycIndicator,
                  { backgroundColor: getKycStatusColor() },
                ]}
              />
              <Text style={[styles.kycText, { color: getKycStatusColor() }]}>
                {getKycStatusText()}
              </Text>
            </View>
          </View>
        </View>

        {/* Profile Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title}
            </Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.settingItem,
                    itemIndex < section.items.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={item.onPress}
                  disabled={item.hasSwitch}
                >
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: colors.surface }]}>
                      <item.icon size={20} color={colors.text} />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={[styles.settingTitle, { color: colors.text }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                        {item.subtitle}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.settingRight}>
                    {item.badge && (
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: item.badgeColor + '20' },
                        ]}
                      >
                        <Text style={[styles.badgeText, { color: item.badgeColor }]}>
                          ●
                        </Text>
                      </View>
                    )}
                    {item.hasSwitch ? (
                      <Switch
                        value={item.switchValue}
                        onValueChange={item.onSwitchChange}
                        trackColor={{
                          false: colors.border,
                          true: colors.primary + '40',
                        }}
                        thumbColor={item.switchValue ? colors.primary : colors.textSecondary}
                      />
                    ) : (
                      <ChevronRight size={20} color={colors.textSecondary} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.error + '10' }]}
            onPress={handleLogout}
          >
            <LogOut size={20} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Estien Capital v1.0.0
          </Text>
        </View>
      </ScrollView>
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
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  kycIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  kycText: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  versionSection: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 12,
  },
});