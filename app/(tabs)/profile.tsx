import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User as UserIcon, CreditCard, Shield, FileText, CircleHelp as HelpCircle, Moon, Sun, Phone, MessageCircle, Mail, Bell, Lock, Globe, Star, Award, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import ProfileCard from '@/components/profile/ProfileCard';
import SettingsList from '@/components/profile/SettingsList';
import { apiFetch } from '@/services/apiFetch';

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

  // Debug log to see what user data we have
  console.log('ProfileScreen user data from AuthContext:', user);
  
  // Let's also check AsyncStorage directly
  useEffect(() => {
    const checkStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user_data');
        console.log('Stored user data:', storedUser);
        if (storedUser) {
          console.log('Parsed stored user:', JSON.parse(storedUser));
        }
      } catch (error) {
        console.log('Error reading stored user:', error);
      }
    };
    checkStoredUser();
  }, []);

  // Real stats state - start with defaults, only fetch on manual refresh
  const [stats, setStats] = useState<any>({ balance: 0, invested: 0, goals: 0 });

  // Manual refresh - only fetch when user taps Refresh button
  const fetchStats = async () => {
    if (!user?.id) return;
    
    try {
      const walletRes = await apiFetch(`/api/profile/${user.id}`);
      
      const contentType = walletRes.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.warn('Profile API returned non-JSON response, using cached data');
        return;
      }
      
      const walletData = await walletRes.json();
      if (walletData?.error) {
        console.warn('Profile API error:', walletData.error);
        return;
      }
      
      let investedAmount = 0;
      let goalsCount = 0;
      
      try {
        const invRes = await apiFetch('/api/portfolio');
        if (invRes.headers.get('content-type')?.includes('application/json')) {
          const invData = await invRes.json();
          if (Array.isArray(invData)) {
            investedAmount = invData.reduce((sum: number, inv: any) => sum + (inv.amount ?? 0), 0);
          }
        }
      } catch (err: any) {
        console.warn('Portfolio API failed, using default:', err.message);
      }
      
      try {
        const goalsRes = await apiFetch('/api/goals');
        if (goalsRes.headers.get('content-type')?.includes('application/json')) {
          const goalsData = await goalsRes.json();
          if (Array.isArray(goalsData)) {
            goalsCount = goalsData.length;
          }
        }
      } catch (err: any) {
        console.warn('Goals API failed, using default:', err.message);
      }
      
      setStats({
        ...walletData,
        balance: walletData?.balance ?? 0,
        invested: investedAmount,
        goals: goalsCount,
      });
    } catch (err: any) {
      console.warn('Stats fetch failed:', err.message);
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
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
          onPress: () => {
            logout().then(() => router.replace('/welcome'));
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

  const fetchKycInfo = async () => {
    router.push('/kyc/status');
  };

  const profileStats: ProfileStat[] = [
    {
      label: 'Portfolio Value',
      value: `KES ${stats.balance.toLocaleString()}`,
      icon: TrendingUp,
      color: colors.primary,
    },
    {
      label: 'Total Invested',
      value: `KES ${stats.invested.toLocaleString()}`,
      icon: Award,
      color: colors.success,
    },
    {
      label: 'Active Goals',
      value: `${stats.goals}`,
      icon: Star,
      color: colors.warning,
    },
  ];

  const profileSections = [
    {
      title: 'Account Management',
      items: [
        {
          id: 'personal-info',
          icon: UserIcon,
          title: 'Personal Information',
          subtitle: 'View your KYC details',
          onPress: fetchKycInfo,
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
          onPress: () => router.push('/two-factor-setup'),
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
      {/* Header with Refresh button */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Profile
        </Text>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: colors.primary + '20' }]}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Text style={[styles.refreshText, { color: colors.primary }]}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <View style={styles.profileCardContainer}>
          <ProfileCard
            user={user}
            kycStatus={kycStatus}
            getKycStatusColor={getKycStatusColor}
            getKycStatusText={getKycStatusText}
            profileStats={profileStats}
            colors={colors}
          />
        </View>

        {/* Settings Sections */}
        <SettingsList sections={profileSections} colors={colors} />

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
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refreshText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  profileCardContainer: {
    marginBottom: 16,
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