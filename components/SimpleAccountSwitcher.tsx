import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SimpleGroupsAPI, SimpleAccount, SimpleGroupUtils } from '../services/simpleGroupsAPI';

interface AccountSwitcherProps {
  onAccountSelect: (account: SimpleAccount) => void;
  currentAccount?: SimpleAccount;
  style?: any;
}

const SimpleAccountSwitcher: React.FC<AccountSwitcherProps> = ({
  onAccountSelect,
  currentAccount,
  style
}) => {
  const [accounts, setAccounts] = useState<SimpleAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await SimpleGroupsAPI.getUserAccounts();
      setAccounts(data);
      
      // Auto-select individual account if no current account
      if (!currentAccount && data.length > 0) {
        const individualAccount = data.find(acc => acc.account_type === 'individual');
        if (individualAccount) {
          onAccountSelect(individualAccount);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = (account: SimpleAccount) => {
    onAccountSelect(account);
    setIsExpanded(false);
  };

  const getAccountIcon = (type: string) => {
    if (type === 'individual') return '👤';
    return SimpleGroupUtils.getGroupTypeIcon(type);
  };

  const formatAccountName = (account: SimpleAccount) => {
    if (account.account_type === 'individual') {
      return account.account_name;
    }
    return `${account.account_name} (${account.role || 'Member'})`;
  };

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.loadingText}>Loading accounts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>Error loading accounts</Text>
        <TouchableOpacity onPress={loadAccounts} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Current Account Display */}
      <TouchableOpacity
        style={styles.currentAccountButton}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.currentAccountContent}>
          <Text style={styles.accountIcon}>
            {currentAccount ? getAccountIcon(currentAccount.account_type) : '👤'}
          </Text>
          <View style={styles.currentAccountInfo}>
            <Text style={styles.currentAccountName}>
              {currentAccount ? formatAccountName(currentAccount) : 'Select Account'}
            </Text>
            <Text style={styles.currentAccountBalance}>
              {currentAccount ? SimpleGroupUtils.formatCurrency(currentAccount.balance) : 'KES 0'}
            </Text>
          </View>
          <Text style={[styles.chevron, isExpanded && styles.chevronExpanded]}>
            ▼
          </Text>
        </View>
      </TouchableOpacity>

      {/* Account List (when expanded) */}
      {isExpanded && (
        <View style={styles.accountList}>
          <FlatList
            data={accounts}
            keyExtractor={(item) => item.account_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.accountItem,
                  currentAccount?.account_id === item.account_id && styles.selectedAccountItem
                ]}
                onPress={() => handleAccountSelect(item)}
              >
                <Text style={styles.accountItemIcon}>
                  {getAccountIcon(item.account_type)}
                </Text>
                <View style={styles.accountItemInfo}>
                  <Text style={styles.accountItemName}>
                    {formatAccountName(item)}
                  </Text>
                  <Text style={styles.accountItemBalance}>
                    {SimpleGroupUtils.formatCurrency(item.balance)}
                  </Text>
                  {item.account_type !== 'individual' && (
                    <Text style={styles.accountItemType}>
                      {item.account_type.replace('_', ' ').toUpperCase()}
                    </Text>
                  )}
                </View>
                {currentAccount?.account_id === item.account_id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
            style={styles.flatList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    padding: 16,
    textAlign: 'center',
    color: '#666',
  },
  errorText: {
    padding: 16,
    textAlign: 'center',
    color: '#dc2626',
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  retryText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  currentAccountButton: {
    padding: 16,
  },
  currentAccountContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  currentAccountInfo: {
    flex: 1,
  },
  currentAccountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  currentAccountBalance: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 12,
    color: '#6b7280',
    transform: [{ rotate: '0deg' }],
  },
  chevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  accountList: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    maxHeight: 300,
  },
  flatList: {
    maxHeight: 300,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedAccountItem: {
    backgroundColor: '#eff6ff',
  },
  accountItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  accountItemInfo: {
    flex: 1,
  },
  accountItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  accountItemBalance: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  accountItemType: {
    fontSize: 10,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 16,
    color: '#059669',
    fontWeight: 'bold',
  },
});

export default SimpleAccountSwitcher;
