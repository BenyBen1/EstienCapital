import { useState, useEffect } from 'react';
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
import { User as UserIcon, Settings, CreditCard, Shield, FileText, CircleHelp as HelpCircle, Moon, Sun, LogOut, ChevronRight, Phone, MessageCircle, Mail, CreditCard as Edit, Camera, Bell, Lock, Globe, Download, Star, Award, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LucideIcon } from 'lucide-react-native';
import type { User } from '@/types/env';
import ProfileCard from '@/components/profile/ProfileCard';
import SettingsList from '@/components/profile/SettingsList';

interface ProfileStat {
  label: string;
  value: string;
  icon: any;
  color: string;
}

interface ProfileOption {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onPress?: () => void;
  badge?: boolean;
  badgeColor?: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: () => void;
}

export default function ProfileScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [kycStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');
  const [refreshing, setRefreshing] = useState(false);

  // Real stats state
  const [stats, setStats] = useState<any>({ balance: 0, invested: 0, goals: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const BASE_URL = 'http://192.168.0.175:5000';

  // Fetch stats from backend
  const fetchStats = async () => {
    if (!user?.id) return;
    setStatsLoading(true);
    setStatsError(null);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found. Please log in again.');
      // Fetch wallet
      const walletRes = await fetch(`${BASE_URL}/api/profile/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const walletData = await walletRes.json();
      // Fetch investments
      const invRes = await fetch(`${BASE_URL}/api/portfolio`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const invData = await invRes.json();
      // Fetch goals
      const goalsRes = await fetch(`${BASE_URL}/api/goals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const goalsData = await goalsRes.json();
      setStats({
        balance: walletData?.balance || 0,
        invested: Array.isArray(invData) ? invData.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0) : 0,
        goals: Array.isArray(goalsData) ? goalsData.length : 0,
      });
    } catch (err: any) {
      setStatsError(err.message || 'Error fetching stats');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const profileStats: ProfileStat[] = [
    {
      label: 'Portfolio Value',
      value: statsLoading ? 'Loading...' : `KES ${stats.balance.toLocaleString()}`,
      icon: TrendingUp,
      color: colors.primary,
    },
    {
      label: 'Total Invested',
      value: statsLoading ? 'Loading...' : `KES ${stats.invested.toLocaleString()}`,
      icon: Award,
      color: colors.success,
    },
    {
      label: 'Active Goals',
      value: statsLoading ? 'Loading...' : `${stats.goals}`,
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
            router.replace('/welcome');
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
          icon: UserIcon,
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
        <ProfileCard
          user={user || {}}
          kycStatus={kycStatus}
          getKycStatusColor={getKycStatusColor}
          getKycStatusText={getKycStatusText}
          profileStats={profileStats}
          colors={colors}
        />

        {/* Profile Sections */}
        <SettingsList sections={profileSections} colors={colors} />

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