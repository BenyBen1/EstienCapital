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
import { Plus, Minus, ArrowUpRight, ArrowDownLeft, Filter, Search, X, DollarSign, Copy, CircleCheck as CheckCircle, Building, CreditCard, Smartphone } from 'lucide-react-native';
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

interface PaymentMethod {
  id: string;
  type: 'bank' | 'mpesa';
  name: string;
  details: string;
  isDefault: boolean;
}

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [filterType, setFilterType] = useState<TransactionType>('all');
  const [filterStatus, setFilterStatus] = useState<TransactionStatus>('all');
  const [copiedField, setCopiedField] = useState<string>('');

  // Mock user's available balance
  const availableBalance = 125000;

  // Mock payment methods from user profile
  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'bank',
      name: 'KCB Bank',
      details: 'Account: ****5678 - John Doe',
      isDefault: true,
    },
    {
      id: '2',
      type: 'mpesa',
      name: 'M-Pesa',
      details: '+254 712 345 678',
      isDefault: false,
    },
  ];

  // Bank details for deposits
  const bankDetails = {
    bankName: 'KCB Bank Kenya',
    accountName: 'Estien Capital Limited',
    accountNumber: '1234567890',
    branchCode: '001',
    swiftCode: 'KCBLKENX',
    reference: 'Your Name + Phone Number',
  };

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
      description: 'M-Pesa Deposit',
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

  const handleDepositAmount = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid deposit amount');
      return;
    }

    setShowDepositModal(false);
    setShowInstructionsModal(true);
  };

  const handleDepositConfirmation = () => {
    // Send notification to Estien Capital
    sendDepositNotification();
    
    setShowInstructionsModal(false);
    setDepositAmount('');
    
    Alert.alert(
      'Deposit Notification Sent',
      'We have notified our team about your deposit. Your account will be credited within 24 hours after verification.',
      [{ text: 'OK' }]
    );
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid withdrawal amount');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount > availableBalance) {
      Alert.alert('Error', 'Insufficient balance for this withdrawal');
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    // Send notification to Estien Capital
    sendWithdrawalNotification();

    const selectedMethod = paymentMethods.find(method => method.id === selectedPaymentMethod);
    
    Alert.alert(
      'Withdrawal Request Submitted',
      `Your withdrawal request for KES ${amount.toLocaleString()} to ${selectedMethod?.name} has been submitted. Funds will be transferred within 1-3 business days after approval.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            setSelectedPaymentMethod('');
          },
        },
      ]
    );
  };

  const sendDepositNotification = () => {
    // In a real app, this would make an API call to send email/SMS
    console.log('Sending deposit notification:', {
      type: 'deposit',
      amount: depositAmount,
      userEmail: 'john.doe@example.com',
      userPhone: '+254712345678',
      timestamp: new Date().toISOString(),
    });
  };

  const sendWithdrawalNotification = () => {
    const selectedMethod = paymentMethods.find(method => method.id === selectedPaymentMethod);
    
    // In a real app, this would make an API call to send email/SMS
    console.log('Sending withdrawal notification:', {
      type: 'withdrawal',
      amount: withdrawAmount,
      paymentMethod: selectedMethod,
      userEmail: 'john.doe@example.com',
      userPhone: '+254712345678',
      timestamp: new Date().toISOString(),
    });
  };

  const copyToClipboard = (text: string, field: string) => {
    // In a real app, use Clipboard API
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
    
    // Mock clipboard functionality
    console.log(`Copied to clipboard: ${text}`);
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

      {/* Balance Card */}
      <View style={styles.balanceSection}>
        <View style={[styles.balanceCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
            Available Balance
          </Text>
          <Text style={[styles.balanceAmount, { color: colors.text }]}>
            KES {availableBalance.toLocaleString()}
          </Text>
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
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowDepositModal(true)}
        >
          <Plus size={20} color={colors.background} />
          <Text style={[styles.actionButtonText, { color: colors.background }]}>
            Top Up
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
                onPress={handleDepositAmount}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>
                  Get Deposit Instructions
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Deposit Instructions Modal */}
      <Modal visible={showInstructionsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.instructionsModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Deposit Instructions
              </Text>
              <TouchableOpacity onPress={() => setShowInstructionsModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.instructionsBody}>
              <View style={[styles.amountCard, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.amountCardLabel, { color: colors.text }]}>
                  Amount to Deposit
                </Text>
                <Text style={[styles.amountCardValue, { color: colors.primary }]}>
                  KES {parseFloat(depositAmount || '0').toLocaleString()}
                </Text>
              </View>

              <Text style={[styles.instructionsTitle, { color: colors.text }]}>
                Bank Transfer Details
              </Text>
              <Text style={[styles.instructionsSubtitle, { color: colors.textSecondary }]}>
                Transfer the exact amount to the following account:
              </Text>

              <View style={[styles.bankDetailsCard, { backgroundColor: colors.surface }]}>
                <View style={styles.bankDetailRow}>
                  <Text style={[styles.bankDetailLabel, { color: colors.textSecondary }]}>
                    Bank Name:
                  </Text>
                  <View style={styles.bankDetailValue}>
                    <Text style={[styles.bankDetailText, { color: colors.text }]}>
                      {bankDetails.bankName}
                    </Text>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(bankDetails.bankName, 'bankName')}
                    >
                      {copiedField === 'bankName' ? (
                        <CheckCircle size={16} color={colors.success} />
                      ) : (
                        <Copy size={16} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.bankDetailRow}>
                  <Text style={[styles.bankDetailLabel, { color: colors.textSecondary }]}>
                    Account Name:
                  </Text>
                  <View style={styles.bankDetailValue}>
                    <Text style={[styles.bankDetailText, { color: colors.text }]}>
                      {bankDetails.accountName}
                    </Text>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(bankDetails.accountName, 'accountName')}
                    >
                      {copiedField === 'accountName' ? (
                        <CheckCircle size={16} color={colors.success} />
                      ) : (
                        <Copy size={16} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.bankDetailRow}>
                  <Text style={[styles.bankDetailLabel, { color: colors.textSecondary }]}>
                    Account Number:
                  </Text>
                  <View style={styles.bankDetailValue}>
                    <Text style={[styles.bankDetailText, { color: colors.text }]}>
                      {bankDetails.accountNumber}
                    </Text>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(bankDetails.accountNumber, 'accountNumber')}
                    >
                      {copiedField === 'accountNumber' ? (
                        <CheckCircle size={16} color={colors.success} />
                      ) : (
                        <Copy size={16} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.bankDetailRow}>
                  <Text style={[styles.bankDetailLabel, { color: colors.textSecondary }]}>
                    Branch Code:
                  </Text>
                  <View style={styles.bankDetailValue}>
                    <Text style={[styles.bankDetailText, { color: colors.text }]}>
                      {bankDetails.branchCode}
                    </Text>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(bankDetails.branchCode, 'branchCode')}
                    >
                      {copiedField === 'branchCode' ? (
                        <CheckCircle size={16} color={colors.success} />
                      ) : (
                        <Copy size={16} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.bankDetailRow}>
                  <Text style={[styles.bankDetailLabel, { color: colors.textSecondary }]}>
                    Reference:
                  </Text>
                  <View style={styles.bankDetailValue}>
                    <Text style={[styles.bankDetailText, { color: colors.text }]}>
                      {bankDetails.reference}
                    </Text>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(bankDetails.reference, 'reference')}
                    >
                      {copiedField === 'reference' ? (
                        <CheckCircle size={16} color={colors.success} />
                      ) : (
                        <Copy size={16} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={[styles.warningCard, { backgroundColor: colors.warning + '10' }]}>
                <Text style={[styles.warningTitle, { color: colors.text }]}>
                  Important Notes:
                </Text>
                <Text style={[styles.warningText, { color: colors.textSecondary }]}>
                  • Transfer the exact amount: KES {parseFloat(depositAmount || '0').toLocaleString()}{'\n'}
                  • Include your name and phone number as reference{'\n'}
                  • Funds will be credited within 24 hours after verification{'\n'}
                  • Keep your transfer receipt for records
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: colors.success }]}
                onPress={handleDepositConfirmation}
              >
                <CheckCircle size={20} color={colors.background} />
                <Text style={[styles.confirmButtonText, { color: colors.background }]}>
                  I Have Made This Deposit
                </Text>
              </TouchableOpacity>
            </ScrollView>
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

            <ScrollView style={styles.modalBody}>
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
                Available balance: KES {availableBalance.toLocaleString()}
              </Text>

              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Payment Method
              </Text>
              
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethodCard,
                    {
                      backgroundColor: selectedPaymentMethod === method.id ? colors.primary + '20' : colors.surface,
                      borderColor: selectedPaymentMethod === method.id ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedPaymentMethod(method.id)}
                >
                  <View style={styles.paymentMethodLeft}>
                    <View style={[styles.paymentMethodIcon, { backgroundColor: colors.primary + '20' }]}>
                      {method.type === 'bank' ? (
                        <Building size={20} color={colors.primary} />
                      ) : (
                        <Smartphone size={20} color={colors.primary} />
                      )}
                    </View>
                    <View style={styles.paymentMethodInfo}>
                      <Text style={[styles.paymentMethodName, { color: colors.text }]}>
                        {method.name}
                      </Text>
                      <Text style={[styles.paymentMethodDetails, { color: colors.textSecondary }]}>
                        {method.details}
                      </Text>
                      {method.isDefault && (
                        <Text style={[styles.defaultLabel, { color: colors.primary }]}>
                          Default
                        </Text>
                      )}
                    </View>
                  </View>
                  <View
                    style={[
                      styles.radioButton,
                      {
                        borderColor: selectedPaymentMethod === method.id ? colors.primary : colors.border,
                        backgroundColor: selectedPaymentMethod === method.id ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {selectedPaymentMethod === method.id && (
                      <View style={[styles.radioButtonInner, { backgroundColor: colors.background }]} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleWithdraw}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>
                  Request Withdrawal
                </Text>
              </TouchableOpacity>
            </ScrollView>
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
  balanceSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  balanceCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  actionSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
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
    maxHeight: '80%',
  },
  instructionsModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '90%',
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
  instructionsBody: {
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
    marginTop: 24,
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  amountCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  amountCardLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  amountCardValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionsSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  bankDetailsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  bankDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bankDetailLabel: {
    fontSize: 14,
    flex: 1,
  },
  bankDetailValue: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  bankDetailText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  warningCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  paymentMethodDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  defaultLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});