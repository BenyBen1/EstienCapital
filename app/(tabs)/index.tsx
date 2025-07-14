import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Minus, TrendingUp, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, ChartPie as PieChart, Activity } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import DepositModal from '@/components/DepositModal';
import WithdrawModal from '@/components/WithdrawModal';
import DepositInstructionsModal from '@/components/DepositInstructionsModal';
import { BASE_URL } from '@/services/config';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '@/services/apiFetch';

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
  
  // Investment Calculator State
  const [calculatorVisible, setCalculatorVisible] = useState(false);
  const [initialAmount, setInitialAmount] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [annualReturn, setAnnualReturn] = useState('');
  const [investmentYears, setInvestmentYears] = useState('');
  const [calculatorResult, setCalculatorResult] = useState<{
    finalAmount: number;
    totalContributions: number;
    totalReturns: number;
  } | null>(null);

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
    { id: 'calculator', title: 'Calculator', icon: PieChart, color: colors.warning, description: 'Investment calc', onPress: () => setCalculatorVisible(true) },
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

  // Investment Calculator Functions
  const calculateCompoundInterest = () => {
    const principal = parseFloat(initialAmount) || 0;
    const monthlyAmount = parseFloat(monthlyContribution) || 0;
    const rate = parseFloat(annualReturn) / 100 || 0;
    const years = parseInt(investmentYears) || 0;
    
    if (years === 0) return;

    let futureValue = principal;
    let totalContributions = principal;

    // Calculate compound interest with monthly contributions
    for (let year = 1; year <= years; year++) {
      // Add monthly contributions throughout the year
      for (let month = 1; month <= 12; month++) {
        futureValue += monthlyAmount;
        totalContributions += monthlyAmount;
        // Apply monthly compound interest
        futureValue *= (1 + rate / 12);
      }
    }

    const totalReturns = futureValue - totalContributions;

    setCalculatorResult({
      finalAmount: Math.round(futureValue * 100) / 100,
      totalContributions: Math.round(totalContributions * 100) / 100,
      totalReturns: Math.round(totalReturns * 100) / 100,
    });
  };

  const resetCalculator = () => {
    setInitialAmount('');
    setMonthlyContribution('');
    setAnnualReturn('');
    setInvestmentYears('');
    setCalculatorResult(null);
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
          const res = await apiFetch(`/api/profile/${user.id}`);
          const data = await res.json();
          if (data?.error && (data.error.includes('token') || data.error.includes('Session expired'))) {
            setProfile(null);
            return;
          }
          setProfile(data);
        } catch (e) {
          setProfile(null);
        }
      } else {
        setProfile(null);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Fixed Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, elevation: 10 }]}> 
        <View style={styles.headerContent}> 
          <View style={styles.headerLeft}> 
            <Text style={[styles.greeting, { color: colors.textSecondary }]}> 
              {getGreeting()} 
            </Text> 
            <Text style={[styles.username, { color: colors.text }]}> 
              {(profile?.first_name ?? user?.firstName ?? 'User') + ' ' + (profile?.last_name ?? user?.lastName ?? '')} 
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
                  action.id === 'deposit'
                    ? { backgroundColor: colors.success + '33' }
                    : action.id === 'withdraw'
                    ? { backgroundColor: colors.error + '33' }
                    : { backgroundColor: '#232323' },
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
          onCopy={(val, field) => {
            // TODO: Implement copy functionality
            setCopiedField(field);
            console.log('Copied:', val);
          }}
          onConfirm={handleDepositConfirmation}
          colors={colors}
        />

        {/* Investment Calculator Modal */}
        <Modal
          visible={calculatorVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setCalculatorVisible(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Investment Calculator
                </Text>
                <TouchableOpacity
                  onPress={() => setCalculatorVisible(false)}
                  style={[styles.closeButton, { backgroundColor: colors.error + '20' }]}
                >
                  <Text style={[styles.closeButtonText, { color: colors.error }]}>×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.calculatorContent} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Initial Investment (KES)
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    value={initialAmount}
                    onChangeText={setInitialAmount}
                    placeholder="e.g., 100000"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Monthly Contribution (KES)
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    value={monthlyContribution}
                    onChangeText={setMonthlyContribution}
                    placeholder="e.g., 5000"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Expected Annual Return (%)
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    value={annualReturn}
                    onChangeText={setAnnualReturn}
                    placeholder="e.g., 12"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Investment Period (Years)
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    value={investmentYears}
                    onChangeText={setInvestmentYears}
                    placeholder="e.g., 10"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.calculatorButtons}>
                  <TouchableOpacity
                    style={[styles.calculateButton, { backgroundColor: colors.primary }]}
                    onPress={calculateCompoundInterest}
                  >
                    <Text style={[styles.calculateButtonText, { color: colors.background }]}>
                      Calculate
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.resetButton, { backgroundColor: colors.error + '20' }]}
                    onPress={resetCalculator}
                  >
                    <Text style={[styles.resetButtonText, { color: colors.error }]}>
                      Reset
                    </Text>
                  </TouchableOpacity>
                </View>

                {calculatorResult && (
                  <View style={[styles.resultContainer, { backgroundColor: colors.card }]}>
                    <Text style={[styles.resultTitle, { color: colors.text }]}>
                      Investment Projection
                    </Text>
                    
                    <View style={styles.resultRow}>
                      <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                        Total Contributions:
                      </Text>
                      <Text style={[styles.resultValue, { color: colors.text }]}>
                        KES {calculatorResult.totalContributions.toLocaleString()}
                      </Text>
                    </View>

                    <View style={styles.resultRow}>
                      <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                        Total Returns:
                      </Text>
                      <Text style={[styles.resultValue, { color: colors.success }]}>
                        KES {calculatorResult.totalReturns.toLocaleString()}
                      </Text>
                    </View>

                    <View style={[styles.resultRow, styles.finalResultRow]}>
                      <Text style={[styles.resultLabel, { color: colors.text, fontWeight: 'bold' }]}>
                        Final Amount:
                      </Text>
                      <Text style={[styles.finalResultValue, { color: colors.primary }]}>
                        KES {calculatorResult.finalAmount.toLocaleString()}
                      </Text>
                    </View>

                    <View style={styles.percentageGain}>
                      <Text style={[styles.percentageText, { color: colors.success }]}>
                        {calculatorResult.totalContributions > 0 
                          ? `+${Math.round((calculatorResult.totalReturns / calculatorResult.totalContributions) * 100)}% Total Gain`
                          : '+0% Total Gain'
                        }
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

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
  
  // Investment Calculator Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  calculatorContent: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  calculatorButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  calculateButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  finalResultRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    marginTop: 8,
  },
  resultLabel: {
    fontSize: 14,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  finalResultValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  percentageGain: {
    alignItems: 'center',
    marginTop: 12,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});