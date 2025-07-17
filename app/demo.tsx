import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import SimpleAccountSwitcher from '../components/SimpleAccountSwitcher';
import { AccountProvider, useAccount } from '../contexts/AccountContext';
import { SimpleAccount } from '../services/simpleGroupsAPI';

// Demo component showing the group system working
const GroupSystemDemo: React.FC = () => {
  const { currentAccount } = useAccount();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎉 Estien Group System Demo</Text>
        <Text style={styles.subtitle}>Friday Progress Showcase</Text>
      </View>

      {/* Account Switcher */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ Account Switching</Text>
        <Text style={styles.description}>
          Users can now switch between individual and group accounts
        </Text>
        {/* The account switcher is already integrated above in the provider */}
      </View>

      {/* Current Account Display */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Current Account</Text>
        {currentAccount ? (
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>{currentAccount.account_name}</Text>
            <Text style={styles.accountType}>
              Type: {currentAccount.account_type.replace('_', ' ').toUpperCase()}
            </Text>
            <Text style={styles.accountBalance}>
              Balance: {new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES',
              }).format(currentAccount.balance)}
            </Text>
          </View>
        ) : (
          <Text style={styles.noAccount}>No account selected</Text>
        )}
      </View>

      {/* Features Completed */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ What's Working</Text>
        <View style={styles.featureList}>
          <Text style={styles.feature}>• ✅ Account switching (Individual ↔ Groups)</Text>
          <Text style={styles.feature}>• ✅ Database migration deployed</Text>
          <Text style={styles.feature}>• ✅ API service layer complete</Text>
          <Text style={styles.feature}>• ✅ Mobile UI components</Text>
          <Text style={styles.feature}>• ✅ Context state management</Text>
          <Text style={styles.feature}>• ✅ Admin interface foundation</Text>
        </View>
      </View>

      {/* Next Steps */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 After Friday</Text>
        <View style={styles.featureList}>
          <Text style={styles.feature}>• Add group creation flow</Text>
          <Text style={styles.feature}>• Member management interface</Text>
          <Text style={styles.feature}>• Group transactions & contributions</Text>
          <Text style={styles.feature}>• Investment tracking</Text>
          <Text style={styles.feature}>• Meeting scheduling</Text>
          <Text style={styles.feature}>• Enhanced admin dashboard</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🎯 Demo Ready for Friday!
        </Text>
        <Text style={styles.footerSubtext}>
          Core functionality working, ready for enhancement
        </Text>
      </View>
    </ScrollView>
  );
};

// Wrapper with Account Provider
const Demo: React.FC = () => {
  const [currentAccount, setCurrentAccount] = useState<SimpleAccount | null>(null);

  return (
    <AccountProvider>
      <View style={styles.container}>
        {/* Account switcher at the top */}
        <SimpleAccountSwitcher
          currentAccount={currentAccount || undefined}
          onAccountSelect={setCurrentAccount}
          style={styles.switcher}
        />
        
        {/* Demo content */}
        <GroupSystemDemo />
      </View>
    </AccountProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  switcher: {
    marginBottom: 0,
  },
  header: {
    backgroundColor: '#059669',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#d1fae5',
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  accountInfo: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  accountName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  noAccount: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  featureList: {
    marginLeft: 8,
  },
  feature: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#1f2937',
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});

export default Demo;
