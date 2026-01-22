import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

// AI Service class
class AIService {
  private openaiKey: string | undefined;
  private hasOpenAI: boolean;

  constructor() {
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.hasOpenAI = !!this.openaiKey;
  }

  async recommend(query: string, products: any[] = []) {
    if (this.hasOpenAI) {
      try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: `Based on query "${query}" and products ${JSON.stringify(products.slice(0, 10))}, recommend top 3 products. Return JSON array with product IDs only.`
          }],
          max_tokens: 200
        }, {
          headers: { 'Authorization': `Bearer ${this.openaiKey}` }
        });
        
        const content = response.data.choices[0].message.content;
        return JSON.parse(content);
      } catch (error) {
        console.error('OpenAI error:', error);
        return this.mockRecommend(query, products);
      }
    }
    
    return this.mockRecommend(query, products);
  }

  mockRecommend(query: string, products: any[]) {
    const lowerQuery = query.toLowerCase();
    const keywords = lowerQuery.split(' ').filter(word => word.length > 2);
    
    // Score products based on relevance
    const scored = products.map(product => {
      let score = 0;
      const name = product.name.toLowerCase();
      const description = (product.description || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      
      // Exact matches get highest score
      if (name.includes(lowerQuery)) score += 10;
      if (description.includes(lowerQuery)) score += 8;
      if (category.includes(lowerQuery)) score += 6;
      
      // Keyword matches
      keywords.forEach(keyword => {
        if (name.includes(keyword)) score += 5;
        if (description.includes(keyword)) score += 3;
        if (category.includes(keyword)) score += 2;
      });
      
      // Price preference (lower price gets slight boost)
      if (product.price < 50) score += 1;
      
      return { ...product, score };
    });
    
    // Sort by score and return top 3
    return scored
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(p => p.id);
  }

  async summarizeProduct(product: any) {
    if (this.hasOpenAI) {
      try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: `Summarize this product: ${JSON.stringify(product)}. Return JSON: {summary, pros: [], cons: [], questions: []}`
          }],
          max_tokens: 300
        }, {
          headers: { 'Authorization': `Bearer ${this.openaiKey}` }
        });
        
        const content = response.data.choices[0].message.content;
        return JSON.parse(content);
      } catch (error) {
        return this.mockSummary(product);
      }
    }
    
    return this.mockSummary(product);
  }

  mockSummary(product: any) {
    return {
      summary: `${product.name} is a ${product.category || 'quality'} product priced at ${product.price} CRO. This item offers good value and functionality for its price range.`,
      pros: [
        'Competitive pricing',
        'Good build quality',
        'Popular among users',
        'Fast shipping available'
      ],
      cons: [
        'Limited warranty information',
        'No detailed specifications',
        'Return policy unclear',
        'Stock may be limited'
      ],
      questions: [
        'What is the return policy?',
        'Is shipping included in the price?',
        'What warranty is provided?',
        'Are there bulk discounts available?'
      ]
    };
  }
}

const aiService = new AIService();

// Routes
router.post('/recommend', async (req: Request, res: Response) => {
  try {
    console.log('AI Recommend request:', req.body);
    const { query, products } = req.body;
    
    if (!query || !products) {
      return res.status(400).json({ success: false, error: 'Query and products required' });
    }
    
    const recommendations = await aiService.recommend(query, products);
    console.log('AI Recommendations result:', recommendations);
    
    res.json({ success: true, data: recommendations });
  } catch (error: any) {
    console.error('AI Recommend error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/summary', async (req: Request, res: Response) => {
  try {
    console.log('AI Summary request:', req.body);
    const { product } = req.body;
    
    if (!product) {
      return res.status(400).json({ success: false, error: 'Product data required' });
    }
    
    const summary = await aiService.summarizeProduct(product);
    console.log('AI Summary result:', summary);
    
    res.json({ success: true, data: summary });
  } catch (error: any) {
    console.error('AI Summary error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;