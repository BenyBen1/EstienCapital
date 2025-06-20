import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Download, Filter, MoveHorizontal } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface TransactionHeaderProps {
  onDownload?: () => void;
  onFilter?: () => void;
  onMore?: () => void;
}

export function TransactionHeader({ onDownload, onFilter, onMore }: TransactionHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onDownload} style={styles.actionButton}>
          <Download size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onFilter} style={styles.actionButton}>
          <Filter size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onMore} style={styles.actionButton}>
          <MoveHorizontal size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
}); 