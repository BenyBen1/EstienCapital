import React, { useState, useEffect, createContext, useContext } from 'react';
import { View } from 'react-native';
import { SimpleAccount } from '../services/simpleGroupsAPI';

// Context for sharing selected account across the app
interface AccountContextType {
  currentAccount: SimpleAccount | null;
  setCurrentAccount: (account: SimpleAccount) => void;
  refreshAccounts: () => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};

interface AccountProviderProps {
  children: React.ReactNode;
}

export const AccountProvider: React.FC<AccountProviderProps> = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState<SimpleAccount | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshAccounts = () => {
    setRefreshKey(prev => prev + 1);
  };

  const value: AccountContextType = {
    currentAccount,
    setCurrentAccount,
    refreshAccounts,
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
};

// HOC to add account awareness to any component
export function withAccountContext<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AccountAwareComponent(props: P) {
    return (
      <AccountProvider>
        <Component {...props} />
      </AccountProvider>
    );
  };
}

// Hook to filter data based on current account
export const useAccountAwareData = <T extends { account_id?: string }>(
  data: T[]
): T[] => {
  const { currentAccount } = useAccount();
  
  if (!currentAccount) return [];
  
  return data.filter(item => {
    if (!item.account_id) return true; // Include items without account_id
    return item.account_id === currentAccount.account_id;
  });
};

// Example usage component showing integration pattern
export const ExampleIntegration: React.FC = () => {
  const { currentAccount } = useAccount();
  
  // This is how you'd use it in any screen
  const handleAccountChange = (account: SimpleAccount) => {
    // Account is automatically set in context
    // All other components will re-render with new account data
    console.log('Account changed to:', account.account_name);
  };

  return (
    <View>
      {/* This is the pattern for ANY screen in your app */}
      {/* Just import SimpleAccountSwitcher and useAccount */}
    </View>
  );
};
