import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Search,
  X,
  DollarSign,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

type TransactionType = 'all' | 'deposit' | 'withdrawal';
type TransactionStatus = 'all' | 'pending' | 'completed' | 'failed';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  description: string;
  reference?: string;
}

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [filterType, setFilterType] = useState<TransactionType>('all');
  const [filterStatus, setFilterStatus] = useState<TransactionStatus>('all');

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'deposit',
      amount: 25000,
      status: 'completed',
      date: '2024-01-15',
      description: 'Bank Transfer Deposit',
      reference: 'DEP001',
    },
    {
      id: '2',
      type: 'withdrawal',
      amount: 5000,
      status: 'pending',
      date: '2024-01-14',
      description: 'Withdrawal to Bank Account',
      reference: 'WTH001',
    },
    {
      id: '3',
      type: 'deposit',
      amount: 15000,
      status: 'completed',
      date: '2024-01-12',
      description: 'Mpesa Deposit',
      reference: 'DEP002',
    },
    {
      id: '4',
      type: 'deposit',
      amount: 50000,
      status: 'completed',
      date: '2024-01-10',
      description: 'Initial Investment',
      reference: 'DEP003',
    },
    {
      id: '5',
      type: 'withdrawal',
      amount: 3000,
      status: 'failed',
      date: '2024-01-08',
      description: 'Withdrawal Request',
      reference: 'WTH002',
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const typeMatch = filterType === 'all' || transaction.type === filterType;
    const statusMatch = filterStatus === 'all' || transaction.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid deposit amount');
      return;
    }

    Alert.alert(
      'Deposit Instructions',
      `To deposit KES ${parseFloat(depositAmount).toLocaleString()}, please transfer to:\n\nBank: KCB Bank\nAccount: 1234567890\nAccount Name: Estien Capital Ltd\n\nAfter making the transfer, click "I Have Made This Deposit" to notify our team.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I Have Made This Deposit',
          onPress: () => {
            setShowDepositModal(false);
            setDepositAmount('');
            Alert.alert('Success', 'Deposit notification sent. We will verify and credit your account within 24 hours.');
          },
        },
      ]
    );
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid withdrawal amount');
      return;
    }

    Alert.alert(
      'Withdrawal Request',
      `Your withdrawal request for KES ${parseFloat(withdrawAmount).toLocaleString()} has been submitted. Funds will be transferred to your registered bank account within 1-3 business days.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowWithdrawModal(false);
            setWithdrawAmount('');
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
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
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Transactions
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.card }]}>
            <Search size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.card }]}>
            <Filter size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.success }]}
          onPress={() => setShowDepositModal(true)}
        >
          <Plus size={20} color={colors.background} />
          <Text style={[styles.actionButtonText, { color: colors.background }]}>
            Deposit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={() => setShowWithdrawModal(true)}
        >
          <Minus size={20} color={colors.background} />
          <Text style={[styles.actionButtonText, { color: colors.background }]}>
            Withdraw
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterTabs}>
            {(['all', 'deposit', 'withdrawal'] as TransactionType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: filterType === type ? colors.primary : colors.card,
                  },
                ]}
                onPress={() => setFilterType(type)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    {
                      color: filterType === type ? colors.background : colors.text,
                    },
                  ]}
                >
                  {type === 'all' ? 'All' : type === 'deposit' ? 'Deposits' : 'Withdrawals'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Transactions List */}
      <ScrollView style={styles.transactionsList}>
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <DollarSign size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No transactions found
            </Text>
          </View>
        ) : (
          filteredTransactions.map((transaction) => (
            <TouchableOpacity
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
                    <ArrowDownLeft size={20} color={colors.success} />
                  ) : (
                    <ArrowUpRight size={20} color={colors.error} />
                  )}
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={[styles.transactionTitle, { color: colors.text }]}>
                    {transaction.description}
                  </Text>
                  <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                    {transaction.date} • {transaction.reference}
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
                  {transaction.type === 'deposit' ? '+' : '-'}KES{' '}
                  {transaction.amount.toLocaleString()}
                </Text>
                <Text
                  style={[
                    styles.transactionStatus,
                    { color: getStatusColor(transaction.status) },
                  ]}
                >
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Deposit Modal */}
      <Modal visible={showDepositModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Make a Deposit
              </Text>
              <TouchableOpacity onPress={() => setShowDepositModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Deposit Amount (KES)
              </Text>
              <TextInput
                style={[
                  styles.amountInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={depositAmount}
                onChangeText={setDepositAmount}
                placeholder="Enter amount"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleDeposit}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>
                  Get Deposit Instructions
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal visible={showWithdrawModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Withdraw Funds
              </Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Withdrawal Amount (KES)
              </Text>
              <TextInput
                style={[
                  styles.amountInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                placeholder="Enter amount"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />

              <Text style={[styles.availableBalance, { color: colors.textSecondary }]}>
                Available balance: KES 125,000
              </Text>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleWithdraw}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>
                  Request Withdrawal
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterSection: {
    paddingLeft: 24,
    marginBottom: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 24,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
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
    fontSize: 16,
    marginTop: 16,
  },
  transactionCard: {
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
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    paddingHorizontal: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  amountInput: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  availableBalance: {
    fontSize: 14,
    marginBottom: 24,
  },
  modalButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});