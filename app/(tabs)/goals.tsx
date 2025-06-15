import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { Target, Plus, CreditCard as Edit3, Trash2, Calendar, DollarSign, TrendingUp, X, CircleCheck as CheckCircle, Clock, CircleAlert as AlertCircle, MoveHorizontal as MoreHorizontal, Filter, ChartPie as PieChart } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  linkedInvestment?: string;
  progress: number;
  category: 'emergency' | 'purchase' | 'education' | 'retirement' | 'travel' | 'other';
  priority: 'high' | 'medium' | 'low';
  monthlyContribution?: number;
  image?: string;
}

interface GoalCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export default function GoalsScreen() {
  const { colors } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    category: 'other' as Goal['category'],
    priority: 'medium' as Goal['priority'],
    monthlyContribution: '',
  });

  const goalCategories: GoalCategory[] = [
    {
      id: 'emergency',
      name: 'Emergency Fund',
      icon: 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      color: '#EF4444',
      description: 'Build financial security',
    },
    {
      id: 'purchase',
      name: 'Major Purchase',
      icon: 'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      color: '#3B82F6',
      description: 'Car, house, or other big items',
    },
    {
      id: 'education',
      name: 'Education',
      icon: 'https://images.pexels.com/photos/159844/cellular-education-classroom-159844.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      color: '#10B981',
      description: 'Invest in learning and growth',
    },
    {
      id: 'retirement',
      name: 'Retirement',
      icon: 'https://images.pexels.com/photos/1642228/pexels-photo-1642228.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      color: '#F59E0B',
      description: 'Secure your future',
    },
    {
      id: 'travel',
      name: 'Travel',
      icon: 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      color: '#8B5CF6',
      description: 'Explore the world',
    },
    {
      id: 'other',
      name: 'Other',
      icon: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      color: '#6B7280',
      description: 'Custom financial goal',
    },
  ];

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 200000,
      currentAmount: 85000,
      targetDate: '2024-12-31',
      linkedInvestment: 'Digitika Fund',
      progress: 42.5,
      category: 'emergency',
      priority: 'high',
      monthlyContribution: 15000,
      image: 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      id: '2',
      name: 'New Car',
      targetAmount: 1500000,
      currentAmount: 300000,
      targetDate: '2025-06-30',
      linkedInvestment: 'Digitika Fund',
      progress: 20,
      category: 'purchase',
      priority: 'medium',
      monthlyContribution: 25000,
      image: 'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      id: '3',
      name: 'Children\'s Education',
      targetAmount: 3000000,
      currentAmount: 450000,
      targetDate: '2030-01-01',
      linkedInvestment: 'Digitika Fund',
      progress: 15,
      category: 'education',
      priority: 'high',
      monthlyContribution: 20000,
      image: 'https://images.pexels.com/photos/159844/cellular-education-classroom-159844.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      id: '4',
      name: 'Retirement Fund',
      targetAmount: 5000000,
      currentAmount: 125000,
      targetDate: '2045-01-01',
      linkedInvestment: 'Digitika Fund',
      progress: 2.5,
      category: 'retirement',
      priority: 'medium',
      monthlyContribution: 10000,
      image: 'https://images.pexels.com/photos/1642228/pexels-photo-1642228.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleAddGoal = () => {
    if (!goalForm.name || !goalForm.targetAmount || !goalForm.targetDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const category = goalCategories.find(cat => cat.id === goalForm.category);
    const newGoal: Goal = {
      id: Date.now().toString(),
      name: goalForm.name,
      targetAmount: parseFloat(goalForm.targetAmount),
      currentAmount: 0,
      targetDate: goalForm.targetDate,
      progress: 0,
      category: goalForm.category,
      priority: goalForm.priority,
      monthlyContribution: goalForm.monthlyContribution ? parseFloat(goalForm.monthlyContribution) : undefined,
      image: category?.icon,
    };

    setGoals([...goals, newGoal]);
    setShowAddModal(false);
    resetForm();
    Alert.alert('Success', 'Goal added successfully!');
  };

  const handleDeleteGoal = (id: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setGoals(goals.filter(goal => goal.id !== id));
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setGoalForm({
      name: '',
      targetAmount: '',
      targetDate: '',
      category: 'other',
      priority: 'medium',
      monthlyContribution: '',
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return colors.success;
    if (progress >= 50) return colors.primary;
    if (progress >= 25) return colors.warning;
    return colors.error;
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateDaysLeft = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateMonthsLeft = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffMonths = (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth());
    return Math.max(0, diffMonths);
  };

  const getGoalStats = () => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(goal => goal.progress >= 100).length;
    const inProgressGoals = goals.filter(goal => goal.progress > 0 && goal.progress < 100).length;
    const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

    return {
      totalGoals,
      completedGoals,
      inProgressGoals,
      totalTargetAmount,
      totalCurrentAmount,
      overallProgress,
    };
  };

  const stats = getGoalStats();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Financial Goals
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.card }]}>
              <Filter size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.card }]}>
              <PieChart size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddModal(true)}
            >
              <Plus size={20} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Goals Overview */}
        <View style={styles.overviewSection}>
          <View style={[styles.overviewCard, { backgroundColor: colors.card }]}>
            <View style={styles.overviewHeader}>
              <Text style={[styles.overviewTitle, { color: colors.text }]}>
                Goals Overview
              </Text>
              <TouchableOpacity>
                <MoreHorizontal size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.overviewMainStat}>
              <Text style={[styles.overviewMainValue, { color: colors.primary }]}>
                {stats.overallProgress.toFixed(1)}%
              </Text>
              <Text style={[styles.overviewMainLabel, { color: colors.textSecondary }]}>
                Overall Progress
              </Text>
            </View>

            <View style={styles.overviewStats}>
              <View style={styles.overviewStat}>
                <Text style={[styles.overviewStatValue, { color: colors.text }]}>
                  {stats.totalGoals}
                </Text>
                <Text style={[styles.overviewStatLabel, { color: colors.textSecondary }]}>
                  Total Goals
                </Text>
              </View>
              <View style={styles.overviewStat}>
                <Text style={[styles.overviewStatValue, { color: colors.success }]}>
                  {stats.completedGoals}
                </Text>
                <Text style={[styles.overviewStatLabel, { color: colors.textSecondary }]}>
                  Achieved
                </Text>
              </View>
              <View style={styles.overviewStat}>
                <Text style={[styles.overviewStatValue, { color: colors.warning }]}>
                  {stats.inProgressGoals}
                </Text>
                <Text style={[styles.overviewStatLabel, { color: colors.textSecondary }]}>
                  In Progress
                </Text>
              </View>
            </View>

            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(stats.overallProgress, 100)}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Goals List */}
        <View style={styles.goalsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your Goals
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              {goals.length} active goals
            </Text>
          </View>

          {goals.length === 0 ? (
            <View style={styles.emptyState}>
              <Target size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No goals set yet
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                Create your first financial goal to start tracking your progress
              </Text>
              <TouchableOpacity
                style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowAddModal(true)}
              >
                <Plus size={20} color={colors.background} />
                <Text style={[styles.emptyStateButtonText, { color: colors.background }]}>
                  Create Goal
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            goals.map((goal) => {
              const daysLeft = calculateDaysLeft(goal.targetDate);
              const monthsLeft = calculateMonthsLeft(goal.targetDate);
              const category = goalCategories.find(cat => cat.id === goal.category);
              
              return (
                <TouchableOpacity
                  key={goal.id}
                  style={[styles.goalCard, { backgroundColor: colors.card }]}
                  onPress={() => setSelectedGoal(goal)}
                >
                  <View style={styles.goalHeader}>
                    <View style={styles.goalTitleContainer}>
                      {goal.image && (
                        <Image source={{ uri: goal.image }} style={styles.goalImage} />
                      )}
                      <View style={styles.goalTitleInfo}>
                        <View style={styles.goalTitleRow}>
                          <Text style={[styles.goalName, { color: colors.text }]}>
                            {goal.name}
                          </Text>
                          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(goal.priority) + '20' }]}>
                            <Text style={[styles.priorityText, { color: getPriorityColor(goal.priority) }]}>
                              {goal.priority.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                        {goal.linkedInvestment && (
                          <Text style={[styles.linkedInvestment, { color: colors.textSecondary }]}>
                            Linked to {goal.linkedInvestment}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.goalActions}>
                      <TouchableOpacity style={styles.goalAction}>
                        <Edit3 size={16} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.goalAction}
                        onPress={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 size={16} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.goalAmount}>
                    <Text style={[styles.currentAmount, { color: colors.text }]}>
                      KES {goal.currentAmount.toLocaleString()}
                    </Text>
                    <Text style={[styles.targetAmount, { color: colors.textSecondary }]}>
                      of KES {goal.targetAmount.toLocaleString()}
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(goal.progress, 100)}%`,
                            backgroundColor: getProgressColor(goal.progress),
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressText, { color: getProgressColor(goal.progress) }]}>
                      {goal.progress.toFixed(1)}%
                    </Text>
                  </View>

                  <View style={styles.goalFooter}>
                    <View style={styles.goalDetail}>
                      <Calendar size={16} color={colors.textSecondary} />
                      <Text style={[styles.goalDetailText, { color: colors.textSecondary }]}>
                        {formatDate(goal.targetDate)}
                      </Text>
                    </View>
                    <View style={styles.goalDetail}>
                      <Clock size={16} color={daysLeft < 30 ? colors.error : colors.primary} />
                      <Text style={[styles.goalDetailText, { color: daysLeft < 30 ? colors.error : colors.textSecondary }]}>
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                      </Text>
                    </View>
                  </View>

                  {goal.monthlyContribution && (
                    <View style={[styles.contributionInfo, { backgroundColor: colors.primary + '10' }]}>
                      <DollarSign size={16} color={colors.primary} />
                      <Text style={[styles.contributionText, { color: colors.primary }]}>
                        Monthly: KES {goal.monthlyContribution.toLocaleString()}
                      </Text>
                      {monthsLeft > 0 && (
                        <Text style={[styles.contributionProjection, { color: colors.textSecondary }]}>
                          • {monthsLeft} months to reach goal
                        </Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Create New Goal
              </Text>
              <TouchableOpacity onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Category Selection */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Goal Category
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryContainer}>
                    {goalCategories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryCard,
                          {
                            backgroundColor: goalForm.category === category.id ? colors.primary + '20' : colors.surface,
                            borderColor: goalForm.category === category.id ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => setGoalForm(prev => ({ ...prev, category: category.id as Goal['category'] }))}
                      >
                        <Image source={{ uri: category.icon }} style={styles.categoryIcon} />
                        <Text
                          style={[
                            styles.categoryName,
                            {
                              color: goalForm.category === category.id ? colors.primary : colors.text,
                            },
                          ]}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Goal Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Goal Name *
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={goalForm.name}
                  onChangeText={(value) => setGoalForm(prev => ({ ...prev, name: value }))}
                  placeholder="e.g., Emergency Fund, New Car"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              {/* Target Amount */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Target Amount (KES) *
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={goalForm.targetAmount}
                  onChangeText={(value) => setGoalForm(prev => ({ ...prev, targetAmount: value }))}
                  placeholder="e.g., 500000"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              {/* Target Date */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Target Date *
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={goalForm.targetDate}
                  onChangeText={(value) => setGoalForm(prev => ({ ...prev, targetDate: value }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              {/* Priority */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Priority
                </Text>
                <View style={styles.priorityContainer}>
                  {(['high', 'medium', 'low'] as Goal['priority'][]).map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.priorityButton,
                        {
                          backgroundColor: goalForm.priority === priority ? getPriorityColor(priority) + '20' : colors.surface,
                          borderColor: goalForm.priority === priority ? getPriorityColor(priority) : colors.border,
                        },
                      ]}
                      onPress={() => setGoalForm(prev => ({ ...prev, priority }))}
                    >
                      <Text
                        style={[
                          styles.priorityButtonText,
                          {
                            color: goalForm.priority === priority ? getPriorityColor(priority) : colors.text,
                          },
                        ]}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Monthly Contribution */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Monthly Contribution (Optional)
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={goalForm.monthlyContribution}
                  onChangeText={(value) => setGoalForm(prev => ({ ...prev, monthlyContribution: value }))}
                  placeholder="e.g., 10000"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleAddGoal}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>
                  Create Goal
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Goal Details Modal */}
      <Modal visible={!!selectedGoal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedGoal?.name}
              </Text>
              <TouchableOpacity onPress={() => setSelectedGoal(null)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedGoal && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.goalDetailCard}>
                  <View style={styles.goalDetailHeader}>
                    {selectedGoal.image && (
                      <Image source={{ uri: selectedGoal.image }} style={styles.goalDetailImage} />
                    )}
                    <View style={styles.goalDetailInfo}>
                      <Text style={[styles.goalDetailAmount, { color: colors.text }]}>
                        KES {selectedGoal.currentAmount.toLocaleString()}
                      </Text>
                      <Text style={[styles.goalDetailTarget, { color: colors.textSecondary }]}>
                        of KES {selectedGoal.targetAmount.toLocaleString()}
                      </Text>
                      <View style={[styles.progressBar, { backgroundColor: colors.border, marginTop: 12 }]}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.min(selectedGoal.progress, 100)}%`,
                              backgroundColor: getProgressColor(selectedGoal.progress),
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.goalDetailStats}>
                    <View style={styles.goalDetailStat}>
                      <Text style={[styles.goalDetailStatLabel, { color: colors.textSecondary }]}>
                        Progress
                      </Text>
                      <Text style={[styles.goalDetailStatValue, { color: getProgressColor(selectedGoal.progress) }]}>
                        {selectedGoal.progress.toFixed(1)}%
                      </Text>
                    </View>
                    <View style={styles.goalDetailStat}>
                      <Text style={[styles.goalDetailStatLabel, { color: colors.textSecondary }]}>
                        Days Left
                      </Text>
                      <Text style={[styles.goalDetailStatValue, { color: colors.text }]}>
                        {calculateDaysLeft(selectedGoal.targetDate)}
                      </Text>
                    </View>
                    <View style={styles.goalDetailStat}>
                      <Text style={[styles.goalDetailStatLabel, { color: colors.textSecondary }]}>
                        Remaining
                      </Text>
                      <Text style={[styles.goalDetailStatValue, { color: colors.text }]}>
                        KES {(selectedGoal.targetAmount - selectedGoal.currentAmount).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  >
                    <Plus size={20} color={colors.background} />
                    <Text style={[styles.actionButtonText, { color: colors.background }]}>
                      Add Funds
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
                  >
                    <Edit3 size={20} color={colors.text} />
                    <Text style={[styles.actionButtonText, { color: colors.text }]}>
                      Edit Goal
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  overviewSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  overviewCard: {
    padding: 24,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  overviewMainStat: {
    alignItems: 'center',
    marginBottom: 24,
  },
  overviewMainValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  overviewMainLabel: {
    fontSize: 16,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  overviewStatLabel: {
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalsSection: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  goalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  goalTitleInfo: {
    flex: 1,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  goalName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  linkedInvestment: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  goalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  goalAction: {
    padding: 8,
  },
  goalAmount: {
    marginBottom: 16,
  },
  currentAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  targetAmount: {
    fontSize: 14,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'right',
    marginLeft: 12,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goalDetailText: {
    fontSize: 12,
  },
  contributionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  contributionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contributionProjection: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 24,
  },
  categoryCard: {
    width: 80,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalDetailCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  goalDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  goalDetailImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  goalDetailInfo: {
    flex: 1,
  },
  goalDetailAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  goalDetailTarget: {
    fontSize: 14,
  },
  goalDetailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  goalDetailStat: {
    alignItems: 'center',
  },
  goalDetailStatLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  goalDetailStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 40,
  },
});