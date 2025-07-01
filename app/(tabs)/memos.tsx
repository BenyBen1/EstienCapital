import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { apiFetch } from '@/services/apiFetch';

interface MemoItem {
  id: string;
  title: string;
  summary: string;
  author: string;
  timestamp: string;
  category: string;
}

export default function MemosScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [memoItems, setMemoItems] = useState<MemoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiFetch('/api/memos')
      .then(res => res.json())
      .then(data => {
        setMemoItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load memos');
        setLoading(false);
      });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.headerTitle, { color: colors.text }]}>Memos from the Desk</Text> 
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 32 }} />
        ) : error ? (
          <Text style={{ color: colors.error, textAlign: 'center', marginVertical: 32 }}>{error}</Text>
        ) : memoItems.length === 0 ? (
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginVertical: 32 }}>No memos available yet.</Text>
        ) : (
          memoItems.map((memo) => (
            <TouchableOpacity
              key={memo.id}
              style={[styles.memoCard, { backgroundColor: colors.card }]}
              onPress={() => router.push(`/memo/${memo.id}`)}
            >
              <View style={styles.memoHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}> 
                  <Text style={[styles.categoryText, { color: colors.primary }]}>{memo.category}</Text>
                </View>
                <Text style={[styles.memoTimestamp, { color: colors.textSecondary }]}>{memo.timestamp}</Text>
              </View>
              <Text style={[styles.memoTitle, { color: colors.text }]}>{memo.title}</Text>
              <Text style={[styles.memoSummary, { color: colors.textSecondary }]}>{memo.summary}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  memoCard: {
    borderRadius: 16,
    marginBottom: 20,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  memoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  memoTimestamp: {
    fontSize: 12,
  },
  memoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  memoSummary: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 