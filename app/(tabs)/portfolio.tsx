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
import { LineChart, PieChart } from 'react-native-chart-kit';
import { TrendingUp, TrendingDown, Eye, EyeOff, Info, MoveHorizontal as MoreHorizontal, ArrowUpRight, ArrowDownLeft, ChartPie as PieChartIcon, ChartBar as BarChart3, Filter, Download } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface Holding {
  id: string;
  name: string;
  symbol: string;
  allocation: number;
  value: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
  quantity: number;
  avgPrice: number;
  image: string;
}

interface PerformanceMetric {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
}

export default function PortfolioScreen() {
  const { colors } = useTheme();
  const [hideBalance, setHideBalance] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [chartType, setChartType] = useState<'line' | 'pie'>('line');
  const [refreshing, setRefreshing] = useState(false);

  const portfolioData = {
    totalValue: 125000.75,
    totalInvested: 112500.00,
    totalGain: 12500.75,
    gainPercentage: 11.11,
    dayChange: 850.25,
    dayChangePercent: 0.68,
  };

  const periods = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [95000, 102000, 108000, 115000, 120000, 125000],
        color: (opacity = 1) => colors.primary,
        strokeWidth: 3,
      },
    ],
  };

  const pieChartData = [
    {
      name: 'Bitcoin',
      population: 45,
      color: '#F7931A',
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: 'Ethereum',
      population: 30,
      color: '#627EEA',
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: 'Cardano',
      population: 15,
      color: '#0033AD',
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: 'Others',
      population: 10,
      color: colors.textSecondary,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
  ];

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.primary,
    labelColor: (opacity = 1) => colors.textSecondary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
    propsForLabels: {
      fontSize: 12,
    },
  };

  const holdings: Holding[] = [
    {
      id: '1',
      name: 'Bitcoin',
      symbol: 'BTC',
      allocation: 45,
      value: 56250.34,
      change: 1250.50,
      changePercent: 2.27,
      isPositive: true,
      quantity: 1.24,
      avgPrice: 45320.50,
      image: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      id: '2',
      name: 'Ethereum',
      symbol: 'ETH',
      allocation: 30,
      value: 37500.23,
      change: -450.75,
      changePercent: -1.19,
      isPositive: false,
      quantity: 13.15,
      avgPrice: 2851.25,
      image: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      id: '3',
      name: 'Cardano',
      symbol: 'ADA',
      allocation: 15,
      value: 18750.12,
      change: 325.80,
      changePercent: 1.77,
      isPositive: true,
      quantity: 22050,
      avgPrice: 0.85,
      image: 'https://images.pexels.com/photos/730564/pexels-photo-730564.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      id: '4',
      name: 'Polkadot',
      symbol: 'DOT',
      allocation: 10,
      value: 12500.06,
      change: 125.45,
      changePercent: 1.01,
      isPositive: true,
      quantity: 1785.5,
      avgPrice: 7.00,
      image: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
  ];

  const performanceMetrics: PerformanceMetric[] = [
    {
      label: 'Total Return',
      value: `+${portfolioData.gainPercentage}%`,
      change: '+2.5%',
      isPositive: true,
    },
    {
      label: 'Best Performer',
      value: 'BTC',
      change: '+2.27%',
      isPositive: true,
    },
    {
      label: 'Worst Performer',
      value: 'ETH',
      change: '-1.19%',
      isPositive: false,
    },
    {
      label: 'Portfolio Beta',
      value: '1.25',
    },
    {
      label: 'Sharpe Ratio',
      value: '1.85',
    },
    {
      label: 'Max Drawdown',
      value: '-8.5%',
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Portfolio
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.card }]}>
              <Filter size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.card }]}>
              <Download size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setHideBalance(!hideBalance)}>
              {hideBalance ? (
                <EyeOff size={24} color={colors.text} />
              ) : (
                <Eye size={24} color={colors.text} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Portfolio Summary */}
      <View style={styles.summarySection}>
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <View style={styles.summaryHeader}>
            <Text style={[styles.summaryTitle, { color: colors.textSecondary }]}>
              Total Portfolio Value
            </Text>
            <TouchableOpacity>
              <Info size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {hideBalance ? '••••••••' : `KES ${portfolioData.totalValue.toLocaleString()}`}
          </Text>
          
          <View style={styles.summaryStats}>
            <View style={styles.summaryStatItem}>
              <Text style={[styles.summaryStatLabel, { color: colors.textSecondary }]}>
                Total Invested
              </Text>
              <Text style={[styles.summaryStatValue, { color: colors.text }]}>
                {hideBalance ? '••••••••' : `KES ${portfolioData.totalInvested.toLocaleString()}`}
              </Text>
            </View>
            
            <View style={styles.summaryStatItem}>
              <Text style={[styles.summaryStatLabel, { color: colors.textSecondary }]}>
                Total Gain/Loss
              </Text>
              <View style={styles.gainContainer}>
                {portfolioData.gainPercentage > 0 ? (
                  <TrendingUp size={16} color={colors.success} />
                ) : (
                  <TrendingDown size={16} color={colors.error} />
                )}
                <Text
                  style={[
                    styles.summaryStatValue,
                    { color: portfolioData.gainPercentage > 0 ? colors.success : colors.error },
                  ]}
                >
                  {hideBalance ? '••••••••' : `+KES ${portfolioData.totalGain.toLocaleString()}`}
                </Text>
              </View>
              <Text
                style={[
                  styles.gainPercentage,
                  { color: portfolioData.gainPercentage > 0 ? colors.success : colors.error },
                ]}
              >
                {hideBalance ? '••••' : `+${portfolioData.gainPercentage}%`}
              </Text>
            </View>
          </View>

          {/* Day Change */}
          <View style={[styles.dayChangeContainer, { backgroundColor: colors.success + '10' }]}>
            <View style={styles.dayChangeContent}>
              <Text style={[styles.dayChangeLabel, { color: colors.textSecondary }]}>
                Today's Change
              </Text>
              <View style={styles.dayChangeValue}>
                <TrendingUp size={16} color={colors.success} />
                <Text style={[styles.dayChangeAmount, { color: colors.success }]}>
                  +KES {portfolioData.dayChange.toLocaleString()} (+{portfolioData.dayChangePercent}%)
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Time Period Selector */}
      <View style={styles.periodSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.periodButtons}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  {
                    backgroundColor:
                      selectedPeriod === period ? colors.primary : colors.card,
                  },
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    {
                      color:
                        selectedPeriod === period ? colors.background : colors.text,
                    },
                  ]}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Chart Section */}
      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>
            Performance Chart
          </Text>
          <View style={styles.chartToggle}>
            <TouchableOpacity
              style={[
                styles.chartToggleButton,
                {
                  backgroundColor: chartType === 'line' ? colors.primary : colors.card,
                },
              ]}
              onPress={() => setChartType('line')}
            >
              <BarChart3 size={16} color={chartType === 'line' ? colors.background : colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chartToggleButton,
                {
                  backgroundColor: chartType === 'pie' ? colors.primary : colors.card,
                },
              ]}
              onPress={() => setChartType('pie')}
            >
              <PieChartIcon size={16} color={chartType === 'pie' ? colors.background : colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
          {chartType === 'line' ? (
            <LineChart
              data={chartData}
              width={width - 48}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withDots={true}
              withShadow={false}
              withVerticalLines={false}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
            />
          ) : (
            <PieChart
              data={pieChartData}
              width={width - 48}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 50]}
              absolute
            />
          )}
        </View>
      </View>

      {/* Holdings */}
      <View style={styles.holdingsSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Holdings
          </Text>
          <TouchableOpacity>
            <MoreHorizontal size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {holdings.map((holding) => (
          <TouchableOpacity
            key={holding.id}
            style={[styles.holdingCard, { backgroundColor: colors.card }]}
          >
            <View style={styles.holdingLeft}>
              <Image source={{ uri: holding.image }} style={styles.holdingIcon} />
              <View style={styles.holdingInfo}>
                <View style={styles.holdingHeader}>
                  <Text style={[styles.holdingName, { color: colors.text }]}>
                    {holding.name}
                  </Text>
                  <Text style={[styles.holdingSymbol, { color: colors.textSecondary }]}>
                    {holding.symbol}
                  </Text>
                </View>
                <View style={styles.holdingDetails}>
                  <Text style={[styles.holdingQuantity, { color: colors.textSecondary }]}>
                    {holding.quantity.toLocaleString()} {holding.symbol}
                  </Text>
                  <Text style={[styles.holdingAllocation, { color: colors.textSecondary }]}>
                    {holding.allocation}% of portfolio
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.holdingRight}>
              <Text style={[styles.holdingValue, { color: colors.text }]}>
                {hideBalance ? '••••••••' : `KES ${holding.value.toLocaleString()}`}
              </Text>
              <View style={styles.holdingChangeContainer}>
                {holding.isPositive ? (
                  <TrendingUp size={12} color={colors.success} />
                ) : (
                  <TrendingDown size={12} color={colors.error} />
                )}
                <Text
                  style={[
                    styles.holdingChange,
                    { color: holding.isPositive ? colors.success : colors.error },
                  ]}
                >
                  {hideBalance ? '••••' : `${holding.isPositive ? '+' : ''}${holding.changePercent}%`}
                </Text>
              </View>
              <Text style={[styles.holdingChangeAmount, { color: colors.textSecondary }]}>
                {hideBalance ? '••••' : `${holding.isPositive ? '+' : ''}KES ${Math.abs(holding.change).toLocaleString()}`}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Performance Metrics */}
      <View style={styles.metricsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Performance Metrics
        </Text>
        
        <View style={styles.metricsGrid}>
          {performanceMetrics.map((metric, index) => (
            <View
              key={index}
              style={[styles.metricCard, { backgroundColor: colors.card }]}
            >
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                {metric.label}
              </Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {metric.value}
              </Text>
              {metric.change && (
                <View style={styles.metricChange}>
                  {metric.isPositive ? (
                    <ArrowUpRight size={12} color={colors.success} />
                  ) : (
                    <ArrowDownLeft size={12} color={colors.error} />
                  )}
                  <Text
                    style={[
                      styles.metricChangeText,
                      { color: metric.isPositive ? colors.success : colors.error },
                    ]}
                  >
                    {metric.change}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottomSpacing} />
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summarySection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  summaryCard: {
    padding: 24,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryStatItem: {
    flex: 1,
  },
  summaryStatLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  gainPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  dayChangeContainer: {
    padding: 16,
    borderRadius: 12,
  },
  dayChangeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayChangeLabel: {
    fontSize: 14,
  },
  dayChangeValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayChangeAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  periodSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chartToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  chartToggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  holdingsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  holdingCard: {
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
  holdingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  holdingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  holdingName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  holdingSymbol: {
    fontSize: 12,
    fontWeight: '500',
  },
  holdingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  holdingQuantity: {
    fontSize: 12,
  },
  holdingAllocation: {
    fontSize: 12,
  },
  holdingRight: {
    alignItems: 'flex-end',
  },
  holdingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  holdingChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 2,
  },
  holdingChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  holdingChangeAmount: {
    fontSize: 10,
  },
  metricsSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metricChangeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});