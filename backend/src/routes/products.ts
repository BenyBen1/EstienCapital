import { Router } from 'express';

const router = Router();

const products = [
  {
    id: 'digitika-fund',
    name: 'Digitika Fund',
    description: 'This is a fund focused on investing in a diverse portfolio of cryptocurrencies.',
    objective: 'The fund is designed to provide investors with exposure to the rapidly growing crypto market while mitigating risks through strategic asset allocation and active management.',
    keyFeatures: [
      'Diversified portfolio of leading cryptocurrencies.',
      'Active management by experienced analysts.',
      'Strategic asset allocation to mitigate risk.',
      'Focus on high-growth potential blockchain projects.',
    ],
    riskProfile: 'High Growth / Speculative. Suitable for investors with a high risk tolerance and a long-term investment horizon.',
    additionalDetails: {
      minimumInvestment: 'Contact for details.',
      managementFee: 'Competitive fees apply.',
    },
  },
];

// GET /api/products - Get all investment products
router.get('/', (req, res) => {
  res.json(products);
});

// GET /api/products/:id - Get a single product by ID
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

export default router; 