import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Image,
  RefreshControl,
} from 'react-native';
import { User, Settings, CreditCard, Shield, FileText, CircleHelp as HelpCircle, Moon, Sun, LogOut, ChevronRight, Phone, MessageCircle, Mail, CreditCard as Edit, Camera, Bell, Lock, Globe, Download, Star, Award, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

interface ProfileStat {
  label: string;
  value: string;
  icon: any;
  color: string;
}

export default function ProfileScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [kycStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');
  const [refreshing, setRefreshing] = useState(false);

  const profileStats: ProfileStat[] = [
    {
      label: 'Portfolio Value',
      value: 'KES 125,000',
      icon: TrendingUp,
      color: colors.primary,
    },
    {
      label: 'Total Invested',
      value: 'KES 112,500',
      icon: Award,
      color: colors.success,
    },
    {
      label: 'Active Goals',
      value: '4',
      icon: Star,
      color: colors.warning,
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
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
      title: 'Account Management',
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
          onPress: () => router.push('/kyc/status'),
        },
        {
          id: 'bank-details',
          icon: CreditCard,
          title: 'Bank & Payment Details',
          subtitle: 'Manage withdrawal methods',
          onPress: () => Alert.alert('Info', 'Bank details management coming soon'),
        },
        {
          id: 'security',
          icon: Lock,
          title: 'Security Settings',
          subtitle: 'Password, 2FA, and security',
          onPress: () => Alert.alert('Info', 'Security settings coming soon'),
        },
      ],
    },
    {
      title: 'App Preferences',
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
          icon: Bell,
          title: 'Notifications',
          subtitle: 'Manage your notifications',
          onPress: () => Alert.alert('Info', 'Notification settings coming soon'),
        },
        {
          id: 'language',
          icon: Globe,
          title: 'Language',
          subtitle: 'English (Kenya)',
          onPress: () => Alert.alert('Info', 'Language settings coming soon'),
        },
        {
          id: 'data-export',
          icon: Download,
          title: 'Export Data',
          subtitle: 'Download your account data',
          onPress: () => Alert.alert('Info', 'Data export coming soon'),
        },
      ],
    },
    {
      title: 'Legal & Compliance',
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
        {
          id: 'regulatory',
          icon: Shield,
          title: 'Regulatory Information',
          subtitle: 'Compliance and licensing',
          onPress: () => Alert.alert('Info', 'Regulatory information coming soon'),
        },
      ],
    },
    {
      title: 'Support & Help',
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
        <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.card }]}>
          <Settings size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <View style={[styles.userCard, { backgroundColor: colors.card }]}>
          <View style={styles.userHeader}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={[styles.avatarText, { color: colors.background }]}>
                  {user?.firstName?.charAt(0) || 'J'}{user?.lastName?.charAt(0) || 'D'}
                </Text>
              </View>
              <TouchableOpacity style={[styles.cameraButton, { backgroundColor: colors.background }]}>
                <Camera size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.firstName || 'John'} {user?.lastName || 'Doe'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                {user?.email || 'john.doe@example.com'}
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
            <TouchableOpacity style={styles.editButton}>
              <Edit size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Profile Stats */}
          <View style={styles.statsContainer}>
            {profileStats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                  <stat.icon size={20} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {stat.label}
                </Text>
              </View>
            ))}
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

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.primary + '10' }]}
              onPress={() => router.push('/kyc')}
            >
              <Shield size={24} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.primary }]}>
                Complete KYC
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.success + '10' }]}
            >
              <Download size={24} color={colors.success} />
              <Text style={[styles.quickActionText, { color: colors.success }]}>
                Export Data
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.warning + '10' }]}
            >
              <HelpCircle size={24} color={colors.warning} />
              <Text style={[styles.quickActionText, { color: colors.warning }]}>
                Get Help
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.error + '10' }]}
              onPress={handleLogout}
            >
              <LogOut size={24} color={colors.error} />
              <Text style={[styles.quickActionText, { color: colors.error }]}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Estien Capital v1.0.0
          </Text>
          <Text style={[styles.buildText, { color: colors.textSecondary }]}>
            Build 2024.01.15
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  userCard: {
    borderRadius: 20,
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
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
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
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
  quickActionsSection: {
    marginBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    marginBottom: 4,
  },
  buildText: {
    fontSize: 12,
  },
  bottomSpacing: {
    height: 40,
  },
});