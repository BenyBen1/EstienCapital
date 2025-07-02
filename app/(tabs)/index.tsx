import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Image,
  Modal,
  KeyboardAvoidingView,
  TextInput,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Minus, TrendingUp, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, Target, Settings, Bell, Search, MoveHorizontal as MoreHorizontal, DollarSign, ChartPie as PieChart, Activity, Zap } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import DepositModal from '@/components/DepositModal';
import WithdrawModal from '@/components/WithdrawModal';
import DepositInstructionsModal from '@/components/DepositInstructionsModal';
import { BASE_URL } from '@/services/config';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  image: string;
}

interface MemoItem {
  id: string;
  title: string;
  summary: string;
  author: string;
  timestamp: string;
  category: string;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [kycStatus, setKycStatus] = useState<string>('');
  const [balance, setBalance] = useState<number | null>(null);
  const [hideBalance, setHideBalance] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositInstructionsModal, setShowDepositInstructionsModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [copiedField, setCopiedField] = useState('');
  const [memoItems, setMemoItems] = useState<MemoItem[]>([]);
  const [memosLoading, setMemosLoading] = useState(true);
  const [memosError, setMemosError] = useState<string | null>(null);

  // Bank details for deposit instructions
  const [bankDetails] = useState({
    bankName: 'Equity Bank',
    accountName: 'Estien Capital Limited',
    accountNumber: '1234567890',
    swiftCode: 'EQBLKEXX',
    branchCode: '123',
  });

  // Payment methods for withdrawals
  const [paymentMethods] = useState([
    {
      id: '1',
      name: 'Equity Bank',
      accountNumber: '1234567890',
      accountName: 'John Doe',
    },
    {
      id: '2',
      name: 'M-PESA',
      accountNumber: '254712345678',
      accountName: 'John Doe',
    },
  ]);

  const portfolioValue = 125000.75;
  const totalGain = 12500.50;
  const gainPercentage = 11.11;
  const availableCash = 5000.00;

  const timeframes = ['1D', '1W', '1M', '3M', '1Y'];

