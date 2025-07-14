import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

type TransactionType = 'all' | 'deposit' | 'withdrawal' | 'buy' | 'sell';
type TransactionStatus = 'all' | 'pending' | 'completed' | 'failed';

interface TransactionFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: TransactionType;
  onFilterTypeChange: (type: TransactionType) => void;
  filterStatus: TransactionStatus;
  onFilterStatusChange: (status: TransactionStatus) => void;
}

export function TransactionFilter({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterStatus,
  onFilterStatusChange,
}: TransactionFilterProps) {
  const { colors } = useTheme();

  return (
    <>
      <View style={styles.searchSection}>
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search transactions..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>
      </View>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterTabs}>
            {(['all', 'deposit', 'withdrawal', 'buy', 'sell'] as TransactionType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: filterType === type ? colors.primary : colors.card,
                  },
                ]}
                onPress={() => onFilterTypeChange(type)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    {
                      color: filterType === type ? colors.background : colors.text,
                    },
                  ]}
                >
                  {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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
}); 