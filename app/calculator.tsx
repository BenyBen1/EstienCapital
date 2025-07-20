import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Calculator, TrendingUp, PieChart, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

interface CalculatorInputs {
  initialInvestment: string;
  monthlyContribution: string;
  annualReturn: string;
  investmentYears: string;
}

interface CalculationResults {
  futureValue: number;
  totalContributions: number;
  interestEarned: number;
}

// Component definitions
const InputField = ({ 
  label, 
  value, 
  field,
  placeholder,
  keyboardType = 'numeric',
  suffix = '',
  inputRef,
  focusedInput,
  onFocus,
  onBlur,
  onChangeText,
  onSubmitEditing,
  colors
}: { 
  label: string; 
  value: string; 
  field: string;
  placeholder?: string;
  keyboardType?: 'numeric' | 'default';
  suffix?: string;
  inputRef: React.RefObject<TextInput | null>;
  focusedInput: string | null;
  onFocus: (field: string) => void;
  onBlur: () => void;
  onChangeText: (text: string) => void;
  onSubmitEditing: () => void;
  colors: any;
}) => (
  <View style={styles.inputContainer}>
    <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        ref={inputRef}
        style={[
          styles.input, 
          { 
            backgroundColor: colors.card, 
            borderColor: focusedInput === field ? colors.primary : colors.border,
            color: colors.text,
            borderWidth: focusedInput === field ? 2 : 1,
          }
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => onFocus(field)}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
        returnKeyType={field === 'investmentYears' ? 'done' : 'next'}
        onSubmitEditing={onSubmitEditing}
      />
      {!!suffix && (
        <Text style={[styles.inputSuffix, { color: colors.textSecondary }]}>
          {suffix}
        </Text>
      )}
    </View>
  </View>
);

const ResultCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  colors
}: { 
  title: string; 
  value: string; 
  subtitle?: string; 
  icon: any;
  colors: any;
}) => (
  <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
    <View style={styles.resultHeader}>
      <Icon size={24} color={colors.primary} />
      <Text style={[styles.resultTitle, { color: colors.text }]}>{title}</Text>
    </View>
    <Text style={[styles.resultValue, { color: colors.primary }]}>{value}</Text>
    {!!subtitle && <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
  </View>
);

export default function CalculatorScreen() {
  const { colors } = useTheme();
  const [inputs, setInputs] = useState<CalculatorInputs>({
    initialInvestment: '100,000',
    monthlyContribution: '5,000',
    annualReturn: '12',
    investmentYears: '10',
  });

  const [results, setResults] = useState<CalculationResults>({
    futureValue: 0,
    totalContributions: 0,
    interestEarned: 0,
  });

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Refs for input fields
  const inputRefs = {
    initialInvestment: useRef<TextInput>(null),
    monthlyContribution: useRef<TextInput>(null),
    annualReturn: useRef<TextInput>(null),
    investmentYears: useRef<TextInput>(null),
  };

  // Investment Calculator Logic
  const calculateInvestment = () => {
    const initialInvestment = parseFloat(inputs.initialInvestment.replace(/,/g, '')) || 0;
    const monthlyContribution = parseFloat(inputs.monthlyContribution.replace(/,/g, '')) || 0;
    const annualReturn = parseFloat(inputs.annualReturn) || 0;
    const investmentYears = parseFloat(inputs.investmentYears) || 0;
    
    const monthlyRate = annualReturn / 100 / 12;
    const totalMonths = investmentYears * 12;
    
    // Future value of initial investment
    const futureValueInitial = initialInvestment * Math.pow(1 + monthlyRate, totalMonths);
    
    // Future value of monthly contributions (annuity)
    const futureValueContributions = monthlyContribution * 
      ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    
    const futureValue = futureValueInitial + futureValueContributions;
    const totalContributions = initialInvestment + (monthlyContribution * totalMonths);
    const interestEarned = futureValue - totalContributions;
    
    return { futureValue, totalContributions, interestEarned };
  };

  // Update calculations when inputs change
  useEffect(() => {
    setResults(calculateInvestment());
  }, [inputs]);

  // Format number with commas for Kenya Shillings
  const formatNumber = (value: string): string => {
    // Remove any non-digit characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '');
    
    // Split by decimal point
    const parts = numericValue.split('.');
    
    // Add commas to the integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Return formatted number
    return parts.join('.');
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const updateInput = (field: keyof CalculatorInputs, value: string) => {
    if (field === 'annualReturn' || field === 'investmentYears') {
      // For percentage and years, allow direct input
      setInputs(prev => ({ ...prev, [field]: value }));
    } else {
      // For currency fields, format with commas
      const formattedValue = formatNumber(value);
      setInputs(prev => ({ ...prev, [field]: formattedValue }));
    }
  };

  const handleInputFocus = (field: string) => {
    setFocusedInput(field);
  };

  const handleInputBlur = () => {
    // Don't immediately clear focus, let user navigate between inputs
    setTimeout(() => {
      setFocusedInput(null);
    }, 100);
  };

  const navigateToNextInput = (currentField: keyof CalculatorInputs) => {
    const fields: (keyof CalculatorInputs)[] = ['initialInvestment', 'monthlyContribution', 'annualReturn', 'investmentYears'];
    const currentIndex = fields.indexOf(currentField);
    if (currentIndex < fields.length - 1) {
      const nextField = fields[currentIndex + 1];
      inputRefs[nextField].current?.focus();
    } else {
      // If it's the last field, dismiss keyboard
      Keyboard.dismiss();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Investment Calculator</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Plan your financial future in Kenya Shillings</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Investment Parameters</Text>
            <InputField
              label="Initial Investment"
              value={inputs.initialInvestment}
              field="initialInvestment"
              placeholder="100,000"
              suffix="KES"
              inputRef={inputRefs.initialInvestment}
              focusedInput={focusedInput}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onChangeText={(text) => updateInput('initialInvestment', text)}
              onSubmitEditing={() => navigateToNextInput('initialInvestment')}
              colors={colors}
            />
            <InputField
              label="Monthly Contribution"
              value={inputs.monthlyContribution}
              field="monthlyContribution"
              placeholder="5,000"
              suffix="KES"
              inputRef={inputRefs.monthlyContribution}
              focusedInput={focusedInput}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onChangeText={(text) => updateInput('monthlyContribution', text)}
              onSubmitEditing={() => navigateToNextInput('monthlyContribution')}
              colors={colors}
            />
            <InputField
              label="Annual Return"
              value={inputs.annualReturn}
              field="annualReturn"
              placeholder="12"
              suffix="%"
              inputRef={inputRefs.annualReturn}
              focusedInput={focusedInput}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onChangeText={(text) => updateInput('annualReturn', text)}
              onSubmitEditing={() => navigateToNextInput('annualReturn')}
              colors={colors}
            />
            <InputField
              label="Investment Period"
              value={inputs.investmentYears}
              field="investmentYears"
              placeholder="10"
              suffix="Years"
              inputRef={inputRefs.investmentYears}
              focusedInput={focusedInput}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onChangeText={(text) => updateInput('investmentYears', text)}
              onSubmitEditing={() => navigateToNextInput('investmentYears')}
              colors={colors}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Results</Text>
            <View style={styles.resultsGrid}>
              <ResultCard
                title="Future Value"
                value={formatCurrency(results.futureValue)}
                subtitle="Total portfolio value"
                icon={TrendingUp}
                colors={colors}
              />
              <ResultCard
                title="Total Contributions"
                value={formatCurrency(results.totalContributions)}
                subtitle="Your total investment"
                icon={Calculator}
                colors={colors}
              />
              <ResultCard
                title="Interest Earned"
                value={formatCurrency(results.interestEarned)}
                subtitle={`${((results.interestEarned / Math.max(results.totalContributions, 1)) * 100).toFixed(1)}% return`}
                icon={PieChart}
                colors={colors}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    width: 40,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputSuffix: {
    position: 'absolute',
    right: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  resultsGrid: {
    gap: 12,
  },
  resultCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 12,
  },
});
