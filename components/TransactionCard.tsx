import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ArrowDownLeft, ArrowUpRight, Plus, Minus, DollarSign } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface TransactionCardProps {
  transaction: {
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
  };
  onPress?: () => void;
}

export function TransactionCard({ transaction, onPress }: TransactionCardProps) {
  const { colors } = useTheme();
  const IconComponent = getTransactionIcon(transaction.type);
  const iconColor = getTransactionColor(transaction.type);

  return (
    <TouchableOpacity
      style={[styles.transactionCard, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <View style={styles.transactionLeft}>
        <View style={styles.transactionIconContainer}>
          {transaction.image ? (
            <Image source={{ uri: transaction.image }} style={styles.transactionImage} />
          ) : (
            <View
              style={[
                styles.transactionIcon,
                { backgroundColor: iconColor + '20' },
              ]}
            >
              <IconComponent size={20} color={iconColor} />
            </View>
          )}
        </View>
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionTitle, { color: colors.text }]}>
            {transaction.description}
          </Text>
          <View style={styles.transactionMeta}>
            <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
              {transaction.date}
            </Text>
            {transaction.reference && (
              <>
                <Text style={[styles.transactionSeparator, { color: colors.textSecondary }]}>
                  •
                </Text>
                <Text style={[styles.transactionReference, { color: colors.textSecondary }]}>
                  {transaction.reference}
                </Text>
              </>
            )}
          </View>
          {transaction.fee && transaction.fee > 0 && (
            <Text style={[styles.transactionFee, { color: colors.textSecondary }]}>
              Fee: KES {transaction.fee}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.transactionAmount,
            { color: iconColor },
          ]}
        >
          {(transaction.type === 'deposit' || transaction.type === 'sell') ? '+' : '-'}
          KES {transaction.amount.toLocaleString()}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) + '20' }]}>
          <Text
            style={[
              styles.transactionStatus,
              { color: getStatusColor(transaction.status) },
            ]}
          >
            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getTransactionIcon(type: string) {
  switch (type) {
    case 'deposit':
      return ArrowDownLeft;
    case 'withdrawal':
      return ArrowUpRight;
    case 'buy':
      return Plus;
    case 'sell':
      return Minus;
    default:
      return DollarSign;
  }
}

function getTransactionColor(type: string) {
  const { colors } = useTheme();
  switch (type) {
    case 'deposit':
    case 'sell':
      return colors.success;
    case 'withdrawal':
    case 'buy':
      return colors.error;
    default:
      return colors.textSecondary;
  }
}

function getStatusColor(status: string) {
  const { colors } = useTheme();
  switch (status) {
    case 'completed':
      return colors.success;
    case 'pending':
      return colors.warning;
    case 'failed':
      return colors.error;
    default:
      return colors.textSecondary;
  }
}

const styles = StyleSheet.create({
  transactionCard: {
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
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIconContainer: {
    marginRight: 12,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionSeparator: {
    fontSize: 12,
    marginHorizontal: 6,
  },
  transactionReference: {
    fontSize: 12,
  },
  transactionFee: {
    fontSize: 10,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  transactionStatus: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
}); 