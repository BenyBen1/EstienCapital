import { Router } from 'express';
import { supabase } from '../index';

const router = Router();

// Get all goals
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    let query = supabase
      .from('goals')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const { data, error, count } = await query
      .range((pageNum - 1) * limitNum, pageNum * limitNum - 1);

    if (error) throw error;

    res.json({
      goals: data,
      total: count,
      page: Number(page),
      totalPages: Math.ceil((count || 0) / Number(limit)),
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Create new goal
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      title,
      description,
      targetAmount,
      currentAmount,
      targetDate,
      priority,
      category,
    } = req.body;

    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .insert([
        {
          user_id: userId,
          title,
          description,
          target_amount: targetAmount,
          current_amount: currentAmount,
          target_date: targetDate,
          priority,
          category,
          status: 'active',
          progress: (currentAmount / targetAmount) * 100,
        },
      ])
      .select()
      .single();

    if (goalError) throw goalError;

    res.status(201).json(goal);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update goal
router.put('/:goalId', async (req, res) => {
  try {
    const { goalId } = req.params;
    const {
      title,
      description,
      targetAmount,
      currentAmount,
      targetDate,
      priority,
      category,
      status,
    } = req.body;

    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .update({
        title,
        description,
        target_amount: targetAmount,
        current_amount: currentAmount,
        target_date: targetDate,
        priority,
        category,
        status,
        progress: (currentAmount / targetAmount) * 100,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .select()
      .single();

    if (goalError) throw goalError;

    res.json(goal);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete goal
router.delete('/:goalId', async (req, res) => {
  try {
    const { goalId } = req.params;

    const { error } = await supabase.from('goals').delete().eq('id', goalId);

    if (error) throw error;

    res.json({ message: 'Goal deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get goal progress
router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (goalsError) throw goalsError;

    // Calculate overall progress
    const totalGoals = goals.length;
    const completedGoals = goals.filter((goal) => goal.progress >= 100).length;
    const averageProgress =
      goals.reduce((sum, goal) => sum + goal.progress, 0) / totalGoals;

    // Group goals by category
    const goalsByCategory = goals.reduce((acc, goal) => {
      if (!acc[goal.category]) {
        acc[goal.category] = {
          total: 0,
          completed: 0,
          progress: 0,
        };
      }
      acc[goal.category].total += 1;
      if (goal.progress >= 100) acc[goal.category].completed += 1;
      acc[goal.category].progress += goal.progress;
      return acc;
    }, {} as Record<string, { total: number; completed: number; progress: number }>);

    // Calculate progress by category
    Object.keys(goalsByCategory).forEach((category) => {
      goalsByCategory[category].progress /= goalsByCategory[category].total;
    });

    res.json({
      totalGoals,
      completedGoals,
      averageProgress,
      goalsByCategory,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Add contribution to goal
router.post('/:goalId/contribute', async (req, res) => {
  try {
    const { goalId } = req.params;
    const { amount } = req.body;

    // Get current goal
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .single();

    if (goalError) throw goalError;

    // Update goal amount and progress
    const newAmount = goal.current_amount + amount;
    const newProgress = (newAmount / goal.target_amount) * 100;

    const { data: updatedGoal, error: updateError } = await supabase
      .from('goals')
      .update({
        current_amount: newAmount,
        progress: newProgress,
        status: newProgress >= 100 ? 'completed' : 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Create contribution record
    const { error: contributionError } = await supabase
      .from('goal_contributions')
      .insert([
        {
          goal_id: goalId,
          amount,
          contribution_date: new Date().toISOString(),
        },
      ]);

    if (contributionError) throw contributionError;

    res.json(updatedGoal);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router; 