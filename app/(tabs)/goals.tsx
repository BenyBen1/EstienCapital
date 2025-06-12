import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Target, Plus, CreditCard as Edit3, Trash2, Calendar, DollarSign, TrendingUp, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  linkedInvestment?: string;
  progress: number;
}

export default function GoalsScreen() {
  const { colors } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 200000,
      currentAmount: 85000,
      targetDate: '2024-12-31',
      linkedInvestment: 'Digitika Fund',
      progress: 42.5,
    },
    {
      id: '2',
      name: 'New Car',
      targetAmount: 1500000,
      currentAmount: 300000,
      targetDate: '2025-06-30',
      linkedInvestment: 'Digitika Fund',
      progress: 20,
    },
    {
      id: '3',
      name: 'Children\'s Education',
      targetAmount: 3000000,
      currentAmount: 450000,
      targetDate: '2030-01-01',
      linkedInvestment: 'Digitika Fund',
      progress: 15,
    },
  ]);

  const handleAddGoal = () => {
    if (!goalName || !targetAmount || !targetDate) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newGoal: Goal = {
      id: Date.now().toString(),
      name: goalName,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      targetDate,
      progress: 0,
    };

    setGoals([...goals, newGoal]);
    setShowAddModal(false);
    setGoalName('');
    setTargetAmount('');
    setTargetDate('');
    
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

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return colors.success;
    if (progress >= 50) return colors.primary;
    if (progress >= 25) return colors.warning;
    return colors.error;
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Financial Goals
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color={colors.background} />
        </TouchableOpacity>
      </View>

      {/* Goals Overview */}
      <View style={styles.overviewSection}>
        <View style={[styles.overviewCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.overviewTitle, { color: colors.text }]}>
            Goals Overview
          </Text>
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewStatValue, { color: colors.primary }]}>
                {goals.length}
              </Text>
              <Text style={[styles.overviewStatLabel, { color: colors.textSecondary }]}>
                Total Goals
              </Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewStatValue, { color: colors.success }]}>
                {goals.filter(goal => goal.progress >= 100).length}
              </Text>
              <Text style={[styles.overviewStatLabel, { color: colors.textSecondary }]}>
                Achieved
              </Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewStatValue, { color: colors.warning }]}>
                {goals.filter(goal => goal.progress < 100 && goal.progress > 0).length}
              </Text>
              <Text style={[styles.overviewStatLabel, { color: colors.textSecondary }]}>
                In Progress
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Goals List */}
      <ScrollView style={styles.goalsList}>
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Target size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No goals set yet
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
              Create your first financial goal to start tracking your progress
            </Text>
          </View>
        ) : (
          goals.map((goal) => (
            <View key={goal.id} style={[styles.goalCard, { backgroundColor: colors.card }]}>
              <View style={styles.goalHeader}>
                <View style={styles.goalTitleContainer}>
                  <Text style={[styles.goalName, { color: colors.text }]}>
                    {goal.name}
                  </Text>
                  {goal.linkedInvestment && (
                    <Text style={[styles.linkedInvestment, { color: colors.textSecondary }]}>
                      Linked to {goal.linkedInvestment}
                    </Text>
                  )}
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
                    Target: {formatDate(goal.targetDate)}
                  </Text>
                </View>
                <View style={styles.goalDetail}>
                  <TrendingUp size={16} color={colors.primary} />
                  <Text style={[styles.goalDetailText, { color: colors.textSecondary }]}>
                    {calculateDaysLeft(goal.targetDate)} days left
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Add New Goal
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Goal Name
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
                  value={goalName}
                  onChangeText={setGoalName}
                  placeholder="e.g., Emergency Fund, New Car"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Target Amount (KES)
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
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  placeholder="e.g., 500000"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Target Date
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
                  value={targetDate}
                  onChangeText={setTargetDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  overviewCard: {
    padding: 24,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  goalsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
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
    marginBottom: 12,
  },
  goalTitleContainer: {
    flex: 1,
  },
  goalName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
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
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'right',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goalDetailText: {
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
    maxHeight: '80%',
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
});