  const marketData: MarketData[] = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 45250.30,
      change: 1250.50,
      changePercent: 2.84,
      image: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 2850.75,
      change: -45.20,
      changePercent: -1.56,
      image: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      price: 0.85,
      change: 0.05,
      changePercent: 6.25,
      image: 'https://images.pexels.com/photos/730564/pexels-photo-730564.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
  ];

  const quickActions = [
    { id: 'deposit', title: 'Deposit', icon: Plus, color: colors.success, description: 'Add funds', onPress: () => setShowDepositModal(true) },
    { id: 'withdraw', title: 'Withdraw', icon: Minus, color: colors.error, description: 'Take profits', onPress: () => setShowWithdrawModal(true) },
    { id: 'invest', title: 'Invest', icon: TrendingUp, color: colors.primary, description: 'View products', onPress: () => router.push('/products') },
    { id: 'goals', title: 'Goals', icon: Target, color: colors.warning, description: 'Set targets', onPress: () => {/* TODO: handle goals */} },
  ];

  const recentTransactions = [
    {
      id: '1',
      type: 'deposit',
      amount: 5000,
      status: 'completed',
      date: '2024-01-15',
      description: 'Bank Transfer',
      asset: 'USD',
    },
    {
      id: '2',
      type: 'buy',
      amount: 2000,
      status: 'completed',
      date: '2024-01-14',
      description: 'Bitcoin Purchase',
      asset: 'BTC',
    },
    {
      id: '3',
      type: 'sell',
      amount: 1500,
      status: 'completed',
      date: '2024-01-13',
      description: 'Ethereum Sale',
      asset: 'ETH',
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  // Modal handlers
  const handleDepositInstructions = () => {
    setShowDepositModal(false);
    setShowDepositInstructionsModal(true);
  };

  const handleDepositConfirmation = () => {
    setShowDepositInstructionsModal(false);
    setDepositAmount('');
  };

  const handleWithdraw = () => {
    setShowWithdrawModal(false);
    setWithdrawAmount('');
    setSelectedPaymentMethod('');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchAndCacheProfile = async () => {
      if (user?.id) {
        try {
          const res = await fetch(`${BASE_URL}/api/profile/${user.id}`);
          const data = await res.json();
          console.log('DEBUG: Profile API response:', data);
          setProfile(data);
          // Cache name locally
          if (data?.first_name && data?.last_name) {
            await AsyncStorage.setItem('cached_name', JSON.stringify({ firstName: data.first_name, lastName: data.last_name }));
          }
        } catch (e) {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      // Try to load cached name for fast UI
      const cached = await AsyncStorage.getItem('cached_name');
      if (cached) {
        const { firstName, lastName } = JSON.parse(cached);
        setProfile((prev: any) => ({ ...prev, first_name: firstName, last_name: lastName }));
      }
    };
    fetchAndCacheProfile();
  }, [user?.id]);

  useEffect(() => {
    setMemosLoading(true);
    setMemosError(null);
    fetch(`${BASE_URL}/api/memos`)
      .then(res => res.json())
      .then(data => {
        setMemoItems(data);
        setMemosLoading(false);
      })
      .catch(err => {
        setMemosError('Failed to load memos');
        setMemosLoading(false);
      });
  }, []);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.username, { color: colors.text }]}> 
              {(profile?.first_name ?? user?.firstName ?? 'User') + ' ' + (profile?.last_name ?? user?.lastName ?? '')}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.card }]}>
              <Search size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.card }]}>
              <Bell size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.profileButton, { backgroundColor: colors.primary }]}>
              <Text style={[styles.profileText, { color: colors.background }]}> 
                {(profile?.first_name?.charAt(0) ?? user?.firstName?.charAt(0) ?? 'U')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Portfolio Overview */}
      <View style={styles.portfolioSection}>
        <LinearGradient
          colors={[colors.primary, '#FFA500']}
          style={styles.portfolioCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.portfolioHeader}>
            <View>
              <Text style={[styles.portfolioTitle, { color: colors.background }]}>
                Total Portfolio Value
              </Text>
              <Text style={[styles.portfolioValue, { color: colors.background }]}>
                {hideBalance ? '••••••••' : `KES ${(balance ?? 0).toLocaleString()}`}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setHideBalance(!hideBalance)}>
              {hideBalance ? (
                <EyeOff size={24} color={colors.background} />
              ) : (
                <Eye size={24} color={colors.background} />
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.portfolioStats}>
            <View style={styles.portfolioStat}>
              <TrendingUp size={16} color={colors.background} />
              <Text style={[styles.gainText, { color: colors.background }]}>
                +KES {totalGain.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Timeframe Selector */}
          <View style={styles.timeframeContainer}>
            {timeframes.map((timeframe) => (
              <TouchableOpacity
                key={timeframe}
                style={[
                  styles.timeframeButton,
                  {
                    backgroundColor: selectedTimeframe === timeframe 
                      ? colors.background + '30' 
                      : 'transparent',
                  },
                ]}
                onPress={() => setSelectedTimeframe(timeframe)}
              >
                <Text
                  style={[
                    styles.timeframeText,
                    {
                      color: colors.background,
                      fontWeight: selectedTimeframe === timeframe ? 'bold' : 'normal',
                    },
                  ]}
                >
                  {timeframe}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.quickActionCard, { backgroundColor: colors.card }]}
              activeOpacity={0.7}
              onPress={action.onPress}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                <action.icon size={24} color={action.color} />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                {action.title}
              </Text>
              <Text style={[styles.quickActionDescription, { color: colors.textSecondary }]}>
                {action.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Deposit Modal */}
      <DepositModal
        visible={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        amount={depositAmount}
        setAmount={setDepositAmount}
        onGetInstructions={handleDepositInstructions}
        colors={colors}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        visible={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        amount={withdrawAmount}
        setAmount={setWithdrawAmount}
        availableBalance={availableCash}
        paymentMethods={paymentMethods}
        selectedPaymentMethod={selectedPaymentMethod}
        setSelectedPaymentMethod={setSelectedPaymentMethod}
        onWithdraw={handleWithdraw}
        colors={colors}
      />

      {/* Deposit Instructions Modal */}
      <DepositInstructionsModal
        visible={showDepositInstructionsModal}
        onClose={() => setShowDepositInstructionsModal(false)}
        amount={depositAmount}
        bankDetails={bankDetails}
        copiedField={copiedField}
        onCopy={(val, field) => {
          // TODO: Implement copy functionality
          setCopiedField(field);
          console.log('Copied:', val);
        }}
        onConfirm={handleDepositConfirmation}
        colors={colors}
      />

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );

  function getActivityColor(type: string) {
    switch (type) {
      case 'deposit':
        return colors.success;
      case 'withdraw':
        return colors.error;
      case 'buy':
        return colors.primary;
      case 'sell':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  }

  function getActivityIcon(type: string, color: string) {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft size={20} color={color} />;
      case 'withdraw':
        return <ArrowUpRight size={20} color={color} />;
      case 'buy':
        return <Plus size={20} color={color} />;
      case 'sell':
        return <Minus size={20} color={color} />;
      default:
        return <Activity size={20} color={color} />;
    }
  }

  function getActivityAmountColor(type: string) {
    switch (type) {
      case 'deposit':
      case 'sell':
        return colors.success;
      case 'withdraw':
      case 'buy':
        return colors.error;
      default:
        return colors.text;
    }
  }

  function getActivityPrefix(type: string) {
    switch (type) {
      case 'deposit':
      case 'sell':
        return '+';
      case 'withdraw':
      case 'buy':
        return '-';
      default:
        return '';
    }
  }
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  portfolioSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  portfolioCard: {
    padding: 24,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  portfolioTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.9,
  },
  portfolioValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  portfolioStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gainText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeframeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeframeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timeframeText: {
    fontSize: 14,
  },
  quickActionsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 40,
  },
});