import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Plus, 
  Minus, 
  TrendingUp, 
  Eye, 
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Target,
  Settings,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors } = useTheme();
  const [hideBalance, setHideBalance] = useState(false);

  const portfolioValue = 125000.75;
  const totalGain = 12500.50;
  const gainPercentage = 11.11;

  const quickActions = [
    { id: 'deposit', title: 'Deposit', icon: Plus, color: colors.success },
    { id: 'withdraw', title: 'Withdraw', icon: Minus, color: colors.error },
    { id: 'goals', title: 'Goals', icon: Target, color: colors.primary },
    { id: 'settings', title: 'Settings', icon: Settings, color: colors.textSecondary },
  ];

  const recentTransactions = [
    {
      id: '1',
      type: 'deposit',
      amount: 5000,
      status: 'completed',
      date: '2024-01-15',
      description: 'Deposit to Digitika Fund',
    },
    {
      id: '2',
      type: 'withdrawal',
      amount: 2000,
      status: 'pending',
      date: '2024-01-14',
      description: 'Withdrawal request',
    },
    {
      id: '3',
      type: 'deposit',
      amount: 10000,
      status: 'completed',
      date: '2024-01-10',
      description: 'Initial investment',
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Good morning
            </Text>
            <Text style={[styles.username, { color: colors.text }]}>
              John Doe
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.logoContainer, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.logoText, { color: colors.background }]}>
              E
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Portfolio Overview */}
      <View style={styles.portfolioSection}>
        <LinearGradient
          colors={[colors.primary, '#FFA500']}
          style={styles.portfolioCard}
        >
          <View style={styles.portfolioHeader}>
            <Text style={[styles.portfolioTitle, { color: colors.background }]}>
              Total Portfolio Value
            </Text>
            <TouchableOpacity onPress={() => setHideBalance(!hideBalance)}>
              {hideBalance ? (
                <EyeOff size={20} color={colors.background} />
              ) : (
                <Eye size={20} color={colors.background} />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.portfolioValue, { color: colors.background }]}>
            {hideBalance ? '••••••••' : `KES ${portfolioValue.toLocaleString()}`}
          </Text>
          
          <View style={styles.gainContainer}>
            <TrendingUp size={16} color={colors.background} />
            <Text style={[styles.gainText, { color: colors.background }]}>
              +KES {totalGain.toLocaleString()} (+{gainPercentage}%)
            </Text>
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
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                <action.icon size={24} color={action.color} />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Investment Products */}
      <View style={styles.productsSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Investments
          </Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>
              View All
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={[styles.productCard, { backgroundColor: colors.card }]}>
          <View style={styles.productHeader}>
            <View>
              <Text style={[styles.productName, { color: colors.text }]}>
                Digitika Fund
              </Text>
              <Text style={[styles.productDescription, { color: colors.textSecondary }]}>
                Cryptocurrency Portfolio
              </Text>
            </View>
            <ArrowUpRight size={20} color={colors.primary} />
          </View>
          
          <View style={styles.productStats}>
            <View style={styles.productStat}>
              <Text style={[styles.productStatLabel, { color: colors.textSecondary }]}>
                Investment
              </Text>
              <Text style={[styles.productStatValue, { color: colors.text }]}>
                KES 112,500
              </Text>
            </View>
            <View style={styles.productStat}>
              <Text style={[styles.productStatLabel, { color: colors.textSecondary }]}>
                Current Value
              </Text>
              <Text style={[styles.productStatValue, { color: colors.success }]}>
                KES 125,000
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions */}
      <View style={styles.transactionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Activity
          </Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>
              View All
            </Text>
          </TouchableOpacity>
        </View>
        
        {recentTransactions.slice(0, 3).map((transaction) => (
          <View
            key={transaction.id}
            style={[styles.transactionCard, { backgroundColor: colors.card }]}
          >
            <View style={styles.transactionLeft}>
              <View
                style={[
                  styles.transactionIcon,
                  {
                    backgroundColor:
                      transaction.type === 'deposit'
                        ? colors.success + '20'
                        : colors.error + '20',
                  },
                ]}
              >
                {transaction.type === 'deposit' ? (
                  <ArrowDownLeft
                    size={16}
                    color={transaction.type === 'deposit' ? colors.success : colors.error}
                  />
                ) : (
                  <ArrowUpRight
                    size={16}
                    color={transaction.type === 'deposit' ? colors.success : colors.error}
                  />
                )}
              </View>
              <View>
                <Text style={[styles.transactionTitle, { color: colors.text }]}>
                  {transaction.description}
                </Text>
                <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                  {transaction.date}
                </Text>
              </View>
            </View>
            
            <View style={styles.transactionRight}>
              <Text
                style={[
                  styles.transactionAmount,
                  {
                    color: transaction.type === 'deposit' ? colors.success : colors.error,
                  },
                ]}
              >
                {transaction.type === 'deposit' ? '+' : '-'}KES {transaction.amount.toLocaleString()}
              </Text>
              <Text
                style={[
                  styles.transactionStatus,
                  {
                    color:
                      transaction.status === 'completed' ? colors.success : colors.warning,
                  },
                ]}
              >
                {transaction.status}
              </Text>
            </View>
          </View>
        ))}
      </View>
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
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  portfolioSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  portfolioCard: {
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  portfolioTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  gainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gainText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickActionsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  productsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  productCard: {
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productStat: {
    flex: 1,
  },
  productStatLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  productStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionsSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  transactionStatus: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
});