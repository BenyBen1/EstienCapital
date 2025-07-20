import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import { DollarSign, Calculator, TrendingUp } from 'lucide-react-native';

interface LoanInputs {
  loanAmount: string;
  interestRate: string;
  loanTerm: string;
}

interface LoanResults {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}

interface LoanCalculatorProps {
  colors: any;
}

export default function LoanCalculator({ colors }: LoanCalculatorProps) {
  const [inputs, setInputs] = useState<LoanInputs>({
    loanAmount: '500000',
    interestRate: '8.5',
    loanTerm: '25',
  });

  const [results, setResults] = useState<LoanResults>({
    monthlyPayment: 0,
    totalPayment: 0,
    totalInterest: 0,
  });

  // Loan Calculator Logic
  const calculateLoan = () => {
    const loanAmount = parseFloat(inputs.loanAmount) || 0;
    const interestRate = parseFloat(inputs.interestRate) || 0;
    const loanTerm = parseFloat(inputs.loanTerm) || 0;
    
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTerm * 12;
    
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    const totalPayment = monthlyPayment * totalMonths;
    const totalInterest = totalPayment - loanAmount;
    
    return { monthlyPayment, totalPayment, totalInterest };
  };

  // Update calculations when inputs change
  useEffect(() => {
    setResults(calculateLoan());
  }, [inputs]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const updateInput = (field: keyof LoanInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Loan Parameters</Text>
        {/* Input fields would go here */}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Loan Results</Text>
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
