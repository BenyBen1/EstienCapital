import { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionHeader } from '@/components/TransactionHeader';
import { TransactionSummary } from '@/components/TransactionSummary';
import { TransactionFilter } from '@/components/TransactionFilter';
import { TransactionList } from '@/components/TransactionList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

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

const BASE_URL = 'http://192.168.0.175:5000';

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [filterType, setFilterType] = useState<TransactionType>('all');
  const [filterStatus, setFilterStatus] = useState<TransactionStatus>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions from backend
  const fetchTransactions = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found. Please log in again.');
      const response = await fetch(`${BASE_URL}/api/transactions/history/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.status === 403) {
        setError('kyc_required');
        setIsLoading(false);
        setRefreshing(false);
        return;
      }
      const data = await response.json();
      console.log('Fetched transactions:', data);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch transactions');
      setTransactions(data.transactions || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching transactions');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const typeMatch = filterType === 'all' || transaction.type === filterType;
    const statusMatch = filterStatus === 'all' || transaction.status === filterStatus;
    const searchMatch = searchQuery === '' || 
      transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    return typeMatch && statusMatch && searchMatch;
  });

  // KYC check: Only allow access if KYC is approved
  useEffect(() => {
    if (user?.kycStatus !== 'approved') {
      router.replace('/kyc');
    }
  }, [user?.kycStatus]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error === 'kyc_required') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 32 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
          You need to complete KYC to view your transactions.
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 16, marginBottom: 32, textAlign: 'center' }}>
          For your security and compliance, please complete your KYC verification.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8 }}
          onPress={() => router.push('/kyc')}
        >
          <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 16 }}>Start KYC</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <TransactionHeader
          onDownload={() => {}}
          onFilter={() => {}}
          onMore={() => {}}
        />
        <TransactionSummary
          availableBalance={0}
          totalDeposits={0}
          monthlyVolume={0}
          totalTrades={0}
        />
        <TransactionFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
        />
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <ActivityIndicator size="small" color={colors.error} />
          <View style={{ height: 16 }} />
          <Text style={{ color: colors.error }}>{error}</Text>
        </View>
      </View>
    );
  }

  // TODO: Fetch and calculate real summary values
  const availableBalance = 0;
  const transactionSummary: TransactionSummary = {
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalTrades: transactions.length,
    monthlyVolume: 0,
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
        transactions={filteredTransactions.map((transaction) => ({
          ...transaction,
          description: transaction.description || 'No description',
          reference: transaction.reference || '',
          type: transaction.type || 'unknown',
          status: transaction.status || 'pending',
          amount: transaction.amount || 0,
          date: transaction.date || '',
        }))}
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