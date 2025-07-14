import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Zap, Shield, Target, BarChart, Info } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BASE_URL } from '@/services/config';
import { apiFetch } from '@/services/apiClient';

export default function ProductsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Investment Products</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.productCard, { backgroundColor: colors.surface }]}>
          <View style={styles.productHeader}>
            <View style={[styles.productIconContainer, { backgroundColor: colors.primary }]}>
              <Zap size={24} color={colors.background} />
            </View>
            <Text style={[styles.productTitle, { color: colors.text }]}>Digitika Fund</Text>
          </View>
          
          <Text style={[styles.productDescription, { color: colors.textSecondary }]}>
            This is a fund focused on investing in a diverse portfolio of cryptocurrencies.
          </Text>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Objective</Text>
            </View>
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
              The fund is designed to provide investors with exposure to the rapidly growing crypto market while mitigating risks through strategic asset allocation and active management.
            </Text>
          </View>
          
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Key Features</Text>
            </View>
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
              • Diversified portfolio of leading cryptocurrencies.{'\n'}
              • Active management by experienced analysts.{'\n'}
              • Strategic asset allocation to mitigate risk.{'\n'}
              • Focus on high-growth potential blockchain projects.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <BarChart size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Risk Profile</Text>
            </View>
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
              High Growth / Speculative. Suitable for investors with a high risk tolerance and a long-term investment horizon.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Info size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Additional Details</Text>
            </View>
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
              • Minimum Investment: Contact for details.{'\n'}
              • Management Fee: Competitive fees apply.
            </Text>
          </View>
          
          <TouchableOpacity style={[styles.investButton, { backgroundColor: colors.primary }]}>
            <Text style={[styles.investButtonText, { color: colors.background }]}>Invest Now</Text>
          </TouchableOpacity>
        </View>
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
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 24,
  },
  productCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 100,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  productIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  productDescription: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
  },
  investButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  investButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 