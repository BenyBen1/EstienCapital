import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface TransactionSummaryProps {
  availableBalance: number;
  totalDeposits: number;
  monthlyVolume: number;
  totalTrades: number;
}

export function TransactionSummary({
  availableBalance,
  totalDeposits,
  monthlyVolume,
  totalTrades,
}: TransactionSummaryProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.summarySection}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Available Balance
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              KES {availableBalance.toLocaleString()}
            </Text>
            <View style={styles.summaryChange}>
              <TrendingUp size={12} color={colors.success} />
              <Text style={[styles.summaryChangeText, { color: colors.success }]}>
                +2.5%
              </Text>
            </View>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Total Deposits
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              KES {totalDeposits.toLocaleString()}
            </Text>
            <Text style={[styles.summarySubtext, { color: colors.textSecondary }]}>
              This month
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Monthly Volume
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              KES {monthlyVolume.toLocaleString()}
            </Text>
            <Text style={[styles.summarySubtext, { color: colors.textSecondary }]}>
              {totalTrades} trades
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  summarySection: {
    paddingLeft: 24,
    marginBottom: 24,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 16,
    paddingRight: 24,
  },
  summaryCard: {
    width: 160,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryChangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summarySubtext: {
    fontSize: 12,
  },
}); 