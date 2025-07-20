import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Target, TrendingUp, Calculator } from 'lucide-react-native';

interface RetirementInputs {
  currentAge: string;
  retirementAge: string;
  currentSavings: string;
  retirementGoal: string;
  annualReturn: string;
}

interface RetirementResults {
  requiredMonthlySavings: number;
  projectedValue: number;
  yearsToRetirement: number;
}

interface RetirementCalculatorProps {
  colors: any;
}

export default function RetirementCalculator({ colors }: RetirementCalculatorProps) {
  const [inputs, setInputs] = useState<RetirementInputs>({
    currentAge: '30',
    retirementAge: '60',
    currentSavings: '200000',
    retirementGoal: '5000000',
    annualReturn: '7',
  });

  const [results, setResults] = useState<RetirementResults>({
    requiredMonthlySavings: 0,
    projectedValue: 0,
    yearsToRetirement: 0,
  });

  // Retirement Calculator Logic
  const calculateRetirement = () => {
    const currentAge = parseFloat(inputs.currentAge) || 0;
    const retirementAge = parseFloat(inputs.retirementAge) || 0;
    const currentSavings = parseFloat(inputs.currentSavings) || 0;
    const retirementGoal = parseFloat(inputs.retirementGoal) || 0;
    const annualReturn = parseFloat(inputs.annualReturn) || 7;
    
    const yearsToRetirement = retirementAge - currentAge;
    const monthlyRate = annualReturn / 100 / 12;
    const totalMonths = yearsToRetirement * 12;
    
    // Future value of current savings
    const futureValueCurrent = currentSavings * Math.pow(1 + monthlyRate, totalMonths);
    
    // Required future value from monthly contributions
    const requiredFromContributions = retirementGoal - futureValueCurrent;
    
    // Calculate required monthly savings
    const requiredMonthlySavings = requiredFromContributions > 0 ? 
      requiredFromContributions / ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) : 0;
    
    const projectedValue = futureValueCurrent + (requiredMonthlySavings * 
      ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate));
    
    return { requiredMonthlySavings, projectedValue, yearsToRetirement };
  };

  // Update calculations when inputs change
  useEffect(() => {
    setResults(calculateRetirement());
  }, [inputs]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const updateInput = (field: keyof RetirementInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Retirement Parameters</Text>
        {/* Input fields would go here */}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Retirement Planning</Text>
        {/* Result cards would go here */}
      </View>
    </View>
  );
}

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
    marginBottom: 12,
  },
});
