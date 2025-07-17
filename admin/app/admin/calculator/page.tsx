'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, DollarSign, TrendingUp, Percent, Target, Calendar, PieChart, BarChart3 } from 'lucide-react';

interface CalculatorState {
  // Investment Calculator
  initialInvestment: number;
  monthlyContribution: number;
  annualReturn: number;
  investmentYears: number;
  
  // Loan Calculator
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  
  // Retirement Calculator
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  retirementGoal: number;
  
  // Portfolio Allocation
  stocks: number;
  bonds: number;
  realEstate: number;
  cash: number;
}

interface CalculationResults {
  investment: {
    futureValue: number;
    totalContributions: number;
    interestEarned: number;
  };
  loan: {
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
  };
  retirement: {
    requiredMonthlySavings: number;
    projectedValue: number;
    shortfall: number;
  };
  portfolio: {
    riskScore: number;
    expectedReturn: number;
    riskLevel: string;
  };
}

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<'investment' | 'loan' | 'retirement' | 'portfolio'>('investment');
  const [inputs, setInputs] = useState<CalculatorState>({
    initialInvestment: 10000,
    monthlyContribution: 500,
    annualReturn: 7,
    investmentYears: 10,
    loanAmount: 200000,
    interestRate: 4.5,
    loanTerm: 30,
    currentAge: 30,
    retirementAge: 65,
    currentSavings: 50000,
    retirementGoal: 1000000,
    stocks: 60,
    bonds: 30,
    realEstate: 8,
    cash: 2
  });

  const [results, setResults] = useState<CalculationResults>({
    investment: { futureValue: 0, totalContributions: 0, interestEarned: 0 },
    loan: { monthlyPayment: 0, totalPayment: 0, totalInterest: 0 },
    retirement: { requiredMonthlySavings: 0, projectedValue: 0, shortfall: 0 },
    portfolio: { riskScore: 0, expectedReturn: 0, riskLevel: 'Moderate' }
  });

  // Investment Calculator Logic
  const calculateInvestment = useCallback(() => {
    const { initialInvestment, monthlyContribution, annualReturn, investmentYears } = inputs;
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
  }, [inputs]);

  // Loan Calculator Logic
  const calculateLoan = useCallback(() => {
    const { loanAmount, interestRate, loanTerm } = inputs;
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTerm * 12;
    
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    const totalPayment = monthlyPayment * totalMonths;
    const totalInterest = totalPayment - loanAmount;
    
    return { monthlyPayment, totalPayment, totalInterest };
  }, [inputs]);

  // Retirement Calculator Logic
  const calculateRetirement = useCallback(() => {
    const { currentAge, retirementAge, currentSavings, retirementGoal, annualReturn } = inputs;
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
    
    const shortfall = Math.max(0, retirementGoal - projectedValue);
    
    return { requiredMonthlySavings, projectedValue, shortfall };
  }, [inputs]);

  // Portfolio Risk Calculator Logic
  const calculatePortfolioRisk = useCallback(() => {
    const { stocks, bonds, realEstate, cash } = inputs;
    
    // Risk weights (higher = more risky)
    const riskWeights = { stocks: 0.8, bonds: 0.3, realEstate: 0.6, cash: 0.1 };
    const returnWeights = { stocks: 8, bonds: 4, realEstate: 6, cash: 1 };
    
    const total = stocks + bonds + realEstate + cash;
    const stocksPercent = stocks / total;
    const bondsPercent = bonds / total;
    const realEstatePercent = realEstate / total;
    const cashPercent = cash / total;
    
    const riskScore = (stocksPercent * riskWeights.stocks) + 
                     (bondsPercent * riskWeights.bonds) + 
                     (realEstatePercent * riskWeights.realEstate) + 
                     (cashPercent * riskWeights.cash);
    
    const expectedReturn = (stocksPercent * returnWeights.stocks) + 
                          (bondsPercent * returnWeights.bonds) + 
                          (realEstatePercent * returnWeights.realEstate) + 
                          (cashPercent * returnWeights.cash);
    
    let riskLevel = 'Conservative';
    if (riskScore > 0.6) riskLevel = 'Aggressive';
    else if (riskScore > 0.4) riskLevel = 'Moderate';
    
    return { riskScore: riskScore * 100, expectedReturn, riskLevel };
  }, [inputs]);

  // Update calculations when inputs change
  useEffect(() => {
    const investment = calculateInvestment();
    const loan = calculateLoan();
    const retirement = calculateRetirement();
    const portfolio = calculatePortfolioRisk();
    
    setResults({
      investment,
      loan,
      retirement,
      portfolio
    });
  }, [inputs, calculateInvestment, calculateLoan, calculateRetirement, calculatePortfolioRisk]);

  const updateInput = (field: keyof CalculatorState, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const InputField = ({ 
    label, 
    value, 
    onChange, 
    type = 'number', 
    suffix = '' 
  }: { 
    label: string; 
    value: number; 
    onChange: (value: number) => void; 
    type?: string; 
    suffix?: string; 
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {suffix && (
          <span className="absolute right-3 top-2 text-gray-500 text-sm">{suffix}</span>
        )}
      </div>
    </div>
  );

  const ResultCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color = 'blue' 
  }: { 
    title: string; 
    value: string; 
    subtitle?: string; 
    icon: React.ReactNode; 
    color?: string; 
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 bg-${color}-100 rounded-full`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <Header title="Financial Calculator" subtitle="Advanced calculation tools for investment planning" />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'investment', label: 'Investment', icon: TrendingUp },
              { id: 'loan', label: 'Loan', icon: DollarSign },
              { id: 'retirement', label: 'Retirement', icon: Target },
              { id: 'portfolio', label: 'Portfolio', icon: PieChart }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Investment Calculator */}
          {activeTab === 'investment' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span>Investment Parameters</span>
                  </CardTitle>
                  <CardDescription>Configure your investment scenario</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InputField
                    label="Initial Investment"
                    value={inputs.initialInvestment}
                    onChange={(value) => updateInput('initialInvestment', value)}
                    suffix="$"
                  />
                  <InputField
                    label="Monthly Contribution"
                    value={inputs.monthlyContribution}
                    onChange={(value) => updateInput('monthlyContribution', value)}
                    suffix="$"
                  />
                  <InputField
                    label="Annual Return"
                    value={inputs.annualReturn}
                    onChange={(value) => updateInput('annualReturn', value)}
                    suffix="%"
                  />
                  <InputField
                    label="Investment Period"
                    value={inputs.investmentYears}
                    onChange={(value) => updateInput('investmentYears', value)}
                    suffix="years"
                  />
                </CardContent>
              </Card>

              <div className="space-y-4">
                <ResultCard
                  title="Future Value"
                  value={formatCurrency(results.investment.futureValue)}
                  subtitle="Total portfolio value"
                  icon={<DollarSign className="h-6 w-6 text-green-600" />}
                  color="green"
                />
                <ResultCard
                  title="Total Contributions"
                  value={formatCurrency(results.investment.totalContributions)}
                  subtitle="Your total investment"
                  icon={<Calculator className="h-6 w-6 text-blue-600" />}
                  color="blue"
                />
                <ResultCard
                  title="Interest Earned"
                  value={formatCurrency(results.investment.interestEarned)}
                  subtitle={`${formatNumber((results.investment.interestEarned / results.investment.totalContributions) * 100, 1)}% return`}
                  icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
                  color="purple"
                />
              </div>
            </div>
          )}

          {/* Loan Calculator */}
          {activeTab === 'loan' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <span>Loan Parameters</span>
                  </CardTitle>
                  <CardDescription>Configure your loan scenario</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InputField
                    label="Loan Amount"
                    value={inputs.loanAmount}
                    onChange={(value) => updateInput('loanAmount', value)}
                    suffix="$"
                  />
                  <InputField
                    label="Interest Rate"
                    value={inputs.interestRate}
                    onChange={(value) => updateInput('interestRate', value)}
                    suffix="%"
                  />
                  <InputField
                    label="Loan Term"
                    value={inputs.loanTerm}
                    onChange={(value) => updateInput('loanTerm', value)}
                    suffix="years"
                  />
                </CardContent>
              </Card>

              <div className="space-y-4">
                <ResultCard
                  title="Monthly Payment"
                  value={formatCurrency(results.loan.monthlyPayment)}
                  subtitle="Principal + Interest"
                  icon={<Calendar className="h-6 w-6 text-blue-600" />}
                  color="blue"
                />
                <ResultCard
                  title="Total Payment"
                  value={formatCurrency(results.loan.totalPayment)}
                  subtitle="Over loan lifetime"
                  icon={<DollarSign className="h-6 w-6 text-orange-600" />}
                  color="orange"
                />
                <ResultCard
                  title="Total Interest"
                  value={formatCurrency(results.loan.totalInterest)}
                  subtitle={`${formatNumber((results.loan.totalInterest / inputs.loanAmount) * 100, 1)}% of principal`}
                  icon={<Percent className="h-6 w-6 text-red-600" />}
                  color="red"
                />
              </div>
            </div>
          )}

          {/* Retirement Calculator */}
          {activeTab === 'retirement' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span>Retirement Parameters</span>
                  </CardTitle>
                  <CardDescription>Plan for your retirement goals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InputField
                    label="Current Age"
                    value={inputs.currentAge}
                    onChange={(value) => updateInput('currentAge', value)}
                    suffix="years"
                  />
                  <InputField
                    label="Retirement Age"
                    value={inputs.retirementAge}
                    onChange={(value) => updateInput('retirementAge', value)}
                    suffix="years"
                  />
                  <InputField
                    label="Current Savings"
                    value={inputs.currentSavings}
                    onChange={(value) => updateInput('currentSavings', value)}
                    suffix="$"
                  />
                  <InputField
                    label="Retirement Goal"
                    value={inputs.retirementGoal}
                    onChange={(value) => updateInput('retirementGoal', value)}
                    suffix="$"
                  />
                </CardContent>
              </Card>

              <div className="space-y-4">
                <ResultCard
                  title="Required Monthly Savings"
                  value={formatCurrency(results.retirement.requiredMonthlySavings)}
                  subtitle="To meet your goal"
                  icon={<Target className="h-6 w-6 text-green-600" />}
                  color="green"
                />
                <ResultCard
                  title="Projected Value"
                  value={formatCurrency(results.retirement.projectedValue)}
                  subtitle="At retirement age"
                  icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
                  color="blue"
                />
                <ResultCard
                  title="Years to Retirement"
                  value={`${inputs.retirementAge - inputs.currentAge}`}
                  subtitle="Time to save"
                  icon={<Calendar className="h-6 w-6 text-purple-600" />}
                  color="purple"
                />
              </div>
            </div>
          )}

          {/* Portfolio Calculator */}
          {activeTab === 'portfolio' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    <span>Portfolio Allocation</span>
                  </CardTitle>
                  <CardDescription>Set your asset allocation percentages</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InputField
                    label="Stocks"
                    value={inputs.stocks}
                    onChange={(value) => updateInput('stocks', value)}
                    suffix="%"
                  />
                  <InputField
                    label="Bonds"
                    value={inputs.bonds}
                    onChange={(value) => updateInput('bonds', value)}
                    suffix="%"
                  />
                  <InputField
                    label="Real Estate"
                    value={inputs.realEstate}
                    onChange={(value) => updateInput('realEstate', value)}
                    suffix="%"
                  />
                  <InputField
                    label="Cash"
                    value={inputs.cash}
                    onChange={(value) => updateInput('cash', value)}
                    suffix="%"
                  />
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">
                      Total: {inputs.stocks + inputs.bonds + inputs.realEstate + inputs.cash}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <ResultCard
                  title="Risk Level"
                  value={results.portfolio.riskLevel}
                  subtitle={`Risk Score: ${formatNumber(results.portfolio.riskScore, 1)}/100`}
                  icon={<BarChart3 className="h-6 w-6 text-orange-600" />}
                  color="orange"
                />
                <ResultCard
                  title="Expected Return"
                  value={`${formatNumber(results.portfolio.expectedReturn, 1)}%`}
                  subtitle="Annual expected return"
                  icon={<TrendingUp className="h-6 w-6 text-green-600" />}
                  color="green"
                />
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-medium text-gray-900 mb-4">Asset Allocation</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Stocks', value: inputs.stocks, color: 'bg-blue-500' },
                        { name: 'Bonds', value: inputs.bonds, color: 'bg-green-500' },
                        { name: 'Real Estate', value: inputs.realEstate, color: 'bg-orange-500' },
                        { name: 'Cash', value: inputs.cash, color: 'bg-gray-500' }
                      ].map(({ name, value, color }) => (
                        <div key={name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${color}`}></div>
                            <span className="text-sm font-medium">{name}</span>
                          </div>
                          <span className="text-sm text-gray-600">{value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
