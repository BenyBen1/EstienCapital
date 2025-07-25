import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { Plus, Minus, TrendingUp, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, ChartPie as PieChart, Activity } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import DepositModal from '@/components/DepositModal';
import WithdrawModal from '@/components/WithdrawModal';
import DepositInstructionsModal from '@/components/DepositInstructionsModal';
import { BASE_URL } from '@/services/config';
import { useRouter } from 'expo-router';
import { apiFetch } from '@/services/apiFetch';
import { WalletAPI } from '@/services/walletAPI';

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
  const { user, reloadUserFromStorage } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [kycStatus, setKycStatus] = useState<string>('');
  const [balance, setBalance] = useState<number | null>(null);
  const [hideBalance, setHideBalance] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
  
  // Investment Calculator - Navigation to /calculator screen

  // Bank details for deposit instructions - NCBA Bank
  const [bankDetails] = useState({
    bankName: 'NCBA Bank',
    accountName: 'Estien Capital Limited',
    accountNumber: '1001234567890',
    swiftCode: 'NCBAKEXX',
    branchCode: '001',
    branchName: 'NCBA Westlands Branch',
  });

  // Payment methods for withdrawals
  const [paymentMethods] = useState([
    {
      id: '1',
      name: 'NCBA Bank',
      accountNumber: '1001234567890',
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
    { id: 'topup', title: 'Top Up', icon: ArrowUpRight, color: colors.success, description: 'Quick deposit', onPress: () => setShowDepositModal(true) },
    { id: 'withdraw', title: 'Withdraw', icon: Minus, color: colors.error, description: 'Take profits', onPress: () => setShowWithdrawModal(true) },
    { id: 'invest', title: 'Invest', icon: TrendingUp, color: colors.primary, description: 'View products', onPress: () => router.push('/products') },
    { id: 'calculator', title: 'Calculator', icon: PieChart, color: colors.warning, description: 'Investment calc', onPress: () => router.push('/calculator') },
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
    await fetchWalletBalance();
    setRefreshing(false);
  };

  // Modal handlers
  const handleDepositInstructions = () => {
    setShowDepositModal(false);
    setShowDepositInstructionsModal(true);
  };

  const handleDepositConfirmation = async () => {
    if (!user?.id || !depositAmount) {
      Alert.alert('Error', 'Please ensure you are logged in and have specified an amount.');
      return;
    }

    try {
      setIsLoading(true);

      // Use the WalletAPI to confirm the deposit
      const response = await WalletAPI.confirmDeposit({
        userId: user.id,
        amount: parseFloat(depositAmount),
        paymentMethod: 'bank_transfer',
        depositReference: `DEP_${user.id.slice(0, 8)}_${Date.now()}`,
      });

      // Show success message
      Alert.alert(
        'Deposit Confirmation Received!',
        response.message || 'Your deposit confirmation has been received successfully. Our team will verify your payment and credit your account within 24 hours.\n\nYou can track the status in the Transactions tab.',
        [{ text: 'OK' }]
      );

      // Close modals and reset state
      setShowDepositInstructionsModal(false);
      setDepositAmount('');
      
      // Refresh any relevant data if needed
      // You can add portfolio refresh here if required

    } catch (error: any) {
      console.error('Deposit confirmation error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to confirm deposit. Please try again or contact support.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = () => {
    setShowWithdrawModal(false);
    setWithdrawAmount('');
    setSelectedPaymentMethod('');
  };

  // Investment Calculator Functions
  // The InvestmentCalculator component handles all calculation logic internally

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getActionIconBackground = (actionId: string) => {
    switch (actionId) {
      case 'deposit':
        return colors.success + '33';
      case 'withdraw':
        return colors.error + '33';
      default:
        return '#232323';
    }
  };

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    if (!user?.id) return;
    
    try {
      console.log('Fetching wallet balance for user:', user.id);
      const wallet = await WalletAPI.getWallet(user.id);
      console.log('Wallet data received:', wallet);
      setBalance(wallet.balance || 0);
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      // Silently fail - don't show error to user for wallet balance
    }
  };

  useEffect(() => {
    const fetchAndCacheProfile = async () => {
      console.log('HomeScreen: user from AuthContext:', user);
      if (user?.id) {
        try {
          const res = await apiFetch(`/api/profile/${user.id}`);
          const data = await res.json();
          console.log('HomeScreen: fetched profile data:', data);
          if (data?.error && (data.error.includes('token') || data.error.includes('Session expired'))) {
            console.log('HomeScreen: Profile fetch failed due to auth error');
            setProfile(null);
            return;
          }
          console.log('HomeScreen: Setting profile state:', data);
          setProfile(data);
          
          // Also fetch wallet balance
          await fetchWalletBalance();
        } catch (e) {
          console.log('HomeScreen: Profile fetch error:', e);
          setProfile(null);
        }
      } else {
        console.log('HomeScreen: No user ID available');
        setProfile(null);
      }
    };
    fetchAndCacheProfile();
  }, [user?.id]);

  // Add effect to check for user data in storage if user is null
  useEffect(() => {
    const checkForStoredUser = async () => {
      if (!user) {
        console.log('HomeScreen: User is null, checking for stored data...');
        try {
          await reloadUserFromStorage();
        } catch (error) {
          console.error('HomeScreen: Failed to reload user from storage:', error);
        }
      }
    };
    
    // Only check after a short delay to avoid race conditions
    const timer = setTimeout(checkForStoredUser, 1000);
    return () => clearTimeout(timer);
  }, [user, reloadUserFromStorage]);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Fixed Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, elevation: 10 }]}> 
        <View style={styles.headerContent}> 
          <View style={styles.headerLeft}> 
            <Text style={[styles.greeting, { color: colors.textSecondary }]}> 
              {getGreeting()} 
            </Text> 
            <Text style={[styles.username, { color: colors.text }]}> 
              {(() => {
                const firstName = profile?.first_name ?? user?.firstName ?? 'User';
                const lastName = profile?.last_name ?? user?.lastName ?? '';
                const fullName = firstName + ' ' + lastName;
                console.log('HomeScreen: Displaying name - profile:', profile, 'user:', user, 'fullName:', fullName);
                return fullName;
              })()}
            </Text> 
          </View> 
          <TouchableOpacity style={[styles.profileButton, { backgroundColor: colors.primary }]} onPress={() => router.push('/profile')}> 
            <Text style={[styles.profileText, { color: colors.background }]}> 
              {(profile?.first_name?.charAt(0) ?? user?.firstName?.charAt(0) ?? 'U')} 
            </Text> 
          </TouchableOpacity> 
        </View> 
      </View>
      <ScrollView
        style={{ flex: 1, paddingTop: 100 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }} // add paddingBottom for tab bar
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
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
                <View style={[
                  styles.quickActionIcon,
                  { backgroundColor: getActionIconBackground(action.id) },
                ]}>
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
          onCopy={async (val, field) => {
            await Clipboard.setStringAsync(val);
            setCopiedField(field);
            Alert.alert('Copied', `${field} copied to clipboard`);
          }}
          onConfirm={handleDepositConfirmation}
          colors={colors}
        />

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: 16, // increased from 8
    paddingHorizontal: 20, // slightly more
    paddingBottom: 10, // increased from 6
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
    fontSize: 12, // was 14
    marginBottom: 2, // was 4
  },
  username: {
    fontSize: 18, // was 24
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
    paddingHorizontal: 20,
    marginBottom: 18,
    marginTop: 14,
  },
  portfolioCard: {
    padding: 16, // increased from 10
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 5,
    minHeight: 110,
  },
  portfolioHeader: {
    marginBottom: 10,
  },
  portfolioTitle: {
    fontSize: 14,
    marginBottom: 6,
  },
  portfolioValue: {
    fontSize: 24,
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
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 12,
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
    gap: 14, // more space between
  },
  quickActionCard: {
    width: (width - 54) / 2, // larger
    padding: 18, // more padding
    borderRadius: 14,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#232323', // use a neutral background for all icons
  },
  quickActionText: {
    fontSize: 15,
    marginBottom: 3,
  },
  quickActionDescription: {
    fontSize: 12,
  },
  bottomSpacing: {
    height: 60, // more space at the bottom
  },
});