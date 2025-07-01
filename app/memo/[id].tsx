import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, User, Calendar, Tag } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BASE_URL } from '@/services/config';
import { apiFetch } from '@/services/apiFetch';

export default function MemoDetailScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();

  const [memo, setMemo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiFetch(`/api/memos/${id}`)
      .then(data => {
        setMemo(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Memo not found.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={{ color: colors.textSecondary, marginTop: 16 }}>Loading memo...</Text>
      </View>
    );
  }

  if (error || !memo) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}> 
        <Text style={[styles.errorText, { color: colors.error }]}>{error || 'Memo not found.'}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.primary, marginTop: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}> 
          <ArrowLeft size={24} color={colors.text} /> 
        </TouchableOpacity> 
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail"> 
          {memo.title} 
        </Text> 
        <View style={styles.placeholder} /> 
      </View> 

      <ScrollView style={styles.content}> 
        <Text style={[styles.memoTitle, { color: colors.text }]}>{memo.title}</Text> 
        <View style={styles.metaContainer}> 
          <View style={styles.metaItem}> 
            <User size={14} color={colors.textSecondary} /> 
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{memo.author}</Text> 
          </View> 
          <View style={styles.metaItem}> 
            <Calendar size={14} color={colors.textSecondary} /> 
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{memo.timestamp}</Text> 
          </View> 
          <View style={styles.metaItem}> 
            <Tag size={14} color={colors.textSecondary} /> 
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{memo.category}</Text> 
          </View> 
        </View> 
        <Text style={[styles.memoContent, { color: colors.textSecondary }]}>{memo.content}</Text> 
      </ScrollView> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 24,
  },
  memoTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 36,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
    paddingBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },
  memoContent: {
    fontSize: 16,
    lineHeight: 28,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 