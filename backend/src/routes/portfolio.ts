import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// Get user's portfolio
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', req.user!.id);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    res.status(500).json({ error: 'Error fetching portfolio' });
  }
});

export default router; 