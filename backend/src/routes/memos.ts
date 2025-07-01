import { Router } from 'express';

const router = Router();

const memos = [
  {
    id: '1',
    title: 'Weekly Market Outlook',
    summary: 'A look at the key drivers for the crypto market this week, including macroeconomic trends and upcoming events.',
    content: 'This week, we anticipate continued volatility in the crypto market. Key indicators suggest a potential consolidation phase for Bitcoin, while certain altcoins show bullish signals. We are closely monitoring the upcoming Federal Reserve meeting, as any statements on inflation could significantly impact market sentiment. Our strategy remains focused on long-term value, and we advise clients to avoid short-term speculative trades.',
    author: 'Estien Capital',
    timestamp: 'Oct 16, 2023',
    category: 'Market Analysis',
  },
  {
    id: '2',
    title: 'Understanding Risk Management',
    summary: 'In this note, we cover the basics of risk management and how we apply it to the Digitika Fund.',
    content: 'Risk management is a cornerstone of our investment philosophy at Estien Capital. For the Digitika Fund, we employ several strategies to mitigate risk, including diversification across multiple assets, setting stop-loss orders, and maintaining a cash reserve to capitalize on market dips. We believe that protecting capital is just as important as generating returns. This disciplined approach is designed to provide our clients with sustainable, long-term growth.',
    author: 'Estien Capital',
    timestamp: 'Oct 9, 2023',
    category: 'Education',
  },
];

// GET /api/memos - Get all memos
router.get('/', (req, res) => {
  res.json(memos);
});

// GET /api/memos/:id - Get a single memo by ID
router.get('/:id', (req, res) => {
  const memo = memos.find(m => m.id === req.params.id);
  if (memo) {
    res.json(memo);
  } else {
    res.status(404).json({ error: 'Memo not found' });
  }
});

export default router; 