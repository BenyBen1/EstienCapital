import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { TransactionHeader } from '@/components/TransactionHeader';
import { TransactionSummary } from '@/components/TransactionSummary';
import { TransactionFilter } from '@/components/TransactionFilter';
import { TransactionList } from '@/components/TransactionList';

type TransactionType = 'all' | 'deposit' | 'withdrawal' | 'buy' | 'sell';
type TransactionStatus = 'all' | 'pending' | 'completed' | 'failed';

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

interface TransactionSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  totalTrades: number;
  monthlyVolume: number;
}

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const [filterType, setFilterType] = useState<TransactionType>('all');
  const [filterStatus, setFilterStatus] = useState<TransactionStatus>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const availableBalance = 125000;

  const transactionSummary: TransactionSummary = {
    totalDeposits: 150000,
    totalWithdrawals: 25000,
    totalTrades: 45,
    monthlyVolume: 75000,
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
      fee: 0,
      image: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      id: '2',
      type: 'buy',
      amount: 15000,
      status: 'completed',
      date: '2024-01-14',
      description: 'Bitcoin Purchase',
      reference: 'BUY001',
      asset: 'BTC',
      fee: 75,
      image: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      id: '3',
      type: 'sell',
      amount: 8000,
      status: 'completed',
      date: '2024-01-13',
      description: 'Ethereum Sale',
      reference: 'SELL001',
      asset: 'ETH',
      fee: 40,
      image: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      id: '4',
      type: 'withdrawal',
      amount: 5000,
      status: 'pending',
      date: '2024-01-12',
      description: 'Withdrawal to Bank Account',
      reference: 'WTH001',
      fee: 25,
    },
    {
      id: '5',
      type: 'deposit',
      amount: 50000,
      status: 'completed',
      date: '2024-01-10',
      description: 'Initial Investment',
      reference: 'DEP002',
      fee: 0,
    },
    {
      id: '6',
      type: 'buy',
      amount: 12000,
      status: 'completed',
      date: '2024-01-09',
      description: 'Cardano Purchase',
      reference: 'BUY002',
      asset: 'ADA',
      fee: 60,
      image: 'https://images.pexels.com/photos/730564/pexels-photo-730564.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      id: '7',
      type: 'withdrawal',
      amount: 3000,
      status: 'failed',
      date: '2024-01-08',
      description: 'Withdrawal Request',
      reference: 'WTH002',
      fee: 25,
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const typeMatch = filterType === 'all' || transaction.type === filterType;
    const statusMatch = filterStatus === 'all' || transaction.status === filterStatus;
    const searchMatch = searchQuery === '' || 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    return typeMatch && statusMatch && searchMatch;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TransactionHeader
        onDownload={() => {
          // TODO: Implement download functionality
          console.log('Download transactions');
        }}
        onFilter={() => {
          // TODO: Implement filter functionality
          console.log('Show filter options');
        }}
        onMore={() => {
          // TODO: Implement more options
          console.log('Show more options');
        }}
        onDeposit={() => {
          // TODO: Implement deposit functionality
          console.log('Show deposit modal');
        }}
        onWithdraw={() => {
          // TODO: Implement withdraw functionality
          console.log('Show withdraw modal');
        }}
      />

      <TransactionSummary
        availableBalance={availableBalance}
        totalDeposits={transactionSummary.totalDeposits}
        monthlyVolume={transactionSummary.monthlyVolume}
        totalTrades={transactionSummary.totalTrades}
      />

      <TransactionFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
      />

      <TransactionList
        transactions={filteredTransactions}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});