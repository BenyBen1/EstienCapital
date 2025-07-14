import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { DollarSign } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { TransactionCard } from './TransactionCard';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'buy' | 'sell';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  description: string;
  reference?: string;
  asset?: string;
  fee?: number;
  image?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  refreshing: boolean;
  onRefresh: () => void;
  onTransactionPress?: (transaction: Transaction) => void;
}

export function TransactionList({ 
  transactions, 
  refreshing, 
  onRefresh,
  onTransactionPress 
}: TransactionListProps) {
  const { colors } = useTheme();

  return (
    <ScrollView 
      style={styles.transactionsList}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <DollarSign size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            No transactions found
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
            Try adjusting your search or filters
          </Text>
        </View>
      ) : (
        transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onPress={() => onTransactionPress?.(transaction)}
          />
        ))
      )}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  transactionsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 40,
  },
}); 