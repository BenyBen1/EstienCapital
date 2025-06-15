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
  Bell,
  Search,
  MoreHorizontal,
  DollarSign,
  PieChart,
  Activity,
  Zap,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  image: string;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  image: string;
  timestamp: string;
  category: string;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [hideBalance, setHideBalance] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');

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

  const newsItems: NewsItem[] = [
    {
      id: '1',
      title: 'Bitcoin Reaches New Monthly High',
      summary: 'Institutional adoption drives BTC to new heights as major corporations announce treasury allocations.',
      image: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      timestamp: '2 hours ago',
      category: 'Market',
    },
    {
      id: '2',
      title: 'DeFi Protocol Launches New Yield Farming',
      summary: 'Revolutionary staking mechanism promises higher returns with reduced risk exposure.',
      image: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      timestamp: '4 hours ago',
      category: 'DeFi',
    },
  ];

  const quickActions = [
    { id: 'deposit', title: 'Deposit', icon: Plus, color: colors.success, description: 'Add funds' },
    { id: 'withdraw', title: 'Withdraw', icon: Minus, color: colors.error, description: 'Take profits' },
    { id: 'invest', title: 'Invest', icon: TrendingUp, color: colors.primary, description: 'Buy assets' },
    { id: 'goals', title: 'Goals', icon: Target, color: colors.warning, description: 'Set targets' },
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

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
              {user?.firstName || 'John'}
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
                {user?.firstName?.charAt(0) || 'J'}
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
                {hideBalance ? '••••••••' : `KES ${portfolioValue.toLocaleString()}`}
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
                +KES {totalGain.toLocaleString()} (+{gainPercentage}%)
              </Text>
            </View>
            <View style={styles.portfolioStat}>
              <DollarSign size={16} color={colors.background} />
              <Text style={[styles.cashText, { color: colors.background }]}>
                Cash: KES {availableCash.toLocaleString()}
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

      {/* Market Overview */}
      <View style={styles.marketSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Market Overview
          </Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>
              View All
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.marketCards}>
            {marketData.map((item) => (
              <TouchableOpacity
                key={item.symbol}
                style={[styles.marketCard, { backgroundColor: colors.card }]}
              >
                <View style={styles.marketCardHeader}>
                  <Image source={{ uri: item.image }} style={styles.marketIcon} />
                  <View style={styles.marketInfo}>
                    <Text style={[styles.marketSymbol, { color: colors.text }]}>
                      {item.symbol}
                    </Text>
                    <Text style={[styles.marketName, { color: colors.textSecondary }]}>
                      {item.name}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.marketPrice, { color: colors.text }]}>
                  ${item.price.toLocaleString()}
                </Text>
                <View style={styles.marketChange}>
                  {item.change > 0 ? (
                    <ArrowUpRight size={16} color={colors.success} />
                  ) : (
                    <ArrowDownLeft size={16} color={colors.error} />
                  )}
                  <Text
                    style={[
                      styles.marketChangeText,
                      { color: item.change > 0 ? colors.success : colors.error },
                    ]}
                  >
                    {item.changePercent > 0 ? '+' : ''}{item.changePercent}%
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
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
          <TouchableOpacity
            key={transaction.id}
            style={[styles.activityCard, { backgroundColor: colors.card }]}
          >
            <View style={styles.activityLeft}>
              <View
                style={[
                  styles.activityIcon,
                  {
                    backgroundColor: getActivityColor(transaction.type) + '20',
                  },
                ]}
              >
                {getActivityIcon(transaction.type, getActivityColor(transaction.type))}
              </View>
              <View style={styles.activityInfo}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>
                  {transaction.description}
                </Text>
                <Text style={[styles.activityDate, { color: colors.textSecondary }]}>
                  {transaction.date} • {transaction.asset}
                </Text>
              </View>
            </View>
            
            <View style={styles.activityRight}>
              <Text
                style={[
                  styles.activityAmount,
                  {
                    color: getActivityAmountColor(transaction.type),
                  },
                ]}
              >
                {getActivityPrefix(transaction.type)}KES {transaction.amount.toLocaleString()}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                <Text style={[styles.statusText, { color: colors.success }]}>
                  {transaction.status}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* News & Insights */}
      <View style={styles.newsSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Market News
          </Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>
              View All
            </Text>
          </TouchableOpacity>
        </View>
        
        {newsItems.map((news) => (
          <TouchableOpacity
            key={news.id}
            style={[styles.newsCard, { backgroundColor: colors.card }]}
          >
            <Image source={{ uri: news.image }} style={styles.newsImage} />
            <View style={styles.newsContent}>
              <View style={styles.newsHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.categoryText, { color: colors.primary }]}>
                    {news.category}
                  </Text>
                </View>
                <Text style={[styles.newsTimestamp, { color: colors.textSecondary }]}>
                  {news.timestamp}
                </Text>
              </View>
              <Text style={[styles.newsTitle, { color: colors.text }]}>
                {news.title}
              </Text>
              <Text style={[styles.newsSummary, { color: colors.textSecondary }]}>
                {news.summary}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

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
  cashText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
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
  marketSection: {
    paddingLeft: 24,
    marginBottom: 32,
  },
  marketCards: {
    flexDirection: 'row',
    gap: 16,
    paddingRight: 24,
  },
  marketCard: {
    width: 160,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  marketCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  marketIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  marketInfo: {
    flex: 1,
  },
  marketSymbol: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  marketName: {
    fontSize: 12,
  },
  marketPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  marketChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  marketChangeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activitySection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  activityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  newsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  newsCard: {
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 160,
  },
  newsContent: {
    padding: 16,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  newsTimestamp: {
    fontSize: 12,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 22,
  },
  newsSummary: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});