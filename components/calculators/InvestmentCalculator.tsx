import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Calculator, DollarSign, TrendingUp } from 'lucide-react-native';

interface InvestmentInputs {
  initialInvestment: string;
  monthlyContribution: string;
  annualReturn: string;
  investmentYears: string;
}

interface InvestmentResults {
  futureValue: number;
  totalContributions: number;
  interestEarned: number;
}

interface InvestmentCalculatorProps {
  colors: any;
}

export default function InvestmentCalculator({ colors }: InvestmentCalculatorProps) {
  const [inputs, setInputs] = useState<InvestmentInputs>({
    initialInvestment: '100000',
    monthlyContribution: '10000',
    annualReturn: '7',
    investmentYears: '10',
  });

  const [results, setResults] = useState<InvestmentResults>({
    futureValue: 0,
    totalContributions: 0,
    interestEarned: 0,
  });

  // Investment Calculator Logic
  const calculateInvestment = () => {
    const initialInvestment = parseFloat(inputs.initialInvestment) || 0;
    const monthlyContribution = parseFloat(inputs.monthlyContribution) || 0;
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const updateInput = (field: keyof InvestmentInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder,
    suffix = ''
  }: { 
    label: string; 
    value: string; 
    onChangeText: (text: string) => void; 
    placeholder?: string;
    suffix?: string;
  }) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.background, 
            borderColor: colors.border,
            color: colors.text 
          }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
        {suffix && (
          <Text style={[styles.inputSuffix, { color: colors.textSecondary }]}>{suffix}</Text>
        )}
      </View>
    </View>
  );

  const ResultCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon 
  }: { 
    title: string; 
    value: string; 
    subtitle?: string; 
    icon: any;
  }) => (
    <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.resultHeader}>
        <Icon size={20} color={colors.primary} />
        <Text style={[styles.resultTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <Text style={[styles.resultValue, { color: colors.primary }]}>{value}</Text>
      {subtitle && <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 6,
    },
    inputWrapper: {
      position: 'relative',
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
      fontSize: 14,
    },
    resultsGrid: {
      gap: 10,
    },
    resultCard: {
      padding: 14,
      borderRadius: 10,
      borderWidth: 1,
    },
    resultHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
    },
    resultTitle: {
      fontSize: 13,
      fontWeight: '500',
    },
    resultValue: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    resultSubtitle: {
      fontSize: 11,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Investment Parameters</Text>
        <InputField
          label="Initial Investment"
          value={inputs.initialInvestment}
          onChangeText={(value) => updateInput('initialInvestment', value)}
          placeholder="100000"
          suffix="KES"
        />
        <InputField
          label="Monthly Contribution"
          value={inputs.monthlyContribution}
          onChangeText={(value) => updateInput('monthlyContribution', value)}
          placeholder="10000"
          suffix="KES"
        />
        <InputField
          label="Annual Return"
          value={inputs.annualReturn}
          onChangeText={(value) => updateInput('annualReturn', value)}
          placeholder="7"
          suffix="%"
        />
        <InputField
          label="Investment Period"
          value={inputs.investmentYears}
          onChangeText={(value) => updateInput('investmentYears', value)}
          placeholder="10"
          suffix="years"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projected Results</Text>
        <View style={styles.resultsGrid}>
          <ResultCard
            title="Future Value"
            value={formatCurrency(results.futureValue)}
            subtitle="Total portfolio value"
            icon={TrendingUp}
          />
          <ResultCard
            title="Total Contributions"
            value={formatCurrency(results.totalContributions)}
            subtitle="Your total investment"
            icon={DollarSign}
          />
          <ResultCard
            title="Interest Earned"
            value={formatCurrency(results.interestEarned)}
            subtitle={`${((results.interestEarned / Math.max(results.totalContributions, 1)) * 100).toFixed(1)}% return`}
            icon={Calculator}
          />
        </View>
      </View>
    </View>
  );
}
