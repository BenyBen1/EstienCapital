import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { TrendingUp, TrendingDown, Eye, EyeOff, Info } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function PortfolioScreen() {
  const { colors } = useTheme();
  const [hideBalance, setHideBalance] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('1M');

  const portfolioData = {
    totalValue: 125000.75,
    totalInvested: 112500.00,
    totalGain: 12500.75,
    gainPercentage: 11.11,
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

  const holdings = [
    {
      id: '1',
      name: 'Digitika Fund',
      symbol: 'DIGI',
      allocation: 100,
      value: 125000.75,
      change: 11.11,
      isPositive: true,
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Portfolio
          </Text>
          <TouchableOpacity onPress={() => setHideBalance(!hideBalance)}>
            {hideBalance ? (
              <EyeOff size={24} color={colors.text} />
            ) : (
              <Eye size={24} color={colors.text} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Portfolio Summary */}
      <View style={styles.summarySection}>
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.summaryTitle, { color: colors.textSecondary }]}>
            Total Portfolio Value
          </Text>
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

      {/* Performance Chart */}
      <View style={styles.chartSection}>
        <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
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
        </View>
      </View>

      {/* Holdings */}
      <View style={styles.holdingsSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Holdings
          </Text>
          <TouchableOpacity>
            <Info size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {holdings.map((holding) => (
          <TouchableOpacity
            key={holding.id}
            style={[styles.holdingCard, { backgroundColor: colors.card }]}
          >
            <View style={styles.holdingLeft}>
              <View style={[styles.holdingIcon, { backgroundColor: colors.primary }]}>
                <Text style={[styles.holdingIconText, { color: colors.background }]}>
                  {holding.symbol.charAt(0)}
                </Text>
              </View>
              <View style={styles.holdingInfo}>
                <Text style={[styles.holdingName, { color: colors.text }]}>
                  {holding.name}
                </Text>
                <Text style={[styles.holdingSymbol, { color: colors.textSecondary }]}>
                  {holding.allocation}% of portfolio
                </Text>
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
                  {hideBalance ? '••••' : `+${holding.change}%`}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Performance Summary */}
      <View style={styles.performanceSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Performance Summary
        </Text>
        
        <View style={[styles.performanceCard, { backgroundColor: colors.card }]}>
          <View style={styles.performanceRow}>
            <Text style={[styles.performanceLabel, { color: colors.textSecondary }]}>
              Best Performing Asset
            </Text>
            <Text style={[styles.performanceValue, { color: colors.success }]}>
              Digitika Fund (+11.11%)
            </Text>
          </View>
          
          <View style={styles.performanceRow}>
            <Text style={[styles.performanceLabel, { color: colors.textSecondary }]}>
              Asset Allocation
            </Text>
            <Text style={[styles.performanceValue, { color: colors.text }]}>
              100% Cryptocurrency
            </Text>
          </View>
          
          <View style={styles.performanceRow}>
            <Text style={[styles.performanceLabel, { color: colors.textSecondary }]}>
              Risk Level
            </Text>
            <Text style={[styles.performanceValue, { color: colors.warning }]}>
              High Growth
            </Text>
          </View>
        </View>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summarySection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  summaryCard: {
    padding: 24,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryStatItem: {
    flex: 1,
  },
  summaryStatLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gainPercentage: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  holdingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  holdingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  holdingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  holdingIconText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  holdingInfo: {
    flex: 1,
  },
  holdingName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  holdingSymbol: {
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
  },
  holdingChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  performanceSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  performanceCard: {
    padding: 20,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  performanceLabel: {
    fontSize: 14,
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